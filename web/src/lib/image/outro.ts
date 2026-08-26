/**
 * outro.ts – the branded closing slide appended to free-plan carousels.
 *
 * Rendered entirely from vector paths + SVG gradients (no AI image fetch), so it
 * costs nothing to generate and looks identical on every platform. Paid plans
 * skip it — see PLAN_LIMITS.outro_branding.
 */

import sharp from "sharp";
import { resolveAccent } from "@/types";
import { getFont, fontsAvailable } from "./fonts";
import { capHeight, centeredLine, lineWidth, fit, wrap } from "./textlayout";

export interface OutroOptions {
  width: number;
  height: number;
  accentColor?: string;
}

const WORDMARK = "Prompt2Post";
const LABEL = "MADE WITH";
const TAGLINE = "Type one topic — get a whole carousel.";
const URL_TEXT = "prompt2post.app";

/** Four-point sparkle centred on (cx, cy). */
function sparkle(cx: number, cy: number, r: number, fill: string): string {
  const k = r * 0.16;
  const d = [
    `M ${cx} ${cy - r}`,
    `Q ${cx + k} ${cy - k} ${cx + r} ${cy}`,
    `Q ${cx + k} ${cy + k} ${cx} ${cy + r}`,
    `Q ${cx - k} ${cy + k} ${cx - r} ${cy}`,
    `Q ${cx - k} ${cy - k} ${cx} ${cy - r}`,
    "Z",
  ].join(" ");
  return `<path d="${d}" fill="${fill}"/>`;
}

function renderOutroSvg(W: number, H: number, accent: string): string {
  const S = W / 1080; // all sizing is relative to a 1080px-wide design
  const cx = W / 2;
  const maxTextW = W * 0.84;

  const EB = getFont("extrabold");
  const SB = getFont("semibold");

  // ── Type sizing ──────────────────────────────────────────────────────────
  const labelSize = 24 * S;
  const labelTracking = 7 * S;
  const taglineSize = 29 * S;
  const urlSize = 28 * S;
  const mark = fit(EB, WORDMARK, 108 * S, 44 * S, maxTextW, 1);
  const taglineLines = wrap(SB, TAGLINE, taglineSize, maxTextW);

  // ── Vertical rhythm — measure the stack, then centre it ──────────────────
  const sparkleR = 26 * S;
  const taglineLead = taglineSize * 1.42;
  const pillH = 76 * S;

  const gapSparkle = 38 * S;
  const gapLabel = 30 * S;
  const gapMark = 30 * S;
  const gapTagline = 48 * S;

  const blockH =
    sparkleR * 2 +
    gapSparkle +
    capHeight(SB, labelSize) +
    gapLabel +
    capHeight(EB, mark.size) +
    gapMark +
    taglineLines.length * taglineLead +
    gapTagline +
    pillH;

  let y = (H - blockH) / 2;

  const els: string[] = [];

  // Sparkle mark
  els.push(sparkle(cx, y + sparkleR, sparkleR, accent));
  y += sparkleR * 2 + gapSparkle;

  // "MADE WITH"
  y += capHeight(SB, labelSize);
  els.push(
    centeredLine(SB, LABEL, cx, y, labelSize, "#ffffff", {
      opacity: 0.5,
      tracking: labelTracking,
    })
  );
  y += gapLabel;

  // Wordmark
  y += capHeight(EB, mark.size);
  els.push(centeredLine(EB, mark.lines[0], cx, y, mark.size, "#ffffff"));
  y += gapMark;

  // Tagline
  for (const line of taglineLines) {
    y += taglineLead;
    els.push(
      centeredLine(SB, line, cx, y - taglineLead * 0.28, taglineSize, "#ffffff", {
        opacity: 0.62,
      })
    );
  }
  y += gapTagline;

  // URL pill
  const urlW = lineWidth(SB, URL_TEXT, urlSize);
  const padX = 40 * S;
  const pillW = urlW + padX * 2;
  const pillX = cx - pillW / 2;
  els.push(
    `<rect x="${pillX.toFixed(1)}" y="${y.toFixed(1)}" width="${pillW.toFixed(1)}" height="${pillH.toFixed(1)}" rx="${(pillH / 2).toFixed(1)}" fill="${accent}" fill-opacity="0.14" stroke="${accent}" stroke-opacity="0.55" stroke-width="${(2 * S).toFixed(1)}"/>`
  );
  els.push(
    centeredLine(SB, URL_TEXT, cx, y + pillH / 2 + capHeight(SB, urlSize) * 0.5, urlSize, "#ffffff", {
      opacity: 0.92,
    })
  );

  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="glowA" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${accent}" stop-opacity="0.5"/>
        <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="glowB" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#4a7dff" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#4a7dff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="#08080f"/>
    <ellipse cx="${W * 0.22}" cy="${H * 0.16}" rx="${W * 0.62}" ry="${H * 0.42}" fill="url(#glowA)"/>
    <ellipse cx="${W * 0.84}" cy="${H * 0.9}" rx="${W * 0.55}" ry="${H * 0.38}" fill="url(#glowB)"/>
    ${els.join("\n")}
  </svg>`;
}

/** Minimal system-font version used only if the bundled fonts can't be loaded. */
function fallbackOutroSvg(W: number, H: number, accent: string): string {
  const S = W / 1080;
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="#08080f"/>
    <text x="${W / 2}" y="${H / 2 - 20 * S}" text-anchor="middle" font-family="Arial, sans-serif"
      font-size="${28 * S}" fill="#ffffff" fill-opacity="0.5">${LABEL}</text>
    <text x="${W / 2}" y="${H / 2 + 70 * S}" text-anchor="middle" font-family="Arial, sans-serif"
      font-size="${96 * S}" font-weight="bold" fill="#ffffff">${WORDMARK}</text>
    <text x="${W / 2}" y="${H / 2 + 150 * S}" text-anchor="middle" font-family="Arial, sans-serif"
      font-size="${30 * S}" fill="${accent}">${URL_TEXT}</text>
  </svg>`;
}

/**
 * Render the branded outro slide as a JPEG at the post's exact dimensions.
 * Never throws for font reasons — falls back to a system-font layout.
 */
export async function composeOutroSlide(opts: OutroOptions): Promise<Buffer> {
  const W = opts.width;
  const H = opts.height;
  const accent = resolveAccent(opts.accentColor);

  const svg = fontsAvailable()
    ? renderOutroSvg(W, H, accent)
    : fallbackOutroSvg(W, H, accent);

  return sharp(Buffer.from(svg))
    .jpeg({ quality: 93, progressive: true, mozjpeg: true })
    .toBuffer();
}
