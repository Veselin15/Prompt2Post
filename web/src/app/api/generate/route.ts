import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { planStructure, developBrief, writeContent } from "@/lib/ai/groq";
import { fetchImageBuffer, genDimensions } from "@/lib/image/pollinations";
import { composeSlide } from "@/lib/image/compositor";
import { composeOutroSlide } from "@/lib/image/outro";
import { uploadSlideImage, uploadSlideBackground, uploadZip, deletePostFiles } from "@/lib/image/storage";
import {
  createPost,
  deletePost,
  incrementUserPostCount,
  decrementUserPostCount,
  updatePostSlides,
} from "@/lib/db";
import { ensureDbUser } from "@/lib/ensure-user";
import {
  PLAN_LIMITS,
  POST_FORMATS,
  DEFAULT_FORMAT,
  resolveAccent,
  resolveHandle,
  resolveTextAmount,
  resolveFontTheme,
  resolveHeadlineCase,
  resolveTextAlign,
  resolveFormat,
  resolveTemplate,
  resolveLanguage,
  resolveAudience,
  resolveGoal,
  resolveEmoji,
} from "@/types";
import type { GenerateEvent, SlideData } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 min for Vercel Pro; free = 60s

function sse(event: GenerateEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response(sse({ type: "error", error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const {
    topic, tone, style, numSlides, format, template, accentColor, handle,
    textAmount, fontTheme, headlineCase, textAlign, language,
    audience, goal, emoji,
  } = await req.json();
  if (!topic?.trim()) {
    return new Response(sse({ type: "error", error: "Topic is required" }), {
      status: 400,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const enc = new TextEncoder();

  const send = async (event: GenerateEvent) => {
    await writer.write(enc.encode(sse(event)));
  };

  // Run the pipeline async so we can stream.
  // These live outside the try so the catch can clean up / refund on failure.
  let createdPost: { id: string } | null = null;
  let allSlides: SlideData[] = [];
  let composedSlides: SlideData[] = [];

  (async () => {
    try {
      // ── 1. Check plan limits ──────────────────────────────────────────────
      await send({ type: "status", message: "Checking plan limits…", progress: 2 });
      const dbUser = await ensureDbUser(userId);
      if (!dbUser) {
        await send({ type: "error", error: "User not found. Please sign out and back in." });
        return;
      }

      const limits = PLAN_LIMITS[dbUser.plan];
      if (dbUser.posts_this_month >= limits.posts_per_month) {
        await send({
          type: "error",
          error: `You've reached your ${limits.posts_per_month} posts/month limit on the ${limits.label} plan. Upgrade to continue.`,
        });
        return;
      }

      const clampedSlides = numSlides
        ? Math.min(Number(numSlides), limits.max_slides)
        : undefined;

      // Gate format/template hints: only forward them to the planner if the
      // user's plan allows the requested value — otherwise let AI auto-pick.
      const hintFormat = limits.formats.includes(resolveFormat(format))
        ? (format as string)
        : "";
      const hintTemplate = limits.templates.includes(resolveTemplate(template))
        ? (template as string)
        : "";

      // ── 2. Plan structure ─────────────────────────────────────────────────
      await send({ type: "status", message: "AI is planning your post structure…", progress: 8 });
      const structure = await planStructure(topic, {
        tone,
        style,
        numSlides: clampedSlides,
        format: hintFormat,
        template: hintTemplate,
      });

      // Hard-gate: even if the AI picked a gated value, clamp to plan limits.
      if (!limits.formats.includes(structure.format)) structure.format = DEFAULT_FORMAT;
      if (!limits.templates.includes(structure.template)) structure.template = "classic";

      // User customisations (not LLM-decided) — applied on top of the plan,
      // but only when the plan allows the requested feature.
      structure.accent_color = resolveAccent(accentColor);
      structure.handle = limits.watermark ? resolveHandle(handle) : "";
      structure.text_amount = limits.text_amounts.includes(resolveTextAmount(textAmount))
        ? resolveTextAmount(textAmount)
        : "balanced";
      structure.font_theme = limits.font_themes.includes(resolveFontTheme(fontTheme))
        ? resolveFontTheme(fontTheme)
        : "modern";
      structure.headline_case = resolveHeadlineCase(headlineCase);
      structure.text_align = resolveTextAlign(textAlign);

      // Copy-steering context (who it's for, what it should achieve, emoji level).
      // Stored on the structure so per-slide re-writes stay on-brief.
      const steerAudience = resolveAudience(audience);
      const steerGoal = resolveGoal(goal);
      const steerEmoji = resolveEmoji(emoji);
      structure.audience = steerAudience;
      structure.goal = steerGoal;
      structure.emoji = steerEmoji;
      await send({ type: "structure", structure, progress: 16 });

      // ── 3a. Creative brief ───────────────────────────────────────────────
      // Research + art-direction pass: specific facts, a real arc, and ONE
      // cohesive visual world. Grounds the writer for sharper copy + better,
      // more consistent imagery. Resilient — returns null if it can't run.
      await send({ type: "status", message: "AI is researching the sharpest angle…", progress: 18 });
      const brief = await developBrief(topic, {
        tone: structure.tone,
        style: structure.style,
        numSlides: structure.num_slides,
        colorMood: structure.color_mood,
        language: resolveLanguage(language),
        audience: steerAudience,
        goal: steerGoal,
      });

      // ── 3b. Write creative content ────────────────────────────────────────
      await send({ type: "status", message: "AI is writing creative content…", progress: 24 });
      const content = await writeContent(
        topic,
        structure.tone,
        structure.style,
        structure.post_type,
        structure.num_slides,
        structure.color_mood,
        structure.text_amount,
        resolveLanguage(language),
        brief,
        { audience: steerAudience, goal: steerGoal, emoji: steerEmoji }
      );
      const { slides: rawSlides, ...contentMeta } = content;
      await send({ type: "content", content: contentMeta, progress: 32 });

      // ── 4. Create DB record early so we have a post ID ───────────────────
      const post = await createPost({
        user_id: userId,
        topic,
        tone: structure.tone,
        style: structure.style,
        post_type: structure.post_type,
        num_slides: structure.num_slides,
        structure,
        content,
        slides: rawSlides,
      });
      createdPost = post;
      allSlides = rawSlides;

      await incrementUserPostCount(userId);

      // ── 5. Generate + compose slides ──────────────────────────────────────
      const total = rawSlides.length;
      // Free plans get a branded closing slide appended, so the count the UI
      // counts toward is one higher than the number of AI-generated slides.
      const outroCount = limits.outro_branding ? 1 : 0;
      const displayTotal = total + outroCount;
      // Pre-allocate so parallel writes land in the right index slots
      composedSlides = new Array(total);
      const imageBuffers: { name: string; data: Buffer }[] = new Array(total);

      const fmt = POST_FORMATS[structure.format] ?? POST_FORMATS[DEFAULT_FORMAT];
      const genDims = genDimensions(fmt.width, fmt.height);

      const progressBase = 34;
      const progressPerSlide = 56 / total;

      /** Process a single slide: fetch → composite → upload → emit SSE. */
      const processSlide = async (slide: SlideData, i: number) => {
        await send({
          type: "status",
          message: `Generating image ${i + 1}/${total}…`,
          progress: Math.round(progressBase + i * progressPerSlide),
        });

        const rawBuf = await fetchImageBuffer(
          slide.image_prompt,
          {
            style: structure.style,
            colorMood: structure.color_mood,
            width: genDims.width,
            height: genDims.height,
          },
          i + 1
        );

        // Keep the raw AI background so the user can later re-edit this slide's
        // copy and re-composite without spending another image generation.
        await uploadSlideBackground(post.id, i + 1, rawBuf);

        const finalBuf = await composeSlide(rawBuf, slide, {
          width: fmt.width,
          height: fmt.height,
          template: structure.template,
          accentColor: structure.accent_color,
          handle: structure.handle,
          textAmount: structure.text_amount,
          fontTheme: structure.font_theme,
          headlineCase: structure.headline_case,
          textAlign: structure.text_align,
        });

        const imageUrl = await uploadSlideImage(post.id, i + 1, finalBuf);
        imageBuffers[i] = { name: `slide_${String(i + 1).padStart(2, "0")}.jpg`, data: finalBuf };

        const composedSlide: SlideData = { ...slide, image_url: imageUrl };
        composedSlides[i] = composedSlide;

        await send({
          type: "slide",
          slide: { ...composedSlide, index: i, total: displayTotal },
          progress: Math.round(progressBase + (i + 1) * progressPerSlide),
        });
      };

      if (limits.priority) {
        // ⚡ Creator — all images in parallel (true priority benefit)
        await send({
          type: "status",
          message: "⚡ Priority — generating all images in parallel…",
          progress: 34,
        });
        // allSettled: let every slide finish before surfacing the first error,
        // so the catch block sees the true partial-success state.
        const results = await Promise.allSettled(
          rawSlides.map((slide, i) => processSlide(slide, i))
        );
        const failure = results.find(
          (r): r is PromiseRejectedResult => r.status === "rejected"
        );
        if (failure) throw failure.reason;
      } else {
        // Free / Pro — sequential generation
        for (let i = 0; i < rawSlides.length; i++) {
          await processSlide(rawSlides[i], i);
        }
      }

      // ── 5b. Branded outro slide (free plan) ───────────────────────────────
      // Rendered locally from vector paths — no image API call, so it costs
      // nothing and adds ~no time. Purely additive: a failure here must never
      // sink an otherwise-successful generation.
      if (outroCount) {
        try {
          await send({ type: "status", message: "Adding your closing slide…", progress: 90 });
          const outroIndex = composedSlides.length;
          const outroBuf = await composeOutroSlide({
            width: fmt.width,
            height: fmt.height,
            accentColor: structure.accent_color,
          });
          const outroUrl = await uploadSlideImage(post.id, outroIndex + 1, outroBuf);
          imageBuffers.push({
            name: `slide_${String(outroIndex + 1).padStart(2, "0")}.jpg`,
            data: outroBuf,
          });

          const outroSlide: SlideData = {
            slide_number: outroIndex + 1,
            headline: "",
            body: "",
            image_prompt: "",
            text_position: "center",
            text_size: "medium",
            image_url: outroUrl,
            is_outro: true,
          };
          composedSlides.push(outroSlide);

          await send({
            type: "slide",
            slide: { ...outroSlide, index: outroIndex, total: displayTotal },
            progress: 91,
          });
        } catch (outroErr) {
          console.error("Outro slide failed (continuing without it):", outroErr);
        }
      }

      // ── 6. Build ZIP (Pro+ only) ───────────────────────────────────────────
      let zipUrl: string | undefined;
      if (PLAN_LIMITS[dbUser.plan].zip_download) {
        await send({ type: "status", message: "Creating ZIP archive…", progress: 92 });
        zipUrl = await uploadZip(post.id, imageBuffers);
      }

      // ── 7. Persist final state ─────────────────────────────────────────────
      await updatePostSlides(post.id, composedSlides, zipUrl);

      await send({
        type: "done",
        progress: 100,
        post: { ...post, slides: composedSlides, zip_url: zipUrl ?? null },
      });
    } catch (err) {
      console.error("Generate pipeline error:", err);
      const message = err instanceof Error ? err.message : "Generation failed";

      // Don't burn a monthly credit on a failed run: if nothing was produced,
      // remove the empty post and refund the credit. If some slides finished,
      // keep them (post + credit stand) so the user doesn't lose the work.
      let refunded = false;
      try {
        if (createdPost) {
          const finished = composedSlides.filter(Boolean);
          if (finished.length === 0) {
            await deletePost(createdPost.id, userId);
            await deletePostFiles(createdPost.id).catch(() => {});
            await decrementUserPostCount(userId);
            refunded = true;
          } else {
            // Persist whatever completed, keeping slide order intact.
            await updatePostSlides(
              createdPost.id,
              allSlides.map((s, i) => composedSlides[i] ?? s)
            );
          }
        }
      } catch (cleanupErr) {
        console.error("Generate cleanup error:", cleanupErr);
      }

      await send({
        type: "error",
        error: refunded ? `${message} Your post credit was not used.` : message,
      });
    } finally {
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
