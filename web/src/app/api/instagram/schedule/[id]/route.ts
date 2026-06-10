import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { cancelScheduledPost } from "@/lib/db";

export const runtime = "nodejs";

/** DELETE /api/instagram/schedule/{id} — cancel a queued schedule (owner only). */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const canceled = await cancelScheduledPost(id, userId);
  if (!canceled) {
    return NextResponse.json(
      { error: "Schedule not found or no longer cancelable" },
      { status: 404 }
    );
  }
  return NextResponse.json({ ok: true });
}
