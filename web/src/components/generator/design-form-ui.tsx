"use client";

import { Wand2, Lock } from "lucide-react";
import { clsx } from "clsx";
import { toast } from "sonner";
import {
  POST_FORMATS,
  type PostFormat,
  type TextAmount,
} from "@/types";

export const TONES = ["auto", "inspirational", "educational", "funny", "dramatic", "professional", "promotional"];
export const STYLES = ["auto", "cinematic", "vibrant", "minimalist", "neon", "vintage", "dreamy", "flat", "bold"];
export const SLIDE_COUNTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export const FORMAT_OPTIONS: ("auto" | PostFormat)[] = ["auto", "portrait", "square", "story", "wide"];
export const AMOUNT_OPTIONS: TextAmount[] = ["minimal", "balanced", "detailed"];
export const FONT_OPTIONS = ["modern", "editorial"] as const;
export const ACCENTS = ["#8176fc", "#34e89e", "#ff5c8a", "#ffb020", "#3cc8ff", "#ffffff"];

export function snapSlides(n: number | undefined, max: number): number {
  const allowed = SLIDE_COUNTS.filter((c) => c <= max);
  if (!n || allowed.length === 0) return Math.min(5, max);
  return allowed.reduce((best, c) => (Math.abs(c - n) < Math.abs(best - n) ? c : best));
}

export function RatioGlyph({ format }: { format: "auto" | PostFormat }) {
  if (format === "auto") return <Wand2 className="w-3.5 h-3.5" />;
  const { width, height } = POST_FORMATS[format];
  const h = 15;
  const w = Math.max(8, Math.round((width / height) * h));
  return (
    <span
      className="inline-block rounded-[2px] border border-current opacity-80"
      style={{ width: `${w}px`, height: `${h}px` }}
    />
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs text-white/50 mb-1.5 font-medium">
      {children}
    </label>
  );
}

export function Pill({
  active,
  onClick,
  children,
  title,
  locked,
  lockedMsg,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
  locked?: boolean;
  lockedMsg?: string;
}) {
  if (locked) {
    return (
      <button
        type="button"
        onClick={() => toast.info(lockedMsg ?? "Upgrade your plan to unlock this feature")}
        title={lockedMsg}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/[0.03] text-white/25 border border-white/[0.06] cursor-pointer"
      >
        {children}
        <Lock className="w-2.5 h-2.5 ml-0.5 shrink-0" />
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={clsx(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize",
        active
          ? "bg-brand-600 text-white shadow-sm shadow-brand-900/40"
          : "bg-white/5 text-white/60 hover:bg-white/10"
      )}
    >
      {children}
    </button>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-wider text-white/30 font-semibold pt-1">
      {children}
    </p>
  );
}
