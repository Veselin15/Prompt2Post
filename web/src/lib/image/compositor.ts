/**
 * compositor.ts – Instagram-grade text compositing with Sharp.
 *
 * Text is rendered to vector paths from the bundled fonts (Poppins + DM Serif),
 * so output is identical on every platform with no system-font dependency.
 * Supports: four overlay templates, any aspect ratio, accent colour, optional
 * @handle watermark, plus per-post "look" controls — font
 * theme (modern/editorial), headline case, text alignment, and text amount.
 */

import sharp from "sharp";
import type {
  SlideData,
  OverlayTemplate,
  TextAmount,
  FontTheme,
  HeadlineCase,
  TextAlign,
} from "@/types";
import {
  resolveAccent,
  resolveTemplate,
  resolveTextAmount,
  resolveFontTheme,
  resolveHeadlineCase,
  resolveTextAlign,
} from "@/types";
import { getFont, fontsAvailable } from "./fonts";
import { lineWidth, capHeight, wrap, fit, linePath } from "./textlayout";

export interface ComposeOptions {
  width: number;
  height: number;
  template?: OverlayTemplate;
  accentColor?: string;
  handle?: string;
  textAmount?: TextAmount;
  fontTheme?: FontTheme;
  headlineCase?: HeadlineCase;
  textAlign?: TextAlign;
}

interface RenderInput {
  W: number;
  H: number;
  headline: string;
  body: string;
  kicker: string;
  position: "top" | "center" | "bottom";
  textSize: "small" | "medium" | "large";
  template: OverlayTemplate;
  accent: string;
  handle: string;
  textAmount: TextAmount;
  fontTheme: FontTheme;
  headlineCase: HeadlineCase;
  textAlign: TextAlign;
}

const BODY_MAX_LINES: Record<TextAmount, number> = { minimal: 0, balanced: 2, detailed: 5 };
/** Body font size (px at 1080 px width) per text-amount tier. */
const BODY_FONT_PX:  Record<TextAmount, number> = { minimal: 0, balanced: 30, detailed: 38 };

function renderOverlay(input: RenderInput): string {
  const {
    W, H, headline, body, kicker, position, textSize, template, accent, handle,
    textAmount, fontTheme, headlineCase, textAlign,
  } = input;

  const SB = getFont("semibold");
  const HF = fontTheme === "editorial" ? getFont("serif") : getFont("extrabold");

  const isQuote = template === "quote";
  const align: TextAlign = isQuote ? "center" : textAlign;

  const scale = W / 1080;
  const padX = Math.round(W * 0.07);
  const maxW = W - padX * 2;
  const cx = W / 2;
  const leftX = padX;

  const kSize = Math.round(26 * scale);
  const kTrack = 4 * scale;
  const kCapH = Math.round(kSize * 0.8);
  // Body font size and line-height scale with the chosen text-amount tier
  const bodyPx  = BODY_FONT_PX[textAmount] || 30;
  const bodyMax = Math.round(bodyPx * scale);
  const handleSize = Math.round(26 * scale);
  const barW = Math.round(72 * scale);
  const barH = Math.round(7 * scale);

  const showBar = template === "classic" || template === "minimal";

  // Aligned line emitter (with optional soft shadow).
  const emit = (
    font: ReturnType<typeof getFont>,
    text: string,
    size: number,
    baseline: number,
    fill: string,
    opts: { shadow?: number; opacity?: number; tracking?: number } = {}
  ): string => {
    const { shadow = 0, opacity = 1, tracking = 0 } = opts;
    const w = lineWidth(font, text, size, tracking);
    const x = align === "left" ? leftX : cx - w / 2;
    let out = "";
    if (shadow) out += linePath(font, text, x + shadow, baseline + shadow, size, "#000", 0.45, tracking);
    out += linePath(font, text, x, baseline, size, fill, opacity, tracking);
    return out;
  };

  // Headline (auto-fit). text_size nudges the upper bound; editorial serif runs a touch larger.
  const headlineText = headlineCase === "upper" ? headline.toUpperCase() : headline;
  const capBoost = (textSize === "large" ? 8 : textSize === "small" ? -10 : 0) + (fontTheme === "editorial" ? 6 : 0);
  const hMaxLines = position === "center" || isQuote ? 4 : 3;
  const hCap = (isQuote ? 88 : 96) + capBoost;
  const { lines: hLines, size: hSize } = fit(
    HF, headlineText, Math.round(hCap * scale), Math.round(46 * scale), maxW, hMaxLines
  );
  const hLead = Math.round(hSize * 1.07);
  const hCapH = capHeight(HF, hSize);

  const maxBody = BODY_MAX_LINES[textAmount];
  const bodyLines = body && maxBody > 0 ? wrap(SB, body, bodyMax, maxW).slice(0, maxBody) : [];
  // Tighter leading for detailed (more lines) so the block stays on-screen
  const bodyLead = Math.round(bodyMax * (textAmount === "detailed" ? 1.28 : 1.34));

  const gapKicker = kicker ? Math.round(20 * scale) : 0;
  const gapBar    = showBar ? Math.round(26 * scale) : 0;
  // Slightly more breathing room before the body when there's more of it
  const gapBody   = bodyLines.length ? Math.round((textAmount === "detailed" ? 28 : 24) * scale) : 0;
  const quoteMarkH = isQuote ? Math.round(110 * scale) : 0;
  const gapQuote = isQuote ? Math.round(10 * scale) : 0;

  const blockH =
    quoteMarkH + gapQuote +
    (kicker ? kCapH + gapKicker : 0) +
    hLines.length * hLead +
    (showBar ? gapBar + barH : 0) +
    (bodyLines.length ? gapBody + bodyLines.length * bodyLead : 0);

  const handleReserve = handle ? Math.round(H * 0.05) : 0;
  let topY: number;
  if (position === "top") topY = Math.round(H * 0.085);
  else if (position === "center") topY = Math.round((H - blockH) / 2);
  else topY = H - Math.round(H * 0.075) - handleReserve - blockH;

  // ── Backing treatment ──────────────────────────────────────────────────
  const scrimDepth = textAmount === "detailed" ? 0.72 : 0.62;
  const scrimPad   = textAmount === "detailed" ? Math.round(180 * scale) : Math.round(150 * scale);

  const defs: string[] = [];
  let backing = "";
  if (template === "classic" || isQuote) {
    const bandTop = Math.max(0, topY - Math.round(60 * scale));
    if (position === "center" || isQuote) {
      const centerOpacity = textAmount === "detailed" ? 0.60 : 0.50;
      const bandH = Math.min(H, topY + blockH + Math.round(80 * scale)) - bandTop;
      defs.push(`<linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000" stop-opacity="0"/>
        <stop offset="18%" stop-color="#000" stop-opacity="${centerOpacity}"/>
        <stop offset="82%" stop-color="#000" stop-opacity="${centerOpacity}"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0"/></linearGradient>`);
      backing = `<rect x="0" y="${bandTop}" width="${W}" height="${bandH}" fill="url(#g)"/>`;
    } else if (position === "top") {
      defs.push(`<linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000" stop-opacity="0.65"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0"/></linearGradient>`);
      backing = `<rect x="0" y="0" width="${W}" height="${topY + blockH + Math.round(80 * scale)}" fill="url(#g)"/>`;
    } else {
      defs.push(`<linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000" stop-opacity="${scrimDepth}"/></linearGradient>`);
      const y0 = Math.max(0, bandTop - scrimPad);
      backing = `<rect x="0" y="${y0}" width="${W}" height="${H - y0}" fill="url(#g)"/>`;
    }
  } else if (template === "banner") {
    const cardPad = Math.round(46 * scale);
    const cardX = Math.round(W * 0.05);
    const cardY = topY - cardPad;
    const cardW = W - cardX * 2;
    const cardH = blockH + cardPad * 2;
    const r = Math.round(28 * scale);
    backing =
      `<rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="${r}" fill="#0b0a14" opacity="0.78"/>` +
      `<rect x="${cardX}" y="${cardY}" width="${Math.round(10 * scale)}" height="${cardH}" rx="${Math.round(5 * scale)}" fill="${accent}"/>`;
  } else {
    // minimal – soft vignette only, legibility comes from text shadows
    defs.push(`<linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000" stop-opacity="${position === "top" ? 0.38 : 0}"/>
      <stop offset="100%" stop-color="#000" stop-opacity="${position === "top" ? 0 : 0.38}"/></linearGradient>`);
    backing = `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#g)"/>`;
  }

  // ── Text ───────────────────────────────────────────────────────────────
  const els: string[] = [];
  let y = topY;
  const headlineShadow = template === "minimal" ? Math.round(4 * scale) : Math.round(3 * scale);

  if (isQuote) {
    const qSize = Math.round(150 * scale);
    const qW = lineWidth(HF, "“", qSize);
    els.push(linePath(HF, "“", cx - qW / 2, y + capHeight(HF, qSize), qSize, accent, 0.9));
    y += quoteMarkH + gapQuote;
  }

  if (kicker) {
    els.push(emit(SB, kicker.toUpperCase(), kSize, y + kCapH, accent, { tracking: kTrack }));
    y += kCapH + gapKicker;
  }

  for (const line of hLines) {
    els.push(emit(HF, line, hSize, y + hCapH, "#ffffff", { shadow: headlineShadow }));
    y += hLead;
  }

  if (showBar) {
    y += gapBar;
    const bx = align === "left" ? leftX : cx - barW / 2;
    els.push(`<rect x="${bx}" y="${y}" width="${barW}" height="${barH}" rx="${barH / 2}" fill="${accent}"/>`);
    y += barH;
  }

  if (bodyLines.length) {
    y += gapBody;
    for (const line of bodyLines) {
      els.push(emit(SB, line, bodyMax, y + capHeight(SB, bodyMax), "#ffffff", {
        opacity: 0.95,
        shadow: Math.round(2.5 * scale),
      }));
      y += bodyLead;
    }
  }

  if (handle) {
    els.push(emit(SB, handle, handleSize, H - Math.round(H * 0.045), "#ffffff", {
      opacity: 0.75,
      tracking: 1 * scale,
    }));
  }

  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>${defs.join("")}</defs>
    ${backing}
    ${els.join("\n")}
  </svg>`;
}

/** Last-resort overlay if the bundled fonts can't be loaded — keeps generation alive. */
function fallbackOverlay(input: RenderInput): string {
  const { W, H, headline, accent } = input;
  const fs = Math.round(W * 0.07);
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.85"/></linearGradient></defs>
    <rect x="0" y="${H - Math.round(H * 0.4)}" width="${W}" height="${Math.round(H * 0.4)}" fill="url(#g)"/>
    <text x="${W / 2}" y="${H - Math.round(H * 0.12)}" text-anchor="middle" font-family="Arial, sans-serif"
      font-size="${fs}" font-weight="bold" fill="#fff">${escapeXml(headline)}</text>
    <rect x="${W / 2 - 36}" y="${H - Math.round(H * 0.09)}" width="72" height="7" rx="3" fill="${accent}"/>
  </svg>`;
}

export async function composeSlide(
  rawBuffer: Buffer,
  slide: SlideData,
  opts: ComposeOptions
): Promise<Buffer> {
  const W = opts.width;
  const H = opts.height;
  const input: RenderInput = {
    W,
    H,
    headline: slide.headline ?? "",
    body: slide.body ?? "",
    kicker: (slide.kicker ?? "").trim(),
    position: slide.text_position ?? "bottom",
    textSize: slide.text_size ?? "medium",
    template: resolveTemplate(opts.template),
    accent: resolveAccent(opts.accentColor),
    handle: opts.handle ?? "",
    textAmount: resolveTextAmount(opts.textAmount),
    fontTheme: resolveFontTheme(opts.fontTheme),
    headlineCase: resolveHeadlineCase(opts.headlineCase),
    textAlign: resolveTextAlign(opts.textAlign),
  };

  const overlaySvg = fontsAvailable() ? renderOverlay(input) : fallbackOverlay(input);

  const result = await sharp(rawBuffer)
    .resize(W, H, { fit: "cover", position: "centre" })
    .composite([{ input: Buffer.from(overlaySvg), blend: "over" }])
    .jpeg({ quality: 93, progressive: true, mozjpeg: true })
    .toBuffer();

  if (result.byteLength < 30_000) {
    console.warn(
      `[compositor] Slide output is suspiciously small: ${result.byteLength} bytes at ${W}×${H}px. The source image may have been a placeholder.`
    );
  }

  return result;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
