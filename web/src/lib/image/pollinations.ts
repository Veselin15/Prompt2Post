const BASE = "https://gen.pollinations.ai/image";

// Per-style art direction. Photographic styles read as real photography of real
// subjects; only `flat` is illustration. Phrased as standalone clauses so they
// compose cleanly with the universal quality + anti-text tails below.
const STYLE_SUFFIX: Record<string, string> = {
  cinematic:   "Cinematic anamorphic photography, dramatic chiaroscuro lighting, shallow depth of field, rich filmic color grade, subtle Kodak film grain, photorealistic",
  vibrant:     "Ultra-vibrant commercial photography, punchy saturated palette, HDR color grade, razor-sharp product-shot detail, perfect dynamic range, studio quality, photorealistic",
  minimalist:  "Minimalist fine-art photography, expansive negative space, soft diffused natural light, clean geometric composition, muted restrained palette, architectural precision, photorealistic",
  neon:        "Neon-lit cyberpunk photography, wet reflective surfaces, volumetric light beams, deep dramatic shadows, long-exposure night look, subtle chromatic aberration, photorealistic",
  vintage:     "Analog film photography, warm Kodachrome grain, muted nostalgic palette, gentle light leak, soft vignette, 1970s aesthetic, photorealistic",
  dreamy:      "Dreamy soft-focus photography, golden-hour bokeh, ethereal lens flare, warm pastel palette, romantic hazy atmosphere, photorealistic",
  flat:        "Editorial flat-design illustration, bold vector shapes, Swiss international grid, crisp clean lines, Bauhaus influence, limited deliberate palette, print-ready",
  bold:        "Bold dramatic photography, extreme high contrast, strong graphic composition, monumental scale, heroic camera angle, photorealistic",
};

// Universal tails. Photographic styles get a real-camera quality clause; the lone
// illustration style gets an illustration-quality clause instead.
const PHOTO_QUALITY =
  "shot on a professional full-frame camera, true-to-life proportions, physically accurate materials and textures, tack-sharp focus on the subject, natural depth of field, high dynamic range, masterful composition, ultra-detailed, 8k";
const ILLUSTRATION_QUALITY =
  "clean professional illustration, perfectly balanced composition, crisp vector edges, deliberate negative space, ultra-detailed, high resolution";
// Embedded negative cues — Flux honors these in-prompt; the design layer adds text later.
const ANTI_TEXT =
  "no text, no letters, no numbers, no words, no captions, no typography, no logos, no watermark, no signage, no UI, no borders, no frame";

export interface ImageOptions {
  /** Visual style keyword (cinematic, neon, …) → appended style cues. */
  style: string;
  /** Shared palette description from the planner, for cross-slide cohesion. */
  colorMood?: string;
  /** Source generation dimensions (already aspect-correct, downscaled for speed). */
  width?: number;
  height?: number;
}

/** Generation dimensions — exact Instagram ratios, scaled only when above `cap`. */
export function genDimensions(
  targetW: number,
  targetH: number,
  cap = 1920
): { width: number; height: number } {
  // Native Instagram sizes (incl. 1080×1920 stories) — generate at full resolution.
  if (targetW <= cap && targetH <= cap) {
    return { width: targetW, height: targetH };
  }
  const factor = cap / Math.max(targetW, targetH);
  const round8 = (n: number) => Math.max(256, Math.round((n * factor) / 8) * 8);
  return { width: round8(targetW), height: round8(targetH) };
}

/** Compose the full image-model prompt: subject → style → palette → quality → negatives. */
export function composePrompt(prompt: string, opts: ImageOptions): string {
  const isFlat = opts.style === "flat";
  const style = STYLE_SUFFIX[opts.style] ?? STYLE_SUFFIX.cinematic;
  const quality = isFlat ? ILLUSTRATION_QUALITY : PHOTO_QUALITY;
  const palette = opts.colorMood ? ` Color grade: ${opts.colorMood}.` : "";
  return `${prompt.trim().replace(/\.+$/, "")}. ${style}. ${quality}.${palette} ${ANTI_TEXT}`;
}

export function buildImageUrl(
  prompt: string,
  opts: ImageOptions,
  seed: number
): string {
  const full = composePrompt(prompt, opts);
  const encoded = encodeURIComponent(full);
  const key = process.env.POLLINATIONS_API_KEY ?? "";
  const keyParam = key ? `&key=${encodeURIComponent(key)}` : "";
  const width = opts.width ?? 1080;
  const height = opts.height ?? 1080;
  const model = process.env.POLLINATIONS_MODEL ?? "flux";
  // enhance → Pollinations rewrites the prompt through an LLM for richer Flux output.
  // Defaults on; set POLLINATIONS_ENHANCE=false to send our exact prompt verbatim.
  const enhance = process.env.POLLINATIONS_ENHANCE === "false" ? "false" : "true";
  // private=true → image won't appear in the public Pollinations gallery.
  return `${BASE}/${encoded}?model=${encodeURIComponent(model)}&width=${width}&height=${height}&nologo=true&enhance=${enhance}&private=true&seed=${seed}${keyParam}`;
}

export async function fetchImageBuffer(
  prompt: string,
  opts: ImageOptions,
  seed: number,
  retries = 3
): Promise<Buffer> {
  const url = buildImageUrl(prompt, opts, seed);
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    if (attempt > 0) await sleep(2000 * attempt);
    try {
      const res = await fetch(url);
      if (res.status === 401 || res.status === 402) {
        // Balance exhausted — use fallback immediately
        break;
      }
      if (!res.ok) {
        lastError = new Error(`HTTP ${res.status}`);
        continue;
      }
      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("image")) {
        lastError = new Error(`Unexpected content-type: ${contentType}`);
        continue;
      }
      const ab = await res.arrayBuffer();
      // Reject stub/error images — a real photo is always well above 20 KB
      if (ab.byteLength < 20_000) {
        lastError = new Error(`Response too small (${ab.byteLength} bytes) — likely a stub image`);
        continue;
      }
      return Buffer.from(ab);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  // Fallback: return a placeholder gradient buffer (SVG → PNG via Sharp)
  console.warn(`Pollinations unavailable (${lastError?.message}), using gradient placeholder`);
  return generateGradientBuffer(opts.style, seed, opts.width ?? 1080, opts.height ?? 1080);
}

async function generateGradientBuffer(
  style: string,
  seed: number,
  width: number,
  height: number
): Promise<Buffer> {
  const sharp = (await import("sharp")).default;
  const palettes: Record<string, [string, string, string]> = {
    cinematic:  ["#141830", "#3C5078", "#B48C5A"],
    vibrant:    ["#FF3C5A", "#3CB4FF", "#FFC828"],
    minimalist: ["#F0F0F5", "#C8C8D2", "#A0A0AF"],
    neon:       ["#0A051E", "#00FFC8", "#FF00B4"],
    vintage:    ["#3C2D23", "#8C6E50", "#C8AA82"],
    dreamy:     ["#FFE0F0", "#B4C8FF", "#FFB4C8"],
    flat:       ["#3498DB", "#2ECC71", "#F1C40F"],
    bold:       ["#0F0F0F", "#E63232", "#FFFFFF"],
  };
  const [c1, c2, c3] = palettes[style] ?? palettes.cinematic;
  const rng = mulberry32(seed);

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="${rng().toFixed(2)}" y1="0" x2="${rng().toFixed(2)}" y2="1">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="50%" stop-color="${c2}"/>
        <stop offset="100%" stop-color="${c3}"/>
      </linearGradient>
      <filter id="blur"><feGaussianBlur stdDeviation="18"/></filter>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#g)"/>
    <circle cx="${Math.floor(rng() * width * 0.7 + width * 0.15)}" cy="${Math.floor(rng() * height * 0.7 + height * 0.15)}"
      r="${Math.floor(rng() * 200 + 100)}" fill="${c2}" opacity="0.35" filter="url(#blur)"/>
  </svg>`;

  return sharp(Buffer.from(svg)).resize(width, height).jpeg({ quality: 90 }).toBuffer();
}

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let z = Math.imul(s ^ (s >>> 15), 1 | s);
    z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
