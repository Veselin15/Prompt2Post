import type Stripe from "stripe";
import { getStripe, planFromPriceId } from "@/lib/stripe";
import {
  getUserById,
  getUserByStripeCustomer,
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

  const clerkId = sub.metadata?.clerk_user_id;
  if (clerkId) {
    user = await getUserById(clerkId);
    if (user) {
      await updateUserStripeId(clerkId, customerId);
      return user;
    }
  }

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
      `Stripe price ${priceId} is not mapped — set STRIPE_PRO_PRICE_ID / STRIPE_CREATOR_PRICE_ID to match your Stripe products.`
    );
    throw new Error(`Unknown Stripe price: ${priceId}`);
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

/** Pull the user's active Stripe subscription and sync plan to the DB. */
export async function syncUserSubscriptionFromStripe(
  userId: string,
  customerId: string
): Promise<{ plan: Plan; synced: boolean; error?: string; priceId?: string }> {
  const stripe = getStripe();

  for (const status of ["active", "trialing"] as const) {
    const { data } = await stripe.subscriptions.list({
      customer: customerId,
      status,
      limit: 1,
    });
    const sub = data[0];
    if (!sub) continue;

    try {
      const plan = await applySubscription(userId, sub);
      return { plan, synced: true };
    } catch (err) {
      const priceId = sub.items.data[0]?.price.id ?? "";
      return {
        plan: "free",
        synced: false,
        error: err instanceof Error ? err.message : "sync_failed",
        priceId,
      };
    }
  }

  await updateUserPlan(userId, "free");
  return { plan: "free", synced: true };
}
