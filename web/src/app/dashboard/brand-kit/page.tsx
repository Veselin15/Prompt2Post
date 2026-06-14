import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureDbUser } from "@/lib/ensure-user";
import { PLAN_LIMITS } from "@/types";
import type { Plan } from "@/types";
import BrandKitClient from "./BrandKitClient";

export default async function BrandKitPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await ensureDbUser(userId);
  if (!dbUser) redirect("/sign-in");

  const planKey = (
    ["free", "pro", "creator"].includes(dbUser.plan) ? dbUser.plan : "free"
  ) as Plan;

  return (
    <BrandKitClient
      planKey={planKey}
      limits={PLAN_LIMITS[planKey]}
      initialKit={dbUser.brand_kit}
    />
  );
}
