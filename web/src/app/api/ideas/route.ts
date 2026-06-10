import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { generateIdeas } from "@/lib/ai/groq";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/ideas — Idea Studio.
 * Body: { niche: string, audience?: string, goal?: string }
 * Returns 6 ready-to-generate content ideas. Does not touch the monthly quota.
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    niche?: string;
    audience?: string;
    goal?: string;
  };

  const niche = typeof body.niche === "string" ? body.niche.trim().slice(0, 300) : "";
  if (!niche) {
    return NextResponse.json({ error: "Tell us your niche first" }, { status: 400 });
  }
  const audience = typeof body.audience === "string" ? body.audience.trim().slice(0, 200) : "";
  const goal = typeof body.goal === "string" ? body.goal.trim().slice(0, 200) : "";

  try {
    const ideas = await generateIdeas(niche, audience, goal);
    return NextResponse.json({ ideas });
  } catch (err) {
    console.error("Idea generation error:", err);
    const message = err instanceof Error ? err.message : "Could not generate ideas";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
