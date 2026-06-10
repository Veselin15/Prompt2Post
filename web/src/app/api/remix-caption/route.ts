import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getPostById } from "@/lib/db";
import { remixCaption } from "@/lib/ai/groq";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/remix-caption — three AI-written alternative captions for a post.
 * Body: { postId: string }
 * Free — does not count against the monthly post quota.
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { postId?: string };
  if (!body.postId) {
    return NextResponse.json({ error: "postId is required" }, { status: 400 });
  }

  const post = await getPostById(body.postId);
  if (!post || post.user_id !== userId) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const caption = post.content?.social_caption ?? "";
  if (!caption) {
    return NextResponse.json({ error: "This post has no caption to remix" }, { status: 400 });
  }

  try {
    const variants = await remixCaption(post.topic, caption);
    return NextResponse.json({ variants });
  } catch (err) {
    console.error("Caption remix error:", err);
    const message = err instanceof Error ? err.message : "Could not remix the caption";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
