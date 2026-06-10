import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { ensureDbUser } from "@/lib/ensure-user";
import { getPostById, createScheduledPost, getScheduledPostsByUser } from "@/lib/db";
import { isInstagramConfigured } from "@/lib/instagram";
import { PLAN_LIMITS } from "@/types";

export const runtime = "nodejs";

const MIN_LEAD_MS = 2 * 60 * 1000;            // at least 2 minutes from now
const MAX_LEAD_MS = 90 * 24 * 60 * 60 * 1000; // at most 90 days out

/**
 * POST /api/instagram/schedule — queue a post for automatic publishing (Creator).
 * Body: { postId: string, caption: string, scheduledFor: string (ISO date) }
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isInstagramConfigured()) {
    return NextResponse.json({ error: "Instagram integration is not configured." }, { status: 503 });
  }

  const dbUser = await ensureDbUser(userId);
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (!PLAN_LIMITS[dbUser.plan].instagram_scheduling) {
    return NextResponse.json(
      { error: "Post scheduling requires the Creator plan." },
      { status: 403 }
    );
  }
  if (!dbUser.instagram_user_id || !dbUser.instagram_access_token) {
    return NextResponse.json(
      { error: "No Instagram account connected. Please connect your account first." },
      { status: 400 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    postId?: string;
    caption?: string;
    scheduledFor?: string;
  };

  if (!body.postId) {
    return NextResponse.json({ error: "postId is required" }, { status: 400 });
  }

  const when = new Date(body.scheduledFor ?? "");
  if (Number.isNaN(when.getTime())) {
    return NextResponse.json({ error: "Invalid scheduled time" }, { status: 400 });
  }
  const lead = when.getTime() - Date.now();
  if (lead < MIN_LEAD_MS) {
    return NextResponse.json(
      { error: "Pick a time at least 2 minutes in the future" },
      { status: 400 }
    );
  }
  if (lead > MAX_LEAD_MS) {
    return NextResponse.json(
      { error: "Posts can be scheduled at most 90 days ahead" },
      { status: 400 }
    );
  }

  const post = await getPostById(body.postId);
  if (!post || post.user_id !== userId) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const imageUrls = post.slides
    .map((s) => s.image_url)
    .filter((u): u is string => !!u && u.startsWith("https://"));
  if (imageUrls.length === 0) {
    return NextResponse.json(
      { error: "This post has no public HTTPS image URLs — Instagram requires them." },
      { status: 400 }
    );
  }

  const caption = typeof body.caption === "string" ? body.caption.slice(0, 2200) : "";

  const scheduled = await createScheduledPost({
    user_id: userId,
    post_id: post.id,
    caption,
    image_urls: imageUrls.slice(0, 10),
    scheduled_for: when,
  });

  return NextResponse.json({ scheduled });
}

/** GET /api/instagram/schedule — the signed-in user's schedule queue. */
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const scheduled = await getScheduledPostsByUser(userId);
  return NextResponse.json({ scheduled });
}
