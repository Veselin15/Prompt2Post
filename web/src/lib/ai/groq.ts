import Groq from "groq-sdk";
import type { PostStructure, CreativeContent, SlideData, IdeaSuggestion } from "@/types";
import {
  resolveFormat,
  resolveTemplate,
  DEFAULT_ACCENT,
  DEFAULT_TEXT_AMOUNT,
  DEFAULT_FONT_THEME,
  DEFAULT_HEADLINE_CASE,
  DEFAULT_TEXT_ALIGN,
} from "@/types";
import {
  PLANNER_SYSTEM,
  WRITER_SYSTEM,
  BRIEF_SYSTEM,
  IDEAS_SYSTEM,
  REMIX_SYSTEM,
  REWRITE_SYSTEM,
  REPURPOSE_SYSTEM,
  plannerUserPrompt,
  writerUserPrompt,
  briefUserPrompt,
  ideasUserPrompt,
  remixUserPrompt,
  rewriteUserPrompt,
  repurposeUserPrompt,
} from "./prompts";

/** Always-available, proven model — also the fallback if a fancier model errors. */
const SAFE_MODEL = "llama-3.3-70b-versatile";
/** Planner/structure model (cheap, fast). */
const plannerModel = () => process.env.GROQ_MODEL ?? SAFE_MODEL;
/**
 * Writer/brief model — the quality-critical calls. Defaults to the proven model
 * but can be upgraded with one env line (e.g. GROQ_WRITER_MODEL=moonshotai/kimi-k2-instruct)
 * for noticeably richer copy. If that model is unavailable, calls auto-fall back.
 */
const writerModel = () => process.env.GROQ_WRITER_MODEL ?? process.env.GROQ_MODEL ?? SAFE_MODEL;

let _client: Groq | null = null;
function getClient(): Groq {
  if (!_client) {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error("GROQ_API_KEY is not set");
    _client = new Groq({ apiKey: key });
  }
  return _client;
}

/** True when an error means the requested model can't be served (so we can retry on SAFE_MODEL). */
function isModelError(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return (
    msg.includes("model_not_found") ||
    msg.includes("does not exist") ||
    msg.includes("decommission") ||
    msg.includes("not found") ||
    (msg.includes("model") && (msg.includes("invalid") || msg.includes("unavailable")))
  );
}

type CreateParams = Parameters<Groq["chat"]["completions"]["create"]>[0];

/**
 * Single choke-point for chat completions. Transparently retries on SAFE_MODEL if
 * the requested model is unavailable, so opting into a stronger model can never
 * brick generation.
 */
async function createCompletion(params: CreateParams): Promise<string> {
  const groq = getClient();
  try {
    const res = await groq.chat.completions.create(params);
    return (res as { choices: { message: { content: string | null } }[] }).choices[0].message.content ?? "{}";
  } catch (err) {
    if (isModelError(err) && params.model !== SAFE_MODEL) {
      const res = await groq.chat.completions.create({ ...params, model: SAFE_MODEL });
      return (res as { choices: { message: { content: string | null } }[] }).choices[0].message.content ?? "{}";
    }
    throw err;
  }
}

function extractJson(text: string): unknown {
  const cleaned = text.replace(/```[a-z]*\n?/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in response");
  return JSON.parse(match[0]);
}

function validateStructure(data: Record<string, unknown>): PostStructure {
  const required = ["tone", "style", "post_type", "num_slides"];
  for (const key of required) {
    if (!(key in data)) throw new Error(`Structure missing '${key}'`);
  }
  return {
    tone: String(data.tone),
    style: String(data.style),
    post_type: data.post_type as "single" | "carousel" | "story",
    num_slides: Math.max(1, Math.min(10, Number(data.num_slides))),
    color_mood: String(data.color_mood ?? "cinematic natural tones"),
    format: resolveFormat(data.format),
    template: resolveTemplate(data.template),
    accent_color: DEFAULT_ACCENT, // user overrides applied in the route
    handle: "",
    text_amount: DEFAULT_TEXT_AMOUNT,
    font_theme: DEFAULT_FONT_THEME,
    headline_case: DEFAULT_HEADLINE_CASE,
    text_align: DEFAULT_TEXT_ALIGN,
  };
}

function validateContent(data: Record<string, unknown>): CreativeContent {
  for (const key of ["hook", "hashtags", "social_caption", "slides"]) {
    if (!(key in data)) throw new Error(`Content missing '${key}'`);
  }
  const slides = (data.slides as Record<string, unknown>[]).map((s) => ({
    slide_number: Number(s.slide_number),
    headline: String(s.headline),
    body: String(s.body ?? ""),
    kicker: s.kicker ? String(s.kicker) : "",
    image_prompt: String(s.image_prompt),
    text_position: (s.text_position ?? "bottom") as SlideData["text_position"],
    text_size: (s.text_size ?? "medium") as SlideData["text_size"],
  }));
  return {
    topic: String(data.topic ?? ""),
    tone: String(data.tone ?? ""),
    style: String(data.style ?? ""),
    post_type: String(data.post_type ?? "carousel"),
    hook: String(data.hook),
    hashtags: (data.hashtags as string[]) ?? [],
    social_caption: String(data.social_caption),
    slides,
  };
}

export async function planStructure(
  topic: string,
  preferences: { tone?: string; style?: string; numSlides?: number; format?: string; template?: string },
  retries = 3
): Promise<PostStructure> {
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      const content = await createCompletion({
        model: plannerModel(),
        messages: [
          { role: "system", content: PLANNER_SYSTEM },
          { role: "user", content: plannerUserPrompt(topic, preferences) },
        ],
        response_format: { type: "json_object" },
        temperature: 0.6,
        top_p: 0.9,
        max_tokens: 512,
      });

      const raw = extractJson(content) as Record<string, unknown>;
      const structure = validateStructure(raw);

      if (preferences.tone) structure.tone = preferences.tone;
      if (preferences.style) structure.style = preferences.style;
      if (preferences.numSlides) structure.num_slides = preferences.numSlides;
      if (preferences.format) structure.format = resolveFormat(preferences.format);
      if (preferences.template) structure.template = resolveTemplate(preferences.template);
      return structure;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }
  throw new Error(`Planner failed after ${retries} attempts: ${lastError?.message}`);
}

/** Groq on-demand TPM ≈ 12k — request size ≈ input tokens + max_tokens. */
function writerMaxTokens(numSlides: number, textAmount: string): number {
  // Richer prompts + the creative brief earn a bigger budget per slide.
  const perSlide = textAmount === "detailed" ? 460 : textAmount === "balanced" ? 330 : 220;
  return Math.min(4000, 700 + numSlides * perSlide);
}

function isRateLimitError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("rate_limit") || msg.includes("429") || msg.includes("413");
}

// ── Creative brief — research + art-direction pass that grounds the writer ──────────

export interface CreativeBrief {
  big_idea: string;
  why_it_matters: string;
  facts: string[];
  arc: string[];
  visual_world: string;
  hero_subjects: string[];
}

function validateBrief(data: Record<string, unknown>): CreativeBrief | null {
  const toStrArray = (v: unknown): string[] =>
    Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean).slice(0, 12) : [];
  const facts = toStrArray(data.facts);
  const heroes = toStrArray(data.hero_subjects);
  // A brief with no usable substance isn't worth threading through.
  if (facts.length === 0 && !data.visual_world && heroes.length === 0) return null;
  return {
    big_idea: String(data.big_idea ?? "").trim().slice(0, 400),
    why_it_matters: String(data.why_it_matters ?? "").trim().slice(0, 400),
    facts,
    arc: toStrArray(data.arc),
    visual_world: String(data.visual_world ?? "").trim().slice(0, 800),
    hero_subjects: heroes,
  };
}

/**
 * Pre-writing creative brief: specific facts, a real arc, and ONE cohesive visual
 * world built from concrete real subjects. Never throws — on any failure it returns
 * null and the writer proceeds unguided (so a brief hiccup can't block generation).
 */
export async function developBrief(
  topic: string,
  opts: { tone: string; style: string; numSlides: number; colorMood: string; language?: string },
  retries = 2
): Promise<CreativeBrief | null> {
  let lastError: Error | null = null;
  for (let i = 0; i <= retries; i++) {
    try {
      if (i > 0 && lastError && isRateLimitError(lastError)) {
        await new Promise((r) => setTimeout(r, 3000 * i));
      }
      const content = await createCompletion({
        model: writerModel(),
        messages: [
          { role: "system", content: BRIEF_SYSTEM },
          { role: "user", content: briefUserPrompt(topic, opts) },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: Math.min(1600, 700 + opts.numSlides * 90),
      });
      return validateBrief(extractJson(content) as Record<string, unknown>);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }
  console.warn(`Creative brief unavailable (${lastError?.message}); writing without it.`);
  return null;
}

export async function writeContent(
  topic: string,
  tone: string,
  style: string,
  postType: string,
  numSlides: number,
  colorMood: string,
  textAmount: string,
  language = "",
  brief: CreativeBrief | null = null,
  retries = 3
): Promise<CreativeContent> {
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      if (i > 0 && lastError && isRateLimitError(lastError)) {
        await new Promise((r) => setTimeout(r, 4000 * i));
      }

      const content = await createCompletion({
        model: writerModel(),
        messages: [
          { role: "system", content: WRITER_SYSTEM },
          { role: "user", content: writerUserPrompt(topic, tone, style, postType, numSlides, colorMood, textAmount, language, brief) },
        ],
        response_format: { type: "json_object" },
        // Hotter + dual penalties → more varied, less templated phrasing.
        temperature: 0.88,
        top_p: 0.92,
        frequency_penalty: 0.35,
        presence_penalty: 0.3,
        max_tokens: writerMaxTokens(numSlides, textAmount),
      });

      const raw = extractJson(content) as Record<string, unknown>;
      return validateContent(raw);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }
  throw new Error(`Writer failed after ${retries} attempts: ${lastError?.message}`);
}

// ── Shared helper for the lighter one-shot JSON calls ──────────────────────────

async function jsonChat(
  system: string,
  user: string,
  opts: { maxTokens: number; temperature?: number },
  retries = 2
): Promise<Record<string, unknown>> {
  let lastError: Error | null = null;

  for (let i = 0; i <= retries; i++) {
    try {
      if (i > 0 && lastError && isRateLimitError(lastError)) {
        await new Promise((r) => setTimeout(r, 3000 * i));
      }
      const content = await createCompletion({
        model: writerModel(),
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
        temperature: opts.temperature ?? 0.8,
        top_p: 0.95,
        max_tokens: opts.maxTokens,
      });
      return extractJson(content) as Record<string, unknown>;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }
  throw new Error(`AI request failed: ${lastError?.message}`);
}

/** Idea Studio: niche → 6 ready-to-generate content ideas. */
export async function generateIdeas(
  niche: string,
  audience: string,
  goal: string
): Promise<IdeaSuggestion[]> {
  const raw = await jsonChat(IDEAS_SYSTEM, ideasUserPrompt(niche, audience, goal), {
    maxTokens: 1600,
    temperature: 0.9,
  });
  const ideas = Array.isArray(raw.ideas) ? (raw.ideas as Record<string, unknown>[]) : [];
  if (ideas.length === 0) throw new Error("No ideas in response");
  return ideas.slice(0, 8).map((i) => ({
    title: String(i.title ?? "").slice(0, 200),
    hook: String(i.hook ?? "").slice(0, 300),
    angle: String(i.angle ?? "").slice(0, 300),
    suggested_tone: String(i.suggested_tone ?? ""),
    suggested_format: resolveFormat(i.suggested_format),
    suggested_slides: Math.max(1, Math.min(10, Number(i.suggested_slides) || 5)),
  }));
}

/** Caption remix: three alternative takes on the social caption. */
export async function remixCaption(
  topic: string,
  caption: string
): Promise<{ label: string; caption: string }[]> {
  const raw = await jsonChat(REMIX_SYSTEM, remixUserPrompt(topic, caption), {
    maxTokens: 900,
  });
  const variants = Array.isArray(raw.variants)
    ? (raw.variants as Record<string, unknown>[])
    : [];
  const cleaned = variants
    .map((v) => ({
      label: String(v.label ?? "Variant").slice(0, 30),
      caption: String(v.caption ?? "").trim().slice(0, 2000),
    }))
    .filter((v) => v.caption.length > 0);
  if (cleaned.length === 0) throw new Error("No caption variants in response");
  return cleaned.slice(0, 3);
}

/** Repurpose pack: native X / LinkedIn / Story versions of one post. */
export async function repurposePost(
  topic: string,
  caption: string,
  headlines: string[]
): Promise<{ tweet: string; linkedin: string; story_hook: string }> {
  const raw = await jsonChat(
    REPURPOSE_SYSTEM,
    repurposeUserPrompt(topic, caption, headlines),
    { maxTokens: 900 }
  );
  const tweet = String(raw.tweet ?? "").trim().slice(0, 500);
  const linkedin = String(raw.linkedin ?? "").trim().slice(0, 3000);
  const storyHook = String(raw.story_hook ?? "").trim().slice(0, 400);
  if (!tweet && !linkedin && !storyHook) {
    throw new Error("Repurpose returned no content");
  }
  return { tweet, linkedin, story_hook: storyHook };
}

/** Slide rewrite: fresh headline/body for one slide, same idea sharper words. */
export async function rewriteSlideCopy(
  topic: string,
  tone: string,
  headline: string,
  body: string,
  textAmount: string
): Promise<{ headline: string; body: string }> {
  const raw = await jsonChat(
    REWRITE_SYSTEM,
    rewriteUserPrompt(topic, tone, headline, body, textAmount),
    { maxTokens: 300 }
  );
  const newHeadline = String(raw.headline ?? "").trim().slice(0, 90);
  if (!newHeadline) throw new Error("Rewrite returned an empty headline");
  return {
    headline: newHeadline,
    body: textAmount === "minimal" ? "" : String(raw.body ?? "").trim().slice(0, 420),
  };
}
