import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { buildOAuthUrl, isInstagramConfigured } from "@/lib/instagram";
import { ensureDbUser } from "@/lib/ensure-user";
import { PLAN_LIMITS } from "@/types";

/**
 * GET /api/instagram/connect
 * Initiates the Facebook Login OAuth flow for Instagram posting.
 * Only available to Pro and Creator users.
 *
 * Optional query param: `return_to` (URL to redirect back to after connecting)
 */
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return redirect("/sign-in");

  if (!isInstagramConfigured()) {
    return redirect("/dashboard/billing?error=instagram_not_configured");
  }

  const dbUser = await ensureDbUser(userId);
  if (!dbUser) return redirect("/sign-in");

  const limits = PLAN_LIMITS[dbUser.plan];
  if (!limits.instagram_posting) {
    return redirect("/dashboard/billing?error=instagram_plan_required");
  }

  const returnTo = req.nextUrl.searchParams.get("return_to") ?? "/dashboard/billing";
  // Encode userId + returnTo in the state parameter for the callback
  const state = Buffer.from(JSON.stringify({ userId, returnTo })).toString("base64url");

  return redirect(buildOAuthUrl(state));
}
