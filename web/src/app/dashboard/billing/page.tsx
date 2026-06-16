import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureDbUser } from "@/lib/ensure-user";
import { isStripeConfigured } from "@/lib/stripe";
import BillingClient from "./BillingClient";

export default async function BillingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await ensureDbUser(userId);
  if (!dbUser) redirect("/sign-in");

  return (
    <BillingClient
      currentPlan={dbUser.plan}
      stripeEnabled={isStripeConfigured()}
      hasStripeCustomer={!!dbUser.stripe_customer_id}
    />
  );
}
