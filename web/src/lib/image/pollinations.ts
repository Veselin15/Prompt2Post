const BASE = "https://gen.pollinations.ai/image";

const STYLE_SUFFIX: Record<string, string> = {
  cinematic:  ", cinematic photography, film grain, dramatic lighting",
  vibrant:    ", vibrant colors, high saturation, punchy contrast",
  minimalist: ", minimalist design, clean composition, lots of white space",
  neon:       ", neon glow, cyberpunk aesthetic, dark background",
  vintage:    ", vintage film look, muted tones, retro grain",
  dreamy:     ", dreamy soft light, bokeh, pastel palette",
  flat:       ", flat design illustration, vector art, bold outlines",
  bold:       ", bold graphic design, strong contrast, powerful composition",
};

export function buildImageUrl(
  prompt: string,
  style: string,
  seed: number,
  width = 768,
  height = 768
): string {
  const suffix = STYLE_SUFFIX[style] ?? "";
  const full = `${prompt}${suffix}`;
  const encoded = encodeURIComponent(full);
  const key = process.env.POLLINATIONS_API_KEY ?? "";
  const keyParam = key ? `&key=${encodeURIComponent(key)}` : "";
  return `${BASE}/${encoded}?model=flux&width=${width}&height=${height}&nologo=true&seed=${seed}${keyParam}`;
}

export async function fetchImageBuffer(
  prompt: string,
  style: string,
  seed: number,
  retries = 3
): Promise<Buffer> {
  const url = buildImageUrl(prompt, style, seed);
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
      return Buffer.from(ab);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  // Fallback: return a placeholder gradient buffer (SVG → PNG via Sharp)
  console.warn(`Pollinations unavailable (${lastError?.message}), using gradient placeholder`);
  return generateGradientBuffer(prompt, style, seed);
}

async function generateGradientBuffer(
  _prompt: string,
  style: string,
  seed: number
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

  const svg = `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="${rng().toFixed(2)}" y1="0" x2="${rng().toFixed(2)}" y2="1">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="50%" stop-color="${c2}"/>
        <stop offset="100%" stop-color="${c3}"/>
      </linearGradient>
      <filter id="blur"><feGaussianBlur stdDeviation="18"/></filter>
    </defs>
    <rect width="1080" height="1080" fill="url(#g)"/>
    <circle cx="${Math.floor(rng() * 800 + 140)}" cy="${Math.floor(rng() * 800 + 140)}"
      r="${Math.floor(rng() * 200 + 100)}" fill="${c2}" opacity="0.35" filter="url(#blur)"/>
  </svg>`;

  return sharp(Buffer.from(svg)).resize(1080, 1080).jpeg({ quality: 90 }).toBuffer();
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
