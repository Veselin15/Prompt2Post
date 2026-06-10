/**
 * textlayout.ts – pure text-measuring + vectorising helpers built on opentype.js.
 *
 * Everything here turns a string into SVG `<path>` markup, with accurate width
 * measurement so we can auto-fit and word-wrap headlines precisely.
 */

import type { Font } from "opentype.js";

/** Advance width of a line in px, including optional per-glyph tracking. */
export function lineWidth(font: Font, text: string, size: number, tracking = 0): number {
  let w = font.getAdvanceWidth(text, size);
  if (tracking) w += tracking * Math.max(0, [...text].length - 1);
  return w;
}

/** Visual cap-height-ish offset from a top edge to the baseline. */
export function capHeight(font: Font, size: number): number {
  return (font.ascender / font.unitsPerEm) * size * 0.72;
}

/** Greedy word wrap using real glyph metrics. */
export function wrap(font: Font, text: string, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (lineWidth(font, test, size) <= maxWidth) current = test;
    else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [text];
}

/** Shrink the font size until the text wraps within `maxLines`. */
export function fit(
  font: Font,
  text: string,
  maxSize: number,
  minSize: number,
  maxWidth: number,
  maxLines: number
): { lines: string[]; size: number } {
  for (let s = maxSize; s >= minSize; s -= 2) {
    const lines = wrap(font, text, s, maxWidth);
    if (lines.length <= maxLines) return { lines, size: s };
  }
  return { lines: wrap(font, text, minSize, maxWidth), size: minSize };
}

/** SVG path for a single line with its left edge at x and baseline at y. */
export function linePath(
  font: Font,
  text: string,
  x: number,
  baseline: number,
  size: number,
  fill: string,
  opacity = 1,
  tracking = 0
): string {
  const op = opacity < 1 ? ` opacity="${opacity}"` : "";
  if (!tracking) {
    const d = font.getPath(text, x, baseline, size).toPathData(2);
    return `<path d="${d}" fill="${fill}"${op}/>`;
  }
  const scale = size / font.unitsPerEm;
  let cursor = x;
  const parts: string[] = [];
  for (const glyph of font.stringToGlyphs(text)) {
    parts.push(glyph.getPath(cursor, baseline, size).toPathData(2));
    cursor += (glyph.advanceWidth || 0) * scale + tracking;
  }
  return `<path d="${parts.join(" ")}" fill="${fill}"${op}/>`;
}

/** Horizontally centered line, with an optional soft drop shadow for legibility. */
export function centeredLine(
  font: Font,
  text: string,
  cx: number,
  baseline: number,
  size: number,
  fill: string,
  opts: { shadow?: number; opacity?: number; tracking?: number } = {}
): string {
  const { shadow = 0, opacity = 1, tracking = 0 } = opts;
  const w = lineWidth(font, text, size, tracking);
  const x = cx - w / 2;
  let out = "";
  if (shadow) out += linePath(font, text, x + shadow, baseline + shadow, size, "#000", 0.45, tracking);
  out += linePath(font, text, x, baseline, size, fill, opacity, tracking);
  return out;
}
