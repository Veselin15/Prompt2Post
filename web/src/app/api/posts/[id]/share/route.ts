import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { setPostShareToken, clearPostShareToken } from "@/lib/db";

export const runtime = "nodejs";

function shareUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/p/${token}`;
}

/** Enable (or rotate) the public share link for a post, owner-scoped. */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  // 16 random bytes, URL-safe — unguessable but short enough to read aloud.
  const token = randomBytes(16).toString("base64url");

  const updated = await setPostShareToken(id, userId, token);
  if (!updated) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  return NextResponse.json({ token, url: shareUrl(token) });
}

/** Disable the public share link, owner-scoped. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const updated = await clearPostShareToken(id, userId);
  if (!updated) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
