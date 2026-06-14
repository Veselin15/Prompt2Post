"use client";

import Link from "next/link";
import { toast } from "sonner";
import {
  AtSign,
  AlignCenter,
  AlignLeft,
  Lock,
  Languages,
} from "lucide-react";
import {
  POST_FORMATS,
  OVERLAY_TEMPLATES,
  TEXT_AMOUNTS,
  FONT_THEMES,
  LANGUAGES,
  type PostFormat,
  type OverlayTemplate,
  type TextAmount,
  type FontTheme,
  type HeadlineCase,
  type TextAlign,
  type PlanLimits,
  type Plan,
} from "@/types";
import {
  TONES,
  STYLES,
  SLIDE_COUNTS,
  FORMAT_OPTIONS,
  AMOUNT_OPTIONS,
  FONT_OPTIONS,
  ACCENTS,
  Label,
  Pill,
  SectionTitle,
  RatioGlyph,
} from "./design-form-ui";

const TEMPLATE_OPTIONS: ("auto" | OverlayTemplate)[] = ["auto", "classic", "banner", "quote", "minimal"];

export interface DesignOptionValues {
  tone: string;
  style: string;
  format: "auto" | PostFormat;
  template: "auto" | OverlayTemplate;
  accent: string;
  handle: string;
  textAmount: TextAmount;
  fontTheme: FontTheme;
  headlineCase: HeadlineCase;
  align: TextAlign;
  language: string;
}

interface Props {
  values: DesignOptionValues;
  onChange: <K extends keyof DesignOptionValues>(key: K, value: DesignOptionValues[K]) => void;
  planLimits: PlanLimits;
  currentPlan?: Plan;
  numSlides?: number;
  onNumSlidesChange?: (n: number) => void;
  maxSlides?: number;
  showSlides?: boolean;
}

export default function DesignOptionsFields({
  values,
  onChange,
  planLimits: lim,
  currentPlan,
  numSlides,
  onNumSlidesChange,
  maxSlides = 10,
  showSlides = false,
}: Props) {
  const isPaidPlan = currentPlan === "pro" || currentPlan === "creator";
  const {
    tone,
    style,
    format,
    template,
    accent,
    handle,
    textAmount,
    fontTheme,
    headlineCase,
    align,
    language,
  } = values;

  return (
    <div className="space-y-3.5">
      <SectionTitle>Content</SectionTitle>

      <div>
        <Label>How much text on the image</Label>
        <div className="flex gap-1.5 flex-wrap">
          {AMOUNT_OPTIONS.map((a) => (
            <Pill
              key={a}
              active={textAmount === a}
              onClick={() => onChange("textAmount", a)}
              title={TEXT_AMOUNTS[a].hint}
              locked={!lim.text_amounts.includes(a)}
              lockedMsg={`Upgrade to Pro for the "${TEXT_AMOUNTS[a].label}" text option`}
            >
              {TEXT_AMOUNTS[a].label}
            </Pill>
          ))}
        </div>
      </div>

      <div className={showSlides ? "grid grid-cols-2 gap-3" : undefined}>
        <div>
          <Label>Tone</Label>
          <select
            value={tone}
            onChange={(e) => onChange("tone", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-brand-500/50 transition-colors"
          >
            {TONES.map((t) => (
              <option key={t} value={t} className="bg-[#14141e]">
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>
        {showSlides && onNumSlidesChange && (
          <div>
            <Label>Slides (max {maxSlides})</Label>
            <div className="flex gap-1.5 flex-wrap">
              {SLIDE_COUNTS.filter((n) => n <= maxSlides).map((n) => (
                <Pill
                  key={n}
                  active={numSlides === n}
                  onClick={() => onNumSlidesChange(n)}
                >
                  {n}
                </Pill>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <Label>
          <span className="inline-flex items-center gap-1">
            <Languages className="w-3 h-3" />
            Copy language
          </span>
        </Label>
        <select
          value={language}
          onChange={(e) => onChange("language", e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-brand-500/50 transition-colors"
        >
          <option value="" className="bg-[#14141e]">
            Auto (English)
          </option>
          {LANGUAGES.map((l) => (
            <option key={l} value={l} className="bg-[#14141e]">
              {l}
            </option>
          ))}
        </select>
      </div>

      <SectionTitle>Look</SectionTitle>

      <div>
        <Label>Format</Label>
        <div className="flex gap-1.5 flex-wrap">
          {FORMAT_OPTIONS.map((f) => {
            const isLocked = f !== "auto" && !lim.formats.includes(f);
            return (
              <Pill
                key={f}
                active={format === f}
                onClick={() => onChange("format", f)}
                title={
                  f === "auto"
                    ? "Let AI choose the best ratio"
                    : `${POST_FORMATS[f].ratio} · ${POST_FORMATS[f].hint}`
                }
                locked={isLocked}
                lockedMsg={
                  f !== "auto"
                    ? `Upgrade to Pro to unlock ${POST_FORMATS[f].label} format`
                    : undefined
                }
              >
                <RatioGlyph format={f} />
                {f === "auto" ? "Auto" : POST_FORMATS[f].label}
              </Pill>
            );
          })}
        </div>
      </div>

      <div>
        <Label>Text layout</Label>
        <div className="flex gap-1.5 flex-wrap">
          {TEMPLATE_OPTIONS.map((t) => {
            const isLocked = t !== "auto" && !lim.templates.includes(t);
            return (
              <Pill
                key={t}
                active={template === t}
                onClick={() => onChange("template", t)}
                title={
                  t === "auto"
                    ? "Let AI choose the layout"
                    : OVERLAY_TEMPLATES[t].hint
                }
                locked={isLocked}
                lockedMsg={
                  t !== "auto"
                    ? `Upgrade to Pro to unlock the ${OVERLAY_TEMPLATES[t].label} template`
                    : undefined
                }
              >
                {t === "auto" ? "Auto" : OVERLAY_TEMPLATES[t].label}
              </Pill>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Font</Label>
          <div className="flex gap-1.5 flex-wrap">
            {FONT_OPTIONS.map((f) => (
              <Pill
                key={f}
                active={fontTheme === f}
                onClick={() => onChange("fontTheme", f)}
                title={FONT_THEMES[f].hint}
                locked={!lim.font_themes.includes(f)}
                lockedMsg={`Upgrade to Pro to unlock the ${FONT_THEMES[f].label} font`}
              >
                {FONT_THEMES[f].label}
              </Pill>
            ))}
          </div>
        </div>
        <div>
          <Label>Headline case</Label>
          <div className="flex gap-1.5">
            <Pill
              active={headlineCase === "normal"}
              onClick={() => onChange("headlineCase", "normal")}
            >
              Aa
            </Pill>
            <Pill
              active={headlineCase === "upper"}
              onClick={() => onChange("headlineCase", "upper")}
            >
              AA
            </Pill>
          </div>
        </div>
      </div>

      <div>
        <Label>Alignment</Label>
        <div className="flex gap-1.5">
          <Pill active={align === "center"} onClick={() => onChange("align", "center")}>
            <AlignCenter className="w-3.5 h-3.5" /> Center
          </Pill>
          <Pill active={align === "left"} onClick={() => onChange("align", "left")}>
            <AlignLeft className="w-3.5 h-3.5" /> Left
          </Pill>
        </div>
      </div>

      <div>
        <Label>Accent color</Label>
        <div className="flex items-center gap-2">
          {ACCENTS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange("accent", c)}
              title={c}
              className={`w-7 h-7 rounded-full border-2 transition-transform ${
                accent.toLowerCase() === c.toLowerCase()
                  ? "border-white scale-110"
                  : "border-white/20 hover:scale-105"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}

          {lim.custom_accent ? (
            <label
              className="w-7 h-7 rounded-full border-2 border-white/20 hover:border-white/40 overflow-hidden relative cursor-pointer"
              title="Custom color"
            >
              <span className="absolute inset-0 bg-gradient-to-br from-pink-500 via-yellow-400 to-cyan-400" />
              <input
                type="color"
                value={accent}
                onChange={(e) => onChange("accent", e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
          ) : (
            <button
              type="button"
              onClick={() => toast.info("Upgrade to Pro for a fully custom accent color")}
              title="Custom color · Pro only"
              className="w-7 h-7 rounded-full border-2 border-white/10 overflow-hidden relative flex items-center justify-center"
            >
              <span className="absolute inset-0 bg-gradient-to-br from-pink-500/25 via-yellow-400/25 to-cyan-400/25" />
              <Lock className="w-3 h-3 text-white/30 relative z-10" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Image style</Label>
          <select
            value={style}
            onChange={(e) => onChange("style", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-brand-500/50 transition-colors"
          >
            {STYLES.map((s) => (
              <option key={s} value={s} className="bg-[#14141e]">
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>Watermark</Label>
          {lim.watermark ? (
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input
                type="text"
                value={handle}
                onChange={(e) => onChange("handle", e.target.value)}
                placeholder="yourbrand"
                maxLength={30}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-brand-500/50 transition-colors"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() =>
                toast.info("Upgrade to Pro to add a @handle watermark to your images")
              }
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-8 pr-3 py-2 text-sm text-left relative flex items-center"
            >
              <AtSign className="absolute left-3 w-3.5 h-3.5 text-white/15" />
              <span className="text-white/20 pl-0.5">yourbrand</span>
              <Lock className="w-3 h-3 ml-auto text-white/20" />
            </button>
          )}
        </div>
      </div>

      {!isPaidPlan && (
        <div className="mt-1 pt-3 border-t border-white/[0.06] flex items-center justify-between">
          <p className="text-[11px] text-white/30">Free plan · Some features locked</p>
          <Link
            href="/dashboard/billing"
            className="text-[11px] text-brand-400 hover:text-brand-300 font-medium transition-colors"
          >
            Upgrade to Pro →
          </Link>
        </div>
      )}
    </div>
  );
}
