const BASE = "https://gen.pollinations.ai/image";

const STYLE_SUFFIX: Record<string, string> = {
  cinematic:   ", cinematic anamorphic lens photography, dramatic chiaroscuro lighting, shallow depth of field, rich Kodak film grain, professional color grade, ultra-detailed, highly photorealistic, 8k resolution, masterpiece composition",
  vibrant:     ", ultra-vibrant commercial photography, HDR color grading, punchy saturated palette, perfect dynamic range, razor-sharp details, professional retouching, photorealistic, studio quality, 8k",
  minimalist:  ", minimalist fine-art photography, expansive negative space, soft diffused natural light, clean geometric composition, muted restrained palette, architectural precision, museum-quality print, highly detailed",
  neon:        ", neon-lit cyberpunk scene, wet reflective surfaces, volumetric light beams, deep dramatic shadows, chromatic aberration, long-exposure night photography, ultra-detailed, 8k, photorealistic",
  vintage:     ", analog film photography, warm Kodachrome grain, muted nostalgic color palette, deliberate light leak, vignette edges, 1970s retro aesthetic, faded warmth, museum-quality scan, timeless",
  dreamy:      ", dreamy soft-focus photography, golden-hour bokeh balls, ethereal lens flare, warm pastel palette, romantic hazy atmosphere, fairy-tale luminosity, highly detailed, professional photography",
  flat:        ", editorial flat design illustration, bold vector graphic, Swiss international grid, geometric shapes, crisp clean lines, Bauhaus influence, limited but deliberate color palette, print-ready quality",
  bold:        ", bold dramatic photography, extreme high contrast, powerful graphic composition, strong geometric forms, striking monumental scale, heroic camera angle, ultra-detailed, photorealistic, 8k",
};


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
  cap = 1536
): { width: number; height: number } {
  // Native Instagram sizes (1080-wide) — generate at full resolution, no downscale
  if (targetW <= cap && targetH <= cap) {
    return { width: targetW, height: targetH };
  }
  const factor = cap / Math.max(targetW, targetH);
  const round8 = (n: number) => Math.max(256, Math.round((n * factor) / 8) * 8);
  return { width: round8(targetW), height: round8(targetH) };
}

export function buildImageUrl(
  prompt: string,
  opts: ImageOptions,
  seed: number
): string {
  const suffix = STYLE_SUFFIX[opts.style] ?? "";
  const palette = opts.colorMood ? `, ${opts.colorMood} color palette` : "";
  const full = `${prompt}${suffix}${palette}`;
  const encoded = encodeURIComponent(full);
  const key = process.env.POLLINATIONS_API_KEY ?? "";
  const keyParam = key ? `&key=${encodeURIComponent(key)}` : "";
  const width = opts.width ?? 768;
  const height = opts.height ?? 768;
  // enhance=true  → Pollinations rewrites the prompt through an LLM for better Flux results
  // private=true  → image won't appear in the public Pollinations gallery
  return `${BASE}/${encoded}?model=flux&width=${width}&height=${height}&nologo=true&enhance=true&private=true&seed=${seed}${keyParam}`;
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
