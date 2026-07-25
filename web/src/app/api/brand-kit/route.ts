import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { ensureDbUser } from "@/lib/ensure-user";
import { saveUserBrandKit, clearUserBrandKit } from "@/lib/db";
import {
  resolveAccent,
  resolveHandle,
  resolveTextAmount,
  resolveFontTheme,
  resolveHeadlineCase,
  resolveTextAlign,
  resolveLanguage,
  resolveAudience,
  resolveGoal,
  resolveEmoji,
  type BrandKit,
} from "@/types";

export const runtime = "nodejs";

const TONES = ["", "inspirational", "educational", "funny", "dramatic", "professional", "promotional"];
const STYLES = ["", "cinematic", "vibrant", "minimalist", "neon", "vintage", "dreamy", "flat", "bold"];
const FORMATS = ["auto", "square", "portrait", "story", "wide"];
const TEMPLATES = ["auto", "classic", "banner", "quote", "minimal"];

function pick(value: unknown, allowed: string[], fallback: string): string {
  return typeof value === "string" && allowed.includes(value) ? value : fallback;
}

/** GET /api/brand-kit — the signed-in user's saved design defaults. */
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await ensureDbUser(userId);
  return NextResponse.json({ brandKit: dbUser?.brand_kit ?? null });
}

/** PUT /api/brand-kit — save the current design as the user's default style. */
export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await ensureDbUser(userId);
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  const kit: BrandKit = {
    tone: pick(body.tone, TONES, ""),
    style: pick(body.style, STYLES, ""),
    format: pick(body.format, FORMATS, "auto"),
    template: pick(body.template, TEMPLATES, "auto"),
    accent: resolveAccent(body.accent),
    handle: resolveHandle(body.handle),
    textAmount: resolveTextAmount(body.textAmount),
    fontTheme: resolveFontTheme(body.fontTheme),
    headlineCase: resolveHeadlineCase(body.headlineCase),
    textAlign: resolveTextAlign(body.textAlign),
    language: resolveLanguage(body.language),
    audience: resolveAudience(body.audience),
    goal: resolveGoal(body.goal),
    emoji: resolveEmoji(body.emoji),
  };

  await saveUserBrandKit(userId, kit);
  return NextResponse.json({ ok: true, brandKit: kit });
}

/** DELETE /api/brand-kit — reset to factory defaults. */
export async function DELETE() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await clearUserBrandKit(userId);
  return NextResponse.json({ ok: true });
}
