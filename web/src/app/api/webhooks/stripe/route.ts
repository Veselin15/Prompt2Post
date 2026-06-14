import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { constructWebhookEvent, getStripe, planFromPriceId, PRICE_IDS } from "@/lib/stripe";
import {
  applySubscription,
  resolveUserForSubscription,
} from "@/lib/billing-sync";
import { getUserByStripeCustomer, updateUserPlan, upsertSubscription, getSubscriptionByUser } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const payload = await req.arrayBuffer();
  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(Buffer.from(payload), sig);
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpsert(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
    }
  } catch (err) {
    console.error(`[webhook] Error handling ${event.type}:`, err);
    // Return 500 so Stripe retries transient failures (DB down, etc.).
    // Config errors (unknown price) are handled without throwing.
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.mode !== "subscription") return;

  const subId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;
  if (!subId) return;

  const sub = await getStripe().subscriptions.retrieve(subId);
  await handleSubscriptionUpsert(sub);
}

async function handleSubscriptionUpsert(sub: Stripe.Subscription) {
  const user = await resolveUserForSubscription(sub);
  if (!user) {
    const customerId =
      typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    console.warn(`[webhook] No user found for Stripe customer ${customerId}`);
    return;
  }

  const plan = await applySubscription(user.id, sub);
  if (plan === "free" && (sub.status === "active" || sub.status === "trialing")) {
    const priceId = sub.items.data[0]?.price.id ?? "";
    console.error(
      `[webhook] Subscription ${sub.id} is active but price ${priceId} is not mapped to any plan. ` +
      `Expected STRIPE_PRO_PRICE_ID=${PRICE_IDS.pro} or STRIPE_CREATOR_PRICE_ID=${PRICE_IDS.creator}.`
    );
  }
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const user = await getUserByStripeCustomer(customerId);
  if (!user) return;

  await upsertSubscription({
    id: sub.id,
    user_id: user.id,
    stripe_customer_id: customerId,
    stripe_price_id: sub.items.data[0]?.price.id ?? "",
    status: "canceled",
    current_period_start: null,
    current_period_end: null,
    cancel_at_period_end: false,
  });

  // Only downgrade if no other active subscription exists for this user.
  const stillActive = await getSubscriptionByUser(user.id);
  if (!stillActive) {
    await updateUserPlan(user.id, "free");
  }
}
