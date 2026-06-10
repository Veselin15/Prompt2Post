/**
 * fonts.ts – loads the bundled Poppins weights with opentype.js so text can be
 * rendered as vector paths (see textlayout.ts). Vectorising means the output is
 * identical on every OS with no system-font or fontconfig dependency.
 */

import { readFileSync } from "fs";
import path from "path";
import opentype, { type Font } from "opentype.js";

export type FontWeight = "extrabold" | "semibold" | "serif";

const FILES: Record<FontWeight, string> = {
  extrabold: "Poppins-ExtraBold.ttf",
  semibold: "Poppins-SemiBold.ttf",
  serif: "DMSerifDisplay-Regular.ttf",
};

const cache = new Map<FontWeight, Font>();

export function getFont(weight: FontWeight): Font {
  const cached = cache.get(weight);
  if (cached) return cached;

  const file = path.join(process.cwd(), "public", "fonts", FILES[weight]);
  const buf = readFileSync(file);
  // opentype.parse needs a clean ArrayBuffer slice of the Buffer
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  const font = opentype.parse(ab);
  cache.set(weight, font);
  return font;
}

/** True if the core bundled fonts can be loaded; lets the compositor pick a fallback. */
export function fontsAvailable(): boolean {
  try {
    getFont("extrabold");
    getFont("semibold");
    return true;
  } catch {
    return false;
  }
}
