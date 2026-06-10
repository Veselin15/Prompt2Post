import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { deletePost, updatePostCaption } from "@/lib/db";
import { deletePostFiles } from "@/lib/image/storage";

export const runtime = "nodejs";

/** Update editable post metadata (currently: the social caption), owner-scoped. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { caption?: string };
  if (typeof body.caption !== "string" || !body.caption.trim()) {
    return NextResponse.json({ error: "caption is required" }, { status: 400 });
  }

  const updated = await updatePostCaption(id, userId, body.caption.trim().slice(0, 2200));
  if (!updated) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

/** Permanently delete a post (DB row + its stored images/ZIP), scoped to the owner. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const removed = await deletePost(id, userId);
  if (!removed) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Storage cleanup is best-effort — the DB row is the source of truth.
  await deletePostFiles(id).catch(() => {});

  return NextResponse.json({ ok: true });
}
