/**
 * compositor.ts – Server-side image compositing with Sharp + SVG overlays.
 *
 * Takes a raw image buffer and renders:
 *  1. A gradient backdrop band (top / center / bottom)
 *  2. A bold headline (large text)
 *  3. A body line (smaller supporting text)
 *  4. Optional slide counter badge (e.g. "3/5")
 *
 * All rendering is done purely with Sharp + SVG — no canvas, no headless browser.
 */

import sharp from "sharp";
import type { SlideData } from "@/types";

const OUTPUT_SIZE = 1080;
const FONT_STACK = "Arial, Helvetica, sans-serif";

const SIZE_MAP = {
  small:  { headline: 42, body: 24 },
  medium: { headline: 58, body: 28 },
  large:  { headline: 76, body: 32 },
};

// Rough char-width heuristic (works for proportional fonts at ~0.55× of size)
function estimateLineWidth(text: string, fontSize: number): number {
  return text.length * fontSize * 0.55;
}

function wrapText(text: string, fontSize: number, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (estimateLineWidth(test, fontSize) <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [text];
}

function gradientBandSvg(
  position: "top" | "center" | "bottom",
  bandH: number
): string {
  const W = OUTPUT_SIZE;

  if (position === "top") {
    return `<linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000" stop-opacity="0.72"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <rect x="0" y="0" width="${W}" height="${bandH}" fill="url(#grad)"/>`;
  }
  if (position === "center") {
    const y = (OUTPUT_SIZE - bandH) / 2;
    return `<linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000" stop-opacity="0"/>
      <stop offset="40%" stop-color="#000" stop-opacity="0.75"/>
      <stop offset="60%" stop-color="#000" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <rect x="0" y="${y}" width="${W}" height="${bandH}" fill="url(#grad)"/>`;
  }
  // bottom (default)
  const y = OUTPUT_SIZE - bandH;
  return `<linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#000" stop-opacity="0"/>
    <stop offset="100%" stop-color="#000" stop-opacity="0.78"/>
  </linearGradient>
  <rect x="0" y="${y}" width="${W}" height="${bandH}" fill="url(#grad)"/>`;
}

export async function composeSlide(
  rawBuffer: Buffer,
  slide: SlideData,
  slideNumber: number,
  totalSlides: number
): Promise<Buffer> {
  const { headline, body, text_position: pos, text_size: sz } = slide;
  const sizes = SIZE_MAP[sz] ?? SIZE_MAP.medium;
  const W = OUTPUT_SIZE;
  const padX = Math.round(W * 0.06);
  const maxW = W - padX * 2;

  // Word-wrap
  const hLines = wrapText(headline, sizes.headline, maxW);
  const bLines = body ? wrapText(body, sizes.body, maxW) : [];

  const hLineH = Math.round(sizes.headline * 1.28);
  const bLineH = Math.round(sizes.body * 1.38);
  const gap = body ? 14 : 0;

  const textBlockH = hLines.length * hLineH + gap + bLines.length * bLineH;
  const bandH = Math.max(textBlockH + 80, Math.round(W * 0.27));

  // Y anchor for text block
  let textY: number;
  if (pos === "top") {
    textY = 36;
  } else if (pos === "center") {
    textY = Math.round((W - textBlockH) / 2);
  } else {
    textY = W - bandH + Math.round((bandH - textBlockH) / 2);
  }

  // Build SVG overlay
  const textNodes: string[] = [];
  let y = textY;

  for (const line of hLines) {
    const x = W / 2;
    // shadow
    textNodes.push(
      `<text x="${x + 3}" y="${y + sizes.headline + 3}" text-anchor="middle"
        font-family="${FONT_STACK}" font-size="${sizes.headline}" font-weight="bold"
        fill="black" opacity="0.65">${escapeXml(line)}</text>`
    );
    // main
    textNodes.push(
      `<text x="${x}" y="${y + sizes.headline}" text-anchor="middle"
        font-family="${FONT_STACK}" font-size="${sizes.headline}" font-weight="bold"
        fill="white">${escapeXml(line)}</text>`
    );
    y += hLineH;
  }

  y += gap;

  for (const line of bLines) {
    const x = W / 2;
    textNodes.push(
      `<text x="${x + 2}" y="${y + sizes.body + 2}" text-anchor="middle"
        font-family="${FONT_STACK}" font-size="${sizes.body}"
        fill="black" opacity="0.55">${escapeXml(line)}</text>`
    );
    textNodes.push(
      `<text x="${x}" y="${y + sizes.body}" text-anchor="middle"
        font-family="${FONT_STACK}" font-size="${sizes.body}"
        fill="rgba(255,255,255,0.90)">${escapeXml(line)}</text>`
    );
    y += bLineH;
  }

  // Slide counter badge
  let counterSvg = "";
  if (totalSlides > 1) {
    const label = `${slideNumber}/${totalSlides}`;
    const cx = W - 52;
    const cy = 38;
    counterSvg = `
      <rect x="${cx - 24}" y="${cy - 16}" width="52" height="26" rx="13"
        fill="black" opacity="0.45"/>
      <text x="${cx + 2}" y="${cy + 6}" text-anchor="middle"
        font-family="${FONT_STACK}" font-size="18" font-weight="600"
        fill="rgba(255,255,255,0.9)">${escapeXml(label)}</text>`;
  }

  const overlay = Buffer.from(`
    <svg width="${W}" height="${W}" xmlns="http://www.w3.org/2000/svg">
      <defs>${gradientBandSvg(pos, bandH)}</defs>
      ${textNodes.join("\n")}
      ${counterSvg}
    </svg>`);

  // Resize base, composite overlay, output JPEG
  return sharp(rawBuffer)
    .resize(OUTPUT_SIZE, OUTPUT_SIZE, { fit: "cover" })
    .composite([{ input: overlay, blend: "over" }])
    .jpeg({ quality: 92, progressive: true })
    .toBuffer();
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
