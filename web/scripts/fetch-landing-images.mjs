// One-off script: downloads themed demo images for the landing-page phone
// preview (InteractiveStudio). Uses the same Pollinations engine the app uses
// for real generations. Run with: node scripts/fetch-landing-images.mjs
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const OUT_DIR = path.join(process.cwd(), "public", "landing");

const ANTI_TEXT =
  "no text, no letters, no numbers, no words, no captions, no typography, no logos, no watermark, no UI, no borders, no frame";
const QUALITY =
  "shot on a professional full-frame camera, true-to-life proportions, tack-sharp focus, natural depth of field, high dynamic range, masterful composition, ultra-detailed, 8k, photorealistic";

const IMAGES = [
  // ── Fitness ──
  { name: "fitness-0", prompt: `Athletic person mid-set on a barbell bench press in a moody modern gym, dramatic side lighting, sweat and focus. ${QUALITY}. ${ANTI_TEXT}` },
  { name: "fitness-1", prompt: `Rack of heavy dumbbells and weight plates lined up in a dim industrial gym, cinematic teal and orange lighting. ${QUALITY}. ${ANTI_TEXT}` },
  { name: "fitness-2", prompt: `Close-up of a hand writing in a workout log notebook resting on a gym bench, dumbbells blurred in background, warm gym lighting. ${QUALITY}. ${ANTI_TEXT}` },

  // ── Travel ──
  { name: "travel-0", prompt: `Narrow cobblestone street in Lisbon Portugal with a yellow vintage tram, colorful tiled building facades, golden afternoon light. ${QUALITY}. ${ANTI_TEXT}` },
  { name: "travel-1", prompt: `Trendy industrial cafe interior at LX Factory Lisbon, exposed brick walls, hanging plants, large windows with soft daylight. ${QUALITY}. ${ANTI_TEXT}` },
  { name: "travel-2", prompt: `Sunrise over Lisbon Portugal rooftops, warm terracotta tiled roofs, soft pink and gold morning light, empty quiet streets. ${QUALITY}. ${ANTI_TEXT}` },

  // ── Money ──
  { name: "money-0", prompt: `Neat stacks of cash and coins on a dark wooden desk with a small plant growing from a jar of coins, warm cinematic lighting, finance concept. ${QUALITY}. ${ANTI_TEXT}` },
  { name: "money-1", prompt: `Coins falling into a glass piggy bank on a desk, soft warm bokeh background, savings concept, shallow depth of field. ${QUALITY}. ${ANTI_TEXT}` },
  { name: "money-2", prompt: `Smartphone on a desk showing a blurred app grid next to a pair of scissors and scattered receipts, calculator nearby, moody warm lighting, budgeting concept. ${QUALITY}. ${ANTI_TEXT}` },

  // ── Food ──
  { name: "food-0", prompt: `Overhead shot of a creamy yogurt bowl topped with oats, berries and a soft boiled egg on the side, rustic wooden table, soft natural light. ${QUALITY}. ${ANTI_TEXT}` },
  { name: "food-1", prompt: `Flat lay of fresh eggs, a container of skyr yogurt and a bowl of oats on a light wooden kitchen counter, soft morning light. ${QUALITY}. ${ANTI_TEXT}` },
  { name: "food-2", prompt: `Close-up of a creamy thick yogurt breakfast bowl with berries and granola, spoon scooping a bite, soft natural window light, cozy kitchen. ${QUALITY}. ${ANTI_TEXT}` },
];

const WIDTH = 720;
const HEIGHT = 900;

const API_KEY = process.env.POLLINATIONS_API_KEY ?? "";

function buildUrl(prompt, seed) {
  const encoded = encodeURIComponent(prompt);
  const keyParam = API_KEY ? `&key=${encodeURIComponent(API_KEY)}` : "";
  return `https://gen.pollinations.ai/image/${encoded}?model=flux&width=${WIDTH}&height=${HEIGHT}&nologo=true&enhance=true&private=true&seed=${seed}${keyParam}`;
}

async function downloadOne(name, prompt, seed) {
  const url = buildUrl(prompt, seed);
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      console.log(`[${name}] fetching (attempt ${attempt + 1})…`);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ct = res.headers.get("content-type") ?? "";
      if (!ct.includes("image")) throw new Error(`bad content-type: ${ct}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.byteLength < 20_000) throw new Error(`too small: ${buf.byteLength} bytes`);
      await writeFile(path.join(OUT_DIR, `${name}.jpg`), buf);
      console.log(`[${name}] saved (${(buf.byteLength / 1024).toFixed(0)} KB)`);
      return;
    } catch (err) {
      console.warn(`[${name}] attempt ${attempt + 1} failed: ${err.message}`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  console.error(`[${name}] FAILED after retries`);
}

await mkdir(OUT_DIR, { recursive: true });
for (let i = 0; i < IMAGES.length; i++) {
  await downloadOne(IMAGES[i].name, IMAGES[i].prompt, 1000 + i);
}
console.log("done");
