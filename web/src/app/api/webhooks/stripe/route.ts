import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { constructWebhookEvent, getStripe } from "@/lib/stripe";
import {
  applySubscription,
  resolveUserForSubscription,
} from "@/lib/billing-sync";
import { getUserByStripeCustomer, updateUserPlan, upsertSubscription } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const payload = await req.arrayBuffer();
  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(Buffer.from(payload), sig);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
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
    console.error(`Error handling ${event.type}:`, err);
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
    console.warn(`No user found for Stripe customer ${customerId}`);
    return;
  }

  try {
    await applySubscription(user.id, sub);
  } catch (err) {
    console.error("Subscription upsert skipped:", err);
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

  await updateUserPlan(user.id, "free");
}
