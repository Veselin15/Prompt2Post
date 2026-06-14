import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { syncUserSubscriptionFromStripe } from "@/lib/billing-sync";
import { getUserById } from "@/lib/db";
import { isStripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * POST /api/billing/sync — reconcile plan from Stripe after checkout or on demand.
 * Fallback when webhooks are delayed/misconfigured.
 */
export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Billing is not configured" }, { status: 503 });
  }

  const dbUser = await getUserById(userId);
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (!dbUser.stripe_customer_id) {
    return NextResponse.json({ plan: dbUser.plan, synced: false, error: "no_stripe_customer" });
  }

  const result = await syncUserSubscriptionFromStripe(userId, dbUser.stripe_customer_id);
  return NextResponse.json(result);
}
