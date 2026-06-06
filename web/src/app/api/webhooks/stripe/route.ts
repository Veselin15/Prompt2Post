import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { constructWebhookEvent, planFromPriceId } from "@/lib/stripe";
import {
  getUserByStripeCustomer,
  updateUserPlan,
  upsertSubscription,
} from "@/lib/db";

export const runtime = "nodejs";

// Disable body parsing so we get the raw buffer for signature verification
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
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpsert(sub);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(sub);
        break;
      }
    }
  } catch (err) {
    console.error(`Error handling ${event.type}:`, err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleSubscriptionUpsert(sub: Stripe.Subscription) {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const priceId = sub.items.data[0]?.price.id ?? "";
  const plan = planFromPriceId(priceId);

  const user = await getUserByStripeCustomer(customerId);
  if (!user) {
    console.warn(`No user found for Stripe customer ${customerId}`);
    return;
  }

  await upsertSubscription({
    id: sub.id,
    user_id: user.id,
    stripe_customer_id: customerId,
    stripe_price_id: priceId,
    status: sub.status,
    current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    cancel_at_period_end: sub.cancel_at_period_end,
  });

  if (sub.status === "active" || sub.status === "trialing") {
    await updateUserPlan(user.id, plan);
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
