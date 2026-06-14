import type Stripe from "stripe";
import { getStripe, planFromPriceId } from "@/lib/stripe";
import {
  getUserById,
  getUserByStripeCustomer,
  getSubscriptionByUser,
  updateUserPlan,
  updateUserStripeId,
  upsertSubscription,
} from "@/lib/db";
import type { Plan } from "@/types";

/** Resolve a DB user from a Stripe subscription (customer id + metadata fallbacks). */
export async function resolveUserForSubscription(
  sub: Stripe.Subscription
): Promise<Awaited<ReturnType<typeof getUserById>>> {
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  let user = await getUserByStripeCustomer(customerId);
  if (user) return user;

  // Fallback 1: clerk_user_id in subscription metadata (set at checkout creation).
  const clerkId = sub.metadata?.clerk_user_id;
  if (clerkId) {
    user = await getUserById(clerkId);
    if (user) {
      await updateUserStripeId(clerkId, customerId);
      return user;
    }
  }

  // Fallback 2: clerk_user_id in customer metadata.
  try {
    const customer = await getStripe().customers.retrieve(customerId);
    if (!customer.deleted && customer.metadata?.clerk_user_id) {
      user = await getUserById(customer.metadata.clerk_user_id);
      if (user) {
        await updateUserStripeId(user.id, customerId);
        return user;
      }
    }
  } catch (err) {
    console.error("Failed to resolve Stripe customer metadata:", err);
  }

  return null;
}

/** Apply subscription state from Stripe into Postgres. */
export async function applySubscription(
  userId: string,
  sub: Stripe.Subscription
): Promise<Plan> {
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const priceId = sub.items.data[0]?.price.id ?? "";
  const plan = planFromPriceId(priceId);

  if (
    (sub.status === "active" || sub.status === "trialing") &&
    plan === "free" &&
    priceId
  ) {
    console.error(
      `[billing] Stripe price ${priceId} is not mapped. Set STRIPE_PRO_PRICE_ID / STRIPE_CREATOR_PRICE_ID. Skipping plan update.`
    );
    // Return "free" without updating DB — let the caller decide whether to retry.
    return "free";
  }

  await upsertSubscription({
    id: sub.id,
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_price_id: priceId,
    status: sub.status,
    current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    cancel_at_period_end: sub.cancel_at_period_end,
  });

  if (sub.status === "active" || sub.status === "trialing") {
    await updateUserPlan(userId, plan);
    return plan;
  }

  return "free";
}

/**
 * Pull the user's active Stripe subscription and sync plan to the DB.
 * NEVER downgrades the user if no active subscription is found during a sync call —
 * only the subscription.deleted webhook should downgrade.
 */
export async function syncUserSubscriptionFromStripe(
  userId: string,
  customerId: string
): Promise<{ plan: Plan; synced: boolean; error?: string; priceId?: string }> {
  const stripe = getStripe();

  for (const status of ["active", "trialing"] as const) {
    const { data } = await stripe.subscriptions.list({
      customer: customerId,
      status,
      limit: 5,
    });

    for (const sub of data) {
      const priceId = sub.items.data[0]?.price.id ?? "";
      const plan = planFromPriceId(priceId);
      if (plan === "free" && priceId) {
        return {
          plan: "free",
          synced: false,
          error: `Unknown Stripe price: ${priceId}`,
          priceId,
        };
      }
      const resolved = await applySubscription(userId, sub);
      if (resolved !== "free") {
        return { plan: resolved, synced: true };
      }
    }
  }

  // No active subscription found — do NOT downgrade here.
  // The subscription.deleted webhook is responsible for downgrades.
  return { plan: "free", synced: false, error: "no_active_subscription" };
}

/**
 * Check if a Stripe customer already has an active/trialing subscription.
 * Used to prevent duplicate checkout sessions.
 */
export async function getActiveStripeSubscription(
  customerId: string
): Promise<Stripe.Subscription | null> {
  const stripe = getStripe();
  for (const status of ["active", "trialing"] as const) {
    const { data } = await stripe.subscriptions.list({
      customer: customerId,
      status,
      limit: 1,
    });
    if (data[0]) return data[0];
  }
  return null;
}
