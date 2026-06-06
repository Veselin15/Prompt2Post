import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { planStructure, writeContent } from "@/lib/ai/groq";
import { fetchImageBuffer } from "@/lib/image/pollinations";
import { composeSlide } from "@/lib/image/compositor";
import { uploadSlideImage, uploadZip } from "@/lib/image/storage";
import { createPost, incrementUserPostCount, updatePostSlides } from "@/lib/db";
import { ensureDbUser } from "@/lib/ensure-user";
import { PLAN_LIMITS } from "@/types";
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

  const { topic, tone, style, numSlides } = await req.json();
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

  // Run the pipeline async so we can stream
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

      // ── 2. Plan structure ─────────────────────────────────────────────────
      await send({ type: "status", message: "AI is planning your post structure…", progress: 8 });
      const structure = await planStructure(topic, {
        tone,
        style,
        numSlides: clampedSlides,
      });
      await send({ type: "structure", structure, progress: 16 });

      // ── 3. Write creative content ─────────────────────────────────────────
      await send({ type: "status", message: "AI is writing creative content…", progress: 18 });
      const content = await writeContent(
        topic,
        structure.tone,
        structure.style,
        structure.post_type,
        structure.num_slides
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

      await incrementUserPostCount(userId);

      // ── 5. Generate + compose slides ──────────────────────────────────────
      const composedSlides: SlideData[] = [];
      const imageBuffers: { name: string; data: Buffer }[] = [];
      const total = rawSlides.length;

      for (let i = 0; i < rawSlides.length; i++) {
        const slide = rawSlides[i];
        const progressBase = 34;
        const progressPerSlide = 56 / total;
        const progress = Math.round(progressBase + i * progressPerSlide);

        await send({
          type: "status",
          message: `Generating image ${i + 1}/${total}…`,
          progress,
        });

        // Fetch image from Pollinations (with fallback)
        const rawBuf = await fetchImageBuffer(
          slide.image_prompt,
          structure.style,
          i + 1
        );

        // Composite text overlay with Sharp
        const finalBuf = await composeSlide(rawBuf, slide, i + 1, total);

        // Upload to Supabase Storage
        const imageUrl = await uploadSlideImage(post.id, i + 1, finalBuf);
        imageBuffers.push({ name: `slide_${String(i + 1).padStart(2, "0")}.jpg`, data: finalBuf });

        const composedSlide: SlideData = { ...slide, image_url: imageUrl };
        composedSlides.push(composedSlide);

        await send({
          type: "slide",
          slide: { ...composedSlide, index: i, total },
          progress: Math.round(progressBase + (i + 1) * progressPerSlide),
        });
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
      await send({ type: "error", error: message });
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
