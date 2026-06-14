import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key, { apiVersion: "2025-02-24.acacia" });
  }
  return _stripe;
}

/** True when all Stripe env vars needed for checkout are present */
export function isStripeConfigured(): boolean {
  return !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_PRO_PRICE_ID &&
    process.env.STRIPE_CREATOR_PRICE_ID
  );
}

// Price IDs from Stripe Dashboard — set in env
export const PRICE_IDS = {
  pro: process.env.STRIPE_PRO_PRICE_ID ?? "",
  creator: process.env.STRIPE_CREATOR_PRICE_ID ?? "",
} as const;

export async function getOrCreateCustomer(
  userId: string,
  email: string,
  existingCustomerId?: string | null
): Promise<string> {
  const stripe = getStripe();
  if (existingCustomerId) return existingCustomerId;

  const customer = await stripe.customers.create({
    email,
    metadata: { clerk_user_id: userId },
  });
  return customer.id;
}

export async function createCheckoutSession(opts: {
  customerId: string;
  priceId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    customer: opts.customerId,
    mode: "subscription",
    line_items: [{ price: opts.priceId, quantity: 1 }],
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    metadata: { clerk_user_id: opts.userId },
    subscription_data: {
      metadata: { clerk_user_id: opts.userId },
    },
    allow_promotion_codes: true,
  });
  if (!session.url) throw new Error("No checkout URL returned");
  return session.url;
}

export async function createPortalSession(opts: {
  customerId: string;
  returnUrl: string;
}): Promise<string> {
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: opts.customerId,
    return_url: opts.returnUrl,
  });
  return session.url;
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  return getStripe().webhooks.constructEvent(payload, signature, secret);
}

/** Map a Stripe price ID to our plan slug */
export function planFromPriceId(priceId: string): "pro" | "creator" | "free" {
  if (priceId === PRICE_IDS.pro) return "pro";
  if (priceId === PRICE_IDS.creator) return "creator";
  return "free";
}
