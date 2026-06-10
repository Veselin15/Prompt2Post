"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ChevronDown,
  Wand2,
  AtSign,
  AlignCenter,
  AlignLeft,
  Lock,
  Bookmark,
  Loader2,
  Languages,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { clsx } from "clsx";
import {
  POST_FORMATS,
  OVERLAY_TEMPLATES,
  TEXT_AMOUNTS,
  FONT_THEMES,
  PLAN_LIMITS,
  DEFAULT_ACCENT,
  LANGUAGES,
  resolveAccent,
  resolveTextAmount,
  resolveFontTheme,
  resolveHeadlineCase,
  resolveTextAlign,
  resolveLanguage,
  type PostFormat,
  type OverlayTemplate,
  type TextAmount,
  type FontTheme,
  type HeadlineCase,
  type TextAlign,
  type Plan,
  type PlanLimits,
} from "@/types";
import type { DesignState } from "./DesignPreview";

const TONES = ["auto", "inspirational", "educational", "funny", "dramatic", "professional", "promotional"];
const STYLES = ["auto", "cinematic", "vibrant", "minimalist", "neon", "vintage", "dreamy", "flat", "bold"];
const SLIDE_COUNTS = [1, 3, 5, 7, 10];
const FORMAT_OPTIONS: ("auto" | PostFormat)[] = ["auto", "portrait", "square", "story", "wide"];
const TEMPLATE_OPTIONS: ("auto" | OverlayTemplate)[] = ["auto", "classic", "banner", "quote", "minimal"];
const AMOUNT_OPTIONS: TextAmount[] = ["minimal", "balanced", "detailed"];
const FONT_OPTIONS: FontTheme[] = ["modern", "editorial"];
const ACCENTS = ["#8176fc", "#34e89e", "#ff5c8a", "#ffb020", "#3cc8ff", "#ffffff"];

const MAX_TOPIC = 600;
const STARTERS = [
  "The surprising history of coffee",
  "5 productivity hacks for remote workers",
  "Gym motivation for beginners",
  "Cyberpunk short story – neon rain",
  "Why the ocean is blue",
];

export interface GenerateOptions {
  topic: string;
  tone: string;
  style: string;
  numSlides: number;
  format: string;
  template: string;
  accentColor: string;
  handle: string;
  textAmount: string;
  fontTheme: string;
  headlineCase: string;
  textAlign: string;
  language: string;
}

/** Initial form values — from the user's Brand Kit and/or an Idea Studio link. */
export interface FormPrefill {
  topic?: string;
  tone?: string;
  style?: string;
  numSlides?: number;
  format?: string;
  template?: string;
  accent?: string;
  handle?: string;
  textAmount?: string;
  fontTheme?: string;
  headlineCase?: string;
  textAlign?: string;
  language?: string;
}

interface Props {
  isGenerating: boolean;
  maxSlides: number;
  onGenerate: (opts: GenerateOptions) => void;
  onChange?: (design: DesignState) => void;
  /** Feature limits for the current user's plan. Defaults to creator (no gates). */
  planLimits?: PlanLimits;
  currentPlan?: Plan;
  prefill?: FormPrefill;
}

/** Snap any slide count to the closest selectable pill value. */
function snapSlides(n: number | undefined, max: number): number {
  const allowed = SLIDE_COUNTS.filter((c) => c <= max);
  if (!n || allowed.length === 0) return Math.min(5, max);
  return allowed.reduce((best, c) => (Math.abs(c - n) < Math.abs(best - n) ? c : best));
}

function RatioGlyph({ format }: { format: "auto" | PostFormat }) {
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

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs text-white/50 mb-1.5 font-medium">
      {children}
    </label>
  );
}

function Pill({
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-wider text-white/30 font-semibold pt-1">
      {children}
    </p>
  );
}

export default function GeneratorForm({
  isGenerating,
  maxSlides,
  onGenerate,
  onChange,
  planLimits,
  currentPlan,
  prefill,
}: Props) {
  const [topic, setTopic] = useState(() => (prefill?.topic ?? "").slice(0, MAX_TOPIC));
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [tone, setTone] = useState(() =>
    prefill?.tone && TONES.includes(prefill.tone) ? prefill.tone : "auto"
  );
  const [style, setStyle] = useState(() =>
    prefill?.style && STYLES.includes(prefill.style) ? prefill.style : "auto"
  );
  const [numSlides, setNumSlides] = useState(() => snapSlides(prefill?.numSlides, maxSlides));
  const [format, setFormat] = useState<"auto" | PostFormat>(() =>
    prefill?.format && FORMAT_OPTIONS.includes(prefill.format as "auto" | PostFormat)
      ? (prefill.format as "auto" | PostFormat)
      : "portrait"
  );
  const [template, setTemplate] = useState<"auto" | OverlayTemplate>(() =>
    prefill?.template && TEMPLATE_OPTIONS.includes(prefill.template as "auto" | OverlayTemplate)
      ? (prefill.template as "auto" | OverlayTemplate)
      : "auto"
  );
  const [accent, setAccent] = useState(() => resolveAccent(prefill?.accent));
  const [handle, setHandle] = useState(() => (prefill?.handle ?? "").replace(/^@+/, ""));
  const [textAmount, setTextAmount] = useState<TextAmount>(() =>
    resolveTextAmount(prefill?.textAmount)
  );
  const [fontTheme, setFontTheme] = useState<FontTheme>(() =>
    resolveFontTheme(prefill?.fontTheme)
  );
  const [headlineCase, setHeadlineCase] = useState<HeadlineCase>(() =>
    resolveHeadlineCase(prefill?.headlineCase)
  );
  const [align, setAlign] = useState<TextAlign>(() => resolveTextAlign(prefill?.textAlign));
  const [language, setLanguage] = useState(() => resolveLanguage(prefill?.language));
  const [showOptions, setShowOptions] = useState(true);
  const [savingStyle, setSavingStyle] = useState(false);

  // Resolved limits — fall back to creator (= no gates) when not provided
  const lim = planLimits ?? PLAN_LIMITS.creator;
  const isPaidPlan = currentPlan === "pro" || currentPlan === "creator";

  const cappedSlides = Math.min(numSlides, maxSlides);
  const nearLimit = topic.length > MAX_TOPIC * 0.9;

  // When plan limits arrive (or change), reset any state that's no longer
  // permitted so the preview stays in sync.
  useEffect(() => {
    if (!planLimits) return;
    if (!planLimits.font_themes.includes(fontTheme)) setFontTheme("modern");
    if (!planLimits.text_amounts.includes(textAmount)) setTextAmount("balanced");
    if (format !== "auto" && !planLimits.formats.includes(format)) setFormat("auto");
    if (template !== "auto" && !planLimits.templates.includes(template))
      setTemplate("auto");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planLimits]);

  // Auto-grow the textarea as content is typed.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 320)}px`;
  }, [topic]);

  // Push live design state up for the DesignPreview.
  useEffect(() => {
    onChange?.({
      topic,
      format,
      template,
      accent,
      fontTheme,
      headlineCase,
      textAlign: align,
      textAmount,
      handle,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, format, template, accent, fontTheme, headlineCase, align, textAmount, handle]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;
    onGenerate({
      topic: topic.trim(),
      tone: tone === "auto" ? "" : tone,
      style: style === "auto" ? "" : style,
      numSlides: cappedSlides,
      format: format === "auto" ? "" : format,
      template: template === "auto" ? "" : template,
      accentColor: accent,
      handle: handle.trim(),
      textAmount,
      fontTheme,
      headlineCase,
      textAlign: align,
      language,
    });
  }

  /** Persist the current design as the user's Brand Kit (default for new posts). */
  async function saveStyle() {
    if (savingStyle) return;
    setSavingStyle(true);
    try {
      const res = await fetch("/api/brand-kit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tone: tone === "auto" ? "" : tone,
          style: style === "auto" ? "" : style,
          format,
          template,
          accent,
          handle: handle.trim(),
          textAmount,
          fontTheme,
          headlineCase,
          textAlign: align,
          language,
        }),
      });
      if (!res.ok) throw new Error("Could not save your style");
      toast.success("Style saved — new posts will start with this look");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save your style");
    } finally {
      setSavingStyle(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ── Topic ── */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={topic}
          onChange={(e) => setTopic(e.target.value.slice(0, MAX_TOPIC))}
          maxLength={MAX_TOPIC}
          placeholder={`Describe your topic in detail — the more context you give, the better the result.\ne.g. "The surprising history of coffee: how a banned drink changed the world" or "5 morning habits of high-performing CEOs backed by neuroscience"`}
          rows={4}
          disabled={isGenerating}
          className={clsx(
            "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-white/25",
            "text-sm resize-none overflow-hidden outline-none transition-all duration-200 focus:border-brand-500/60 focus:bg-white/8",
            "disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed"
          )}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as unknown as React.FormEvent);
            }
          }}
        />
        <div
          className={clsx(
            "absolute bottom-3 right-3 text-xs transition-colors",
            nearLimit ? "text-amber-400/80" : "text-white/20"
          )}
        >
          {topic.length}/{MAX_TOPIC}
        </div>
      </div>

      {/* ── Starters ── */}
      {!isGenerating && (
        <div className="flex flex-wrap gap-1.5">
          {STARTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setTopic(s)}
              className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-white/55 hover:text-white/80 px-2.5 py-1 rounded-lg transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowOptions((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          <ChevronDown
            className={clsx(
              "w-3.5 h-3.5 transition-transform",
              showOptions && "rotate-180"
            )}
          />
          {showOptions ? "Hide" : "Customize"} design
        </button>
        <button
          type="button"
          onClick={saveStyle}
          disabled={savingStyle}
          title="Save the current design as your default for every new post"
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-brand-300 transition-colors disabled:opacity-50"
        >
          {savingStyle ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Bookmark className="w-3.5 h-3.5" />
          )}
          Save my style
        </button>
      </div>

      <AnimatePresence initial={false}>
        {showOptions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-3.5 pt-1">
              <SectionTitle>Content</SectionTitle>

              {/* Text amount */}
              <div>
                <Label>How much text on the image</Label>
                <div className="flex gap-1.5 flex-wrap">
                  {AMOUNT_OPTIONS.map((a) => (
                    <Pill
                      key={a}
                      active={textAmount === a}
                      onClick={() => setTextAmount(a)}
                      title={TEXT_AMOUNTS[a].hint}
                      locked={!lim.text_amounts.includes(a)}
                      lockedMsg={`Upgrade to Pro for the "${TEXT_AMOUNTS[a].label}" text option`}
                    >
                      {TEXT_AMOUNTS[a].label}
                    </Pill>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tone</Label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-brand-500/50 transition-colors"
                  >
                    {TONES.map((t) => (
                      <option key={t} value={t} className="bg-[#14141e]">
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Slides (max {maxSlides})</Label>
                  <div className="flex gap-1.5 flex-wrap">
                    {SLIDE_COUNTS.filter((n) => n <= maxSlides).map((n) => (
                      <Pill
                        key={n}
                        active={numSlides === n}
                        onClick={() => setNumSlides(n)}
                      >
                        {n}
                      </Pill>
                    ))}
                  </div>
                </div>
              </div>

              {/* Language */}
              <div>
                <Label>
                  <span className="inline-flex items-center gap-1">
                    <Languages className="w-3 h-3" />
                    Copy language
                  </span>
                </Label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
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

              {/* Format */}
              <div>
                <Label>Format</Label>
                <div className="flex gap-1.5 flex-wrap">
                  {FORMAT_OPTIONS.map((f) => {
                    const isLocked = f !== "auto" && !lim.formats.includes(f);
                    return (
                      <Pill
                        key={f}
                        active={format === f}
                        onClick={() => setFormat(f)}
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

              {/* Template */}
              <div>
                <Label>Text layout</Label>
                <div className="flex gap-1.5 flex-wrap">
                  {TEMPLATE_OPTIONS.map((t) => {
                    const isLocked = t !== "auto" && !lim.templates.includes(t);
                    return (
                      <Pill
                        key={t}
                        active={template === t}
                        onClick={() => setTemplate(t)}
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

              {/* Font + Headline case */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Font</Label>
                  <div className="flex gap-1.5 flex-wrap">
                    {FONT_OPTIONS.map((f) => (
                      <Pill
                        key={f}
                        active={fontTheme === f}
                        onClick={() => setFontTheme(f)}
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
                      onClick={() => setHeadlineCase("normal")}
                    >
                      Aa
                    </Pill>
                    <Pill
                      active={headlineCase === "upper"}
                      onClick={() => setHeadlineCase("upper")}
                    >
                      AA
                    </Pill>
                  </div>
                </div>
              </div>

              {/* Alignment */}
              <div>
                <Label>Alignment</Label>
                <div className="flex gap-1.5">
                  <Pill active={align === "center"} onClick={() => setAlign("center")}>
                    <AlignCenter className="w-3.5 h-3.5" /> Center
                  </Pill>
                  <Pill active={align === "left"} onClick={() => setAlign("left")}>
                    <AlignLeft className="w-3.5 h-3.5" /> Left
                  </Pill>
                </div>
              </div>

              {/* Accent colour */}
              <div>
                <Label>Accent color</Label>
                <div className="flex items-center gap-2">
                  {ACCENTS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAccent(c)}
                      title={c}
                      className={clsx(
                        "w-7 h-7 rounded-full border-2 transition-transform",
                        accent.toLowerCase() === c.toLowerCase()
                          ? "border-white scale-110"
                          : "border-white/20 hover:scale-105"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}

                  {lim.custom_accent ? (
                    /* Full colour-picker for Pro+ */
                    <label
                      className="w-7 h-7 rounded-full border-2 border-white/20 hover:border-white/40 overflow-hidden relative cursor-pointer"
                      title="Custom color"
                    >
                      <span className="absolute inset-0 bg-gradient-to-br from-pink-500 via-yellow-400 to-cyan-400" />
                      <input
                        type="color"
                        value={accent}
                        onChange={(e) => setAccent(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </label>
                  ) : (
                    /* Locked picker swatch for Free */
                    <button
                      type="button"
                      onClick={() =>
                        toast.info("Upgrade to Pro for a fully custom accent color")
                      }
                      title="Custom color · Pro only"
                      className="w-7 h-7 rounded-full border-2 border-white/10 overflow-hidden relative flex items-center justify-center"
                    >
                      <span className="absolute inset-0 bg-gradient-to-br from-pink-500/25 via-yellow-400/25 to-cyan-400/25" />
                      <Lock className="w-3 h-3 text-white/30 relative z-10" />
                    </button>
                  )}
                </div>
              </div>

              {/* Image style + Watermark handle */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Image style</Label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
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
                        onChange={(e) => setHandle(e.target.value)}
                        placeholder="yourbrand"
                        maxLength={30}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-brand-500/50 transition-colors"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        toast.info(
                          "Upgrade to Pro to add a @handle watermark to your images"
                        )
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

              {/* ── Plan upgrade footer (free users only) ── */}
              {!isPaidPlan && (
                <div className="mt-1 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <p className="text-[11px] text-white/30">
                    Free plan · Some features locked
                  </p>
                  <Link
                    href="/dashboard/billing"
                    className="text-[11px] text-brand-400 hover:text-brand-300 font-medium transition-colors"
                  >
                    Upgrade to Pro →
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Submit ── */}
      <motion.button
        type="submit"
        disabled={!topic.trim() || isGenerating}
        whileTap={topic.trim() && !isGenerating ? { scale: 0.98 } : undefined}
        className={clsx(
          "w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-colors",
          !topic.trim() || isGenerating
            ? "bg-white/5 text-white/30 cursor-not-allowed"
            : "bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/30"
        )}
      >
        {isGenerating ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate post
          </>
        )}
      </motion.button>
    </form>
  );
}
