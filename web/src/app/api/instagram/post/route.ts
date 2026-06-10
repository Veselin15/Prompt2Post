import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { ensureDbUser } from "@/lib/ensure-user";
import { PLAN_LIMITS } from "@/types";
import { postToInstagram, isInstagramConfigured } from "@/lib/instagram";

interface PostBody {
  imageUrls: string[];   // public Supabase Storage URLs
  caption: string;       // AI caption + hashtags (user may have edited it)
}

/**
 * POST /api/instagram/post
 * Publishes a generated post (single image or carousel) to the user's connected
 * Instagram Business/Creator account.
 *
 * Body: { imageUrls: string[], caption: string }
 * Returns: { mediaId: string } on success
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isInstagramConfigured()) {
    return NextResponse.json({ error: "Instagram integration is not configured." }, { status: 503 });
  }

  const dbUser = await ensureDbUser(userId);
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Plan gate
  const limits = PLAN_LIMITS[dbUser.plan];
  if (!limits.instagram_posting) {
    return NextResponse.json(
      { error: "Instagram posting requires a Pro or Creator plan." },
      { status: 403 }
    );
  }

  // Token check
  if (!dbUser.instagram_user_id || !dbUser.instagram_access_token) {
    return NextResponse.json(
      { error: "No Instagram account connected. Please connect your account first." },
      { status: 400 }
    );
  }

  let body: PostBody;
  try {
    body = await req.json() as PostBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { imageUrls, caption } = body;
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    return NextResponse.json({ error: "imageUrls must be a non-empty array" }, { status: 400 });
  }
  if (typeof caption !== "string") {
    return NextResponse.json({ error: "caption must be a string" }, { status: 400 });
  }

  // Validate all URLs are HTTPS (Instagram API requirement)
  for (const url of imageUrls) {
    if (!url.startsWith("https://")) {
      return NextResponse.json(
        { error: `Image URLs must be public HTTPS URLs. Got: ${url.slice(0, 60)}` },
        { status: 400 }
      );
    }
  }

  try {
    const result = await postToInstagram(
      dbUser.instagram_user_id,
      dbUser.instagram_access_token,
      imageUrls,
      caption
    );
    return NextResponse.json({ mediaId: result.mediaId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Instagram publishing failed";

    // Token is likely revoked — clear it so the user reconnects
    const isAuthError =
      message.toLowerCase().includes("token") ||
      message.toLowerCase().includes("session") ||
      message.toLowerCase().includes("oauth") ||
      message.toLowerCase().includes("permission");

    return NextResponse.json(
      {
        error: message,
        tokenInvalid: isAuthError,
      },
      { status: 422 }
    );
  }
}
