import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createPortalSession, isStripeConfigured } from "@/lib/stripe";
import { getUserById } from "@/lib/db";
import { getAppBaseUrl } from "@/lib/app-url";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Billing is not configured yet" }, { status: 503 });
  }

  const dbUser = await getUserById(userId);
  if (!dbUser?.stripe_customer_id) {
    return NextResponse.json({ error: "No billing account found" }, { status: 400 });
  }

  const base = getAppBaseUrl(req);
  const url = await createPortalSession({
    customerId: dbUser.stripe_customer_id,
    returnUrl: `${base}/dashboard/billing`,
  });

  return NextResponse.json({ url });
}
