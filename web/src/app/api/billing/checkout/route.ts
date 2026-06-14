import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  createCheckoutSession,
  getOrCreateCustomer,
  isStripeConfigured,
  PRICE_IDS,
} from "@/lib/stripe";
import { getUserById, updateUserStripeId } from "@/lib/db";
import { getAppBaseUrl } from "@/lib/app-url";
import { getActiveStripeSubscription } from "@/lib/billing-sync";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Billing is not configured yet" }, { status: 503 });
  }

  const { plan } = await req.json();
  if (plan !== "pro" && plan !== "creator") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const planKey = plan as keyof typeof PRICE_IDS;
  const priceId = PRICE_IDS[planKey];
  if (!priceId) {
    return NextResponse.json(
      { error: `Price ID for '${plan}' is not configured` },
      { status: 500 }
    );
  }

  const clerkUser = await currentUser();
  if (!clerkUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const dbUser = await getUserById(userId);

  // Guard: if the user already has this plan in DB, reject immediately.
  if (dbUser?.plan === plan) {
    return NextResponse.json(
      { error: `You are already on the ${plan} plan.` },
      { status: 409 }
    );
  }

  const customerId = await getOrCreateCustomer(
    userId,
    email,
    dbUser?.stripe_customer_id
  );

  if (!dbUser?.stripe_customer_id) {
    await updateUserStripeId(userId, customerId);
  }

  // Guard: if Stripe already has an active subscription for this customer,
  // redirect to the customer portal to change plan instead of creating a new one.
  const existingSub = await getActiveStripeSubscription(customerId);
  if (existingSub) {
    const base = getAppBaseUrl(req);
    return NextResponse.json({ redirect_to_portal: true, returnUrl: `${base}/dashboard/billing` }, { status: 200 });
  }

  const base = getAppBaseUrl(req);
  const checkoutUrl = await createCheckoutSession({
    customerId,
    priceId,
    userId,
    successUrl: `${base}/dashboard/billing?success=1`,
    cancelUrl: `${base}/dashboard/billing?canceled=1`,
  });

  return NextResponse.json({ url: checkoutUrl });
}
