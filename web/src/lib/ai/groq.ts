import Groq from "groq-sdk";
import type { PostStructure, CreativeContent, SlideData } from "@/types";
import {
  PLANNER_SYSTEM,
  WRITER_SYSTEM,
  plannerUserPrompt,
  writerUserPrompt,
} from "./prompts";

let _client: Groq | null = null;
function getClient(): Groq {
  if (!_client) {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error("GROQ_API_KEY is not set");
    _client = new Groq({ apiKey: key });
  }
  return _client;
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
  preferences: { tone?: string; style?: string; numSlides?: number },
  retries = 3
): Promise<PostStructure> {
  const groq = getClient();
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      const res = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: PLANNER_SYSTEM },
          { role: "user", content: plannerUserPrompt(topic, preferences) },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 512,
      });

      const raw = extractJson(res.choices[0].message.content ?? "{}") as Record<string, unknown>;
      const structure = validateStructure(raw);

      if (preferences.tone) structure.tone = preferences.tone;
      if (preferences.style) structure.style = preferences.style;
      if (preferences.numSlides) structure.num_slides = preferences.numSlides;
      return structure;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }
  throw new Error(`Planner failed after ${retries} attempts: ${lastError?.message}`);
}

export async function writeContent(
  topic: string,
  tone: string,
  style: string,
  postType: string,
  numSlides: number,
  retries = 3
): Promise<CreativeContent> {
  const groq = getClient();
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      const res = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: WRITER_SYSTEM },
          { role: "user", content: writerUserPrompt(topic, tone, style, postType, numSlides) },
        ],
        response_format: { type: "json_object" },
        temperature: 0.9,
        max_tokens: 4096,
      });

      const raw = extractJson(res.choices[0].message.content ?? "{}") as Record<string, unknown>;
      return validateContent(raw);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }
  throw new Error(`Writer failed after ${retries} attempts: ${lastError?.message}`);
}
