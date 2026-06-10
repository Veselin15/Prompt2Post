import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getPostById, updatePostSlides } from "@/lib/db";
import { fetchImageBuffer, genDimensions } from "@/lib/image/pollinations";
import { composeSlide } from "@/lib/image/compositor";
import {
  uploadSlideImage,
  uploadSlideBackground,
  readSlideBackground,
  rebuildZip,
} from "@/lib/image/storage";
import { rewriteSlideCopy } from "@/lib/ai/groq";
import { POST_FORMATS, DEFAULT_FORMAT, resolveFormat } from "@/types";
import type { ComposeOptions } from "@/lib/image/compositor";

export const runtime = "nodejs";
export const maxDuration = 120;

type SlideAction = "recompose" | "reimage" | "rewrite";

const MAX_HEADLINE = 90;
const MAX_BODY = 420;
const MAX_KICKER = 40;

function clean(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

/**
 * Edit a single slide of an existing post in place:
 *   • recompose — re-render the text overlay (optionally with edited copy) on the
 *     stored AI background. No new image generation, so it's instant and free.
 *   • reimage   — fetch a fresh AI background (new seed) and composite over it.
 *   • rewrite   — AI rewrites the headline/body (same idea, sharper words), then
 *     re-composites on the stored background. No image-generation call.
 *
 * Either way only this one slide is rewritten — the monthly post quota is untouched.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const post = await getPostById(id);
  if (!post || post.user_id !== userId) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    index?: number;
    action?: SlideAction;
    headline?: string;
    body?: string;
    kicker?: string;
  };

  const index = Number(body.index);
  const action: SlideAction =
    body.action === "reimage" || body.action === "rewrite" ? body.action : "recompose";
  if (!Number.isInteger(index) || index < 0 || index >= post.slides.length) {
    return NextResponse.json({ error: "Invalid slide index" }, { status: 400 });
  }

  const slideNumber = index + 1;
  const structure = post.structure;
  const fmt = POST_FORMATS[resolveFormat(structure?.format)] ?? POST_FORMATS[DEFAULT_FORMAT];

  // Apply any text edits to the target slide.
  const current = post.slides[index];
  const headline = clean(body.headline, MAX_HEADLINE);
  const bodyText = clean(body.body, MAX_BODY);
  const kicker = clean(body.kicker, MAX_KICKER);

  const editedSlide = {
    ...current,
    ...(headline !== undefined ? { headline } : {}),
    ...(bodyText !== undefined ? { body: bodyText } : {}),
    ...(kicker !== undefined ? { kicker } : {}),
  };

  if (!editedSlide.headline?.trim()) {
    return NextResponse.json({ error: "Headline can't be empty" }, { status: 400 });
  }

  try {
    // ── 0. AI rewrite: fresh copy for this slide, same idea sharper words ────
    if (action === "rewrite") {
      const fresh = await rewriteSlideCopy(
        post.topic,
        structure?.tone ?? "",
        current.headline,
        current.body,
        structure?.text_amount ?? "balanced"
      );
      editedSlide.headline = fresh.headline;
      editedSlide.body = fresh.body;
    }

    // ── 1. Obtain the background buffer ──────────────────────────────────────
    let background: Buffer | null = null;

    if (action === "reimage") {
      const genDims = genDimensions(fmt.width, fmt.height);
      const seed = Math.floor(Math.random() * 1_000_000_000);
      background = await fetchImageBuffer(
        editedSlide.image_prompt,
        {
          style: structure?.style ?? "",
          colorMood: structure?.color_mood,
          width: genDims.width,
          height: genDims.height,
        },
        seed
      );
      await uploadSlideBackground(id, slideNumber, background);
    } else {
      // recompose: reuse the stored raw background…
      background = await readSlideBackground(id, slideNumber);
      // …and fall back to a fresh fetch for older posts that never stored one.
      if (!background) {
        const genDims = genDimensions(fmt.width, fmt.height);
        background = await fetchImageBuffer(
          editedSlide.image_prompt,
          {
            style: structure?.style ?? "",
            colorMood: structure?.color_mood,
            width: genDims.width,
            height: genDims.height,
          },
          slideNumber
        );
        await uploadSlideBackground(id, slideNumber, background);
      }
    }

    // ── 2. Composite text using the post's saved design ──────────────────────
    const composeOpts: ComposeOptions = {
      width: fmt.width,
      height: fmt.height,
      template: structure?.template,
      accentColor: structure?.accent_color,
      handle: structure?.handle,
      textAmount: structure?.text_amount,
      fontTheme: structure?.font_theme,
      headlineCase: structure?.headline_case,
      textAlign: structure?.text_align,
    };
    const finalBuf = await composeSlide(background, editedSlide, composeOpts);
    const imageUrl = await uploadSlideImage(id, slideNumber, finalBuf);

    // ── 3. Persist the updated slide (overwrites file in place) ──────────────
    const nextSlides = [...post.slides];
    nextSlides[index] = { ...editedSlide, image_url: imageUrl };

    // Keep the downloadable ZIP in sync when one exists. Best-effort.
    let zipUrl: string | undefined;
    if (post.zip_url) {
      try {
        zipUrl = await rebuildZip(id, post.num_slides);
      } catch {
        /* leave the old ZIP; not worth failing the edit */
      }
    }

    await updatePostSlides(id, nextSlides, zipUrl);

    return NextResponse.json({
      slide: nextSlides[index],
      // version token lets the client cache-bust the overwritten image file
      version: Date.now(),
    });
  } catch (err) {
    console.error("Slide edit error:", err);
    const message = err instanceof Error ? err.message : "Failed to update slide";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
