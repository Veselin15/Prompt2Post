import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getPostById, updatePostRepurposed } from "@/lib/db";
import { repurposePost } from "@/lib/ai/groq";
import type { RepurposedContent } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Generate (or regenerate) the cross-platform repurpose pack for a post:
 * a native X/Twitter post, a LinkedIn post, and an Instagram Story hook.
 * Persisted in the post's content JSONB — doesn't touch the monthly quota.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const post = await getPostById(id);
  if (!post || post.user_id !== userId) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const caption = post.content?.social_caption ?? "";
  const headlines = (post.content?.slides ?? post.slides ?? [])
    .map((s) => s.headline)
    .filter(Boolean);

  if (!caption && headlines.length === 0) {
    return NextResponse.json({ error: "Post has no content to repurpose" }, { status: 400 });
  }

  try {
    const pack = await repurposePost(post.topic, caption, headlines);
    const repurposed: RepurposedContent = {
      ...pack,
      generated_at: new Date().toISOString(),
    };
    await updatePostRepurposed(id, userId, repurposed);
    return NextResponse.json({ repurposed });
  } catch (err) {
    console.error("Repurpose failed:", err);
    return NextResponse.json(
      { error: "The AI could not repurpose this post. Please try again." },
      { status: 502 }
    );
  }
}
