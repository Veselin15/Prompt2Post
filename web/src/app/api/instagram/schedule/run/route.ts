import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { publishDueScheduledPosts } from "@/lib/scheduler";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * GET /api/instagram/schedule/run — publish every due scheduled post.
 *
 * Two ways in:
 *   • Cron (production): `Authorization: Bearer ${CRON_SECRET}` — runs all users.
 *     Vercel Cron sends this header automatically when CRON_SECRET is set.
 *   • A signed-in user: runs only that user's due posts (local-dev fallback).
 */
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    const result = await publishDueScheduledPosts();
    return NextResponse.json(result);
  }

  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await publishDueScheduledPosts(userId);
  return NextResponse.json(result);
}
