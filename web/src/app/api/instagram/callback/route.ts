import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { handleOAuthCallback } from "@/lib/instagram";
import { saveInstagramAccount } from "@/lib/db";

/**
 * GET /api/instagram/callback
 * Handles the Facebook Login OAuth redirect. Exchanges the code for tokens,
 * finds the linked Instagram Business Account, saves it to the DB, and
 * redirects back to the originating page.
 */
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return redirect("/sign-in");

  const params = req.nextUrl.searchParams;
  const code   = params.get("code");
  const state  = params.get("state");
  const error  = params.get("error");

  // User denied the Facebook Login dialog
  if (error || !code) {
    return redirect("/dashboard/billing?instagram=denied");
  }

  // Decode state to recover the initiating user + returnTo URL
  let returnTo = "/dashboard/billing";
  let stateUserId = "";
  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
      // Only allow same-site relative paths — never absolute URLs (open redirect)
      if (
        typeof decoded.returnTo === "string" &&
        decoded.returnTo.startsWith("/") &&
        !decoded.returnTo.startsWith("//")
      ) {
        returnTo = decoded.returnTo;
      }
      if (typeof decoded.userId === "string") stateUserId = decoded.userId;
    } catch {
      // Ignore malformed state — fall back to billing page
    }
  }

  // CSRF check: the signed-in user must be the one who initiated the flow,
  // otherwise an attacker could link their Instagram to a victim's account.
  if (!stateUserId || stateUserId !== userId) {
    return redirect("/dashboard/billing?instagram=error&msg=Invalid%20OAuth%20state");
  }

  try {
    const account = await handleOAuthCallback(code);
    await saveInstagramAccount(userId, account);
  } catch (err) {
    const msg = encodeURIComponent(
      err instanceof Error ? err.message : "Instagram connection failed"
    );
    return redirect(`${returnTo}?instagram=error&msg=${msg}`);
  }
  // NB: outside the try — redirect() works by throwing, so calling it inside
  // the try would route the *success* case through the catch's error redirect.
  return redirect(`${returnTo}?instagram=connected`);
}
