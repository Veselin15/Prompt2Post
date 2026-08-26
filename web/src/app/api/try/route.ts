import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { planStructure, writeContent } from "@/lib/ai/groq";
import { fetchImageBuffer, genDimensions } from "@/lib/image/pollinations";
import { composeSlide } from "@/lib/image/compositor";
import { composeOutroSlide } from "@/lib/image/outro";
import { uploadSlideImage, pruneDemoFiles } from "@/lib/image/storage";
import { rateLimit, refundRateLimit, clientIp } from "@/lib/rate-limit";
import { POST_FORMATS, DEFAULT_ACCENT } from "@/types";
import type { GenerateEvent, SlideData } from "@/types";

/**
 * Public "try it without signing up" generator.
 *
 * A deliberately reduced version of /api/generate: two slides, square only,
 * fixed styling, and nothing written to the database — images land in a
 * throwaway `demo-*` storage folder and the result is shown in-page only.
 * Nothing is persisted or publicly shareable, which keeps anonymous output off
 * a public URL under our domain.
 */

export const runtime = "nodejs";
export const maxDuration = 300;

// Reduced settings keep the API cost of an anonymous run near-negligible.
const DEMO_SLIDES = 2;
const DEMO_FORMAT = "square" as const;
const MAX_TOPIC_LEN = 120;

// One free run per visitor per day, plus a global ceiling so a botnet spreading
// across many IPs still can't run up the AI bill.
const PER_IP_LIMIT = 1;
const PER_IP_WINDOW_MS = 24 * 60 * 60 * 1000;
const GLOBAL_LIMIT = 40;
const GLOBAL_WINDOW_MS = 60 * 60 * 1000;

function sse(event: GenerateEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

// Demo images have no database row to hang cleanup off, so we sweep them here
// — at most once an hour, off the request's critical path.
let lastPrune = 0;
function maybePruneDemoFiles() {
  const now = Date.now();
  if (now - lastPrune < 60 * 60 * 1000) return;
  lastPrune = now;
  pruneDemoFiles()
    .then((n) => n && console.log(`[try] pruned ${n} expired demo folder(s)`))
    .catch((e) => console.error("[try] demo prune failed:", e));
}

/**
 * Pre-stream failures (bad input, rate limited) answer with plain JSON — the
 * stream hasn't started yet, so the client reads these with res.json().
 */
function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(req: NextRequest) {
  const { topic } = await req.json().catch(() => ({ topic: "" }));
  const cleanTopic = String(topic ?? "").trim().slice(0, MAX_TOPIC_LEN);
  if (!cleanTopic) return errorResponse("Type a topic to try it out.", 400);

  maybePruneDemoFiles();

  const ip = clientIp(req.headers);
  const global = rateLimit("try:global", GLOBAL_LIMIT, GLOBAL_WINDOW_MS);
  if (!global.allowed) {
    return errorResponse(
      "The free demo is busy right now — sign up to generate without waiting.",
      429
    );
  }
  const perIp = rateLimit(`try:ip:${ip}`, PER_IP_LIMIT, PER_IP_WINDOW_MS);
  if (!perIp.allowed) {
    const hours = Math.ceil(perIp.retryAfter / 3600);
    return errorResponse(
      `You've used your free demo. Sign up free for 3 posts a month, or try again in ${hours}h.`,
      429
    );
  }

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const enc = new TextEncoder();
  const send = async (event: GenerateEvent) => {
    await writer.write(enc.encode(sse(event)));
  };

  (async () => {
    const demoId = `demo-${randomUUID()}`;
    try {
      await send({ type: "status", message: "Planning your carousel…", progress: 6 });
      const structure = await planStructure(cleanTopic, {
        numSlides: DEMO_SLIDES,
        format: DEMO_FORMAT,
        template: "classic",
      });
      // Hard-pin the demo's look regardless of what the planner chose.
      structure.num_slides = DEMO_SLIDES;
      structure.format = DEMO_FORMAT;
      structure.template = "classic";
      structure.accent_color = DEFAULT_ACCENT;
      structure.handle = "";
      structure.text_amount = "balanced";
      structure.font_theme = "modern";
      await send({ type: "structure", structure, progress: 16 });

      // No creative-brief pass here — it's an extra LLM round-trip that the
      // short demo doesn't need, and skipping it keeps time-to-first-slide low.
      await send({ type: "status", message: "Writing your copy…", progress: 24 });
      const content = await writeContent(
        cleanTopic,
        structure.tone,
        structure.style,
        structure.post_type,
        DEMO_SLIDES,
        structure.color_mood,
        structure.text_amount,
        "en",
        null,
        {}
      );
      const rawSlides = content.slides.slice(0, DEMO_SLIDES);
      const { slides: _omit, ...contentMeta } = content;
      await send({ type: "content", content: contentMeta, progress: 34 });

      const fmt = POST_FORMATS[DEMO_FORMAT];
      const genDims = genDimensions(fmt.width, fmt.height);
      const displayTotal = rawSlides.length + 1; // + the branded outro
      const composed: SlideData[] = [];

      for (let i = 0; i < rawSlides.length; i++) {
        await send({
          type: "status",
          message: `Painting image ${i + 1}/${rawSlides.length}…`,
          progress: 36 + i * 26,
        });

        const rawBuf = await fetchImageBuffer(
          rawSlides[i].image_prompt,
          {
            style: structure.style,
            colorMood: structure.color_mood,
            width: genDims.width,
            height: genDims.height,
          },
          i + 1
        );
        // Raw backgrounds are only needed for re-compositing later, which the
        // demo can't do — so we skip storing them and halve the disk written.
        const finalBuf = await composeSlide(rawBuf, rawSlides[i], {
          width: fmt.width,
          height: fmt.height,
          template: "classic",
          accentColor: structure.accent_color,
          textAmount: structure.text_amount,
          fontTheme: structure.font_theme,
          headlineCase: structure.headline_case,
          textAlign: structure.text_align,
        });

        const imageUrl = await uploadSlideImage(demoId, i + 1, finalBuf);
        const slide: SlideData = { ...rawSlides[i], image_url: imageUrl };
        composed.push(slide);
        await send({
          type: "slide",
          slide: { ...slide, index: i, total: displayTotal },
          progress: 36 + (i + 1) * 26,
        });
      }

      // Anonymous runs always carry the branded closing slide.
      const outroBuf = await composeOutroSlide({
        width: fmt.width,
        height: fmt.height,
        accentColor: structure.accent_color,
      });
      const outroUrl = await uploadSlideImage(demoId, composed.length + 1, outroBuf);
      const outroSlide: SlideData = {
        slide_number: composed.length + 1,
        headline: "",
        body: "",
        image_prompt: "",
        text_position: "center",
        text_size: "medium",
        image_url: outroUrl,
        is_outro: true,
      };
      composed.push(outroSlide);
      await send({
        type: "slide",
        slide: { ...outroSlide, index: composed.length - 1, total: displayTotal },
        progress: 96,
      });

      await send({
        type: "done",
        progress: 100,
        post: {
          id: demoId,
          topic: cleanTopic,
          structure,
          content,
          slides: composed,
          zip_url: null,
        } as never,
      });
    } catch (err) {
      console.error("Try-demo pipeline error:", err);
      // The run failed on our side, so don't burn the visitor's one daily try.
      refundRateLimit(`try:ip:${ip}`);
      refundRateLimit("try:global");
      await send({
        type: "error",
        error: "The demo couldn't finish that one — try again in a moment.",
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
