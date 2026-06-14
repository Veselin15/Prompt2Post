import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureDbUser } from "@/lib/ensure-user";
import { isStripeConfigured } from "@/lib/stripe";
import { isInstagramConfigured } from "@/lib/instagram";
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
      instagramConnected={!!dbUser.instagram_user_id}
      instagramUsername={dbUser.instagram_username}
      instagramConfigured={isInstagramConfigured()}
    />
  );
}
