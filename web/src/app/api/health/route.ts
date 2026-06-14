import { NextResponse } from "next/server";
import { getPool } from "@/lib/pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/health — liveness + DB readiness probe.
 * Returns 200 when the app can reach Postgres, 503 otherwise. Public (see proxy.ts).
 */
export async function GET() {
  try {
    await getPool().query("SELECT 1");
    return NextResponse.json({ status: "ok", db: "up", time: new Date().toISOString() });
  } catch {
    return NextResponse.json(
      { status: "degraded", db: "down", time: new Date().toISOString() },
      { status: 503 }
    );
  }
}
