"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ChevronDown,
  Bookmark,
  Loader2,
  Shuffle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { clsx } from "clsx";
import {
  PLAN_LIMITS,
  resolveAccent,
  resolveTextAmount,
  resolveFontTheme,
  resolveHeadlineCase,
  resolveTextAlign,
  resolveLanguage,
  resolveAudience,
  resolveGoal,
  resolveEmoji,
  type PostFormat,
  type OverlayTemplate,
  type TextAmount,
  type FontTheme,
  type HeadlineCase,
  type TextAlign,
  type Goal,
  type EmojiLevel,
  type Plan,
  type PlanLimits,
} from "@/types";
import { saveBrandKit } from "@/lib/brand-kit-client";
import DesignOptionsFields, { type DesignOptionValues } from "./DesignOptionsFields";
import {
  TONES,
  STYLES,
  FORMAT_OPTIONS,
  snapSlides,
} from "./design-form-ui";
import type { DesignState } from "./DesignPreview";

const TEMPLATE_OPTIONS: ("auto" | OverlayTemplate)[] = ["auto", "classic", "banner", "quote", "minimal"];

const MAX_TOPIC = 600;
const STARTERS = [
  "The surprising history of coffee",
  "5 productivity hacks for remote workers",
  "Gym motivation for beginners",
  "Cyberpunk short story – neon rain",
  "Why the ocean is blue",
];

/** Fuller pool for the "Surprise me" shuffle — richer, more specific prompts. */
const SURPRISE_TOPICS = [
  "Why deep-sea creatures glow — and what they're really saying to each other",
  "The psychology of why we procrastinate (and 3 fixes that actually work)",
  "How compound interest quietly turns $5 a day into a fortune",
  "5 morning habits of high-performing CEOs, backed by neuroscience",
  "The forgotten engineering behind Roman concrete that still outlasts ours",
  "What your sleep chronotype says about your ideal workday",
  "The real reason Japanese trains are never late",
  "How a single font change can make people trust you more",
  "The counterintuitive science of building unbreakable habits",
  "Why the best ideas come in the shower — the neuroscience of insight",
  "How ancient navigators crossed the Pacific with no instruments",
  "The hidden economics of why concert tickets cost what they do",
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
  audience: string;
  goal: string;
  emoji: string;
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
  audience?: string;
  goal?: string;
  emoji?: string;
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

export default function GeneratorForm({
  isGenerating,
  maxSlides,
  onGenerate,
  onChange,
  planLimits,
  currentPlan,
  prefill,
}: Props) {
  const router = useRouter();
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
  const [audience, setAudience] = useState(() => resolveAudience(prefill?.audience));
  const [goal, setGoal] = useState<Goal>(() => resolveGoal(prefill?.goal));
  const [emoji, setEmoji] = useState<EmojiLevel>(() => resolveEmoji(prefill?.emoji));
  const [showOptions, setShowOptions] = useState(true);
  const [savingStyle, setSavingStyle] = useState(false);

  // Resolved limits — fall back to creator (= no gates) when not provided
  const lim = planLimits ?? PLAN_LIMITS.creator;

  const designValues: DesignOptionValues = {
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
    audience,
    goal,
    emoji,
  };

  function updateDesign<K extends keyof DesignOptionValues>(key: K, value: DesignOptionValues[K]) {
    switch (key) {
      case "tone": setTone(value as string); break;
      case "style": setStyle(value as string); break;
      case "format": setFormat(value as "auto" | PostFormat); break;
      case "template": setTemplate(value as "auto" | OverlayTemplate); break;
      case "accent": setAccent(value as string); break;
      case "handle": setHandle(value as string); break;
      case "textAmount": setTextAmount(value as TextAmount); break;
      case "fontTheme": setFontTheme(value as FontTheme); break;
      case "headlineCase": setHeadlineCase(value as HeadlineCase); break;
      case "align": setAlign(value as TextAlign); break;
      case "language": setLanguage(value as string); break;
      case "audience": setAudience(value as string); break;
      case "goal": setGoal(value as Goal); break;
      case "emoji": setEmoji(value as EmojiLevel); break;
    }
  }

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

  /** Drop a rich, specific prompt into the topic box (never repeats the current one). */
  function surpriseMe() {
    const pool = SURPRISE_TOPICS.filter((t) => t !== topic.trim());
    const next = pool[Math.floor(Math.random() * pool.length)] ?? SURPRISE_TOPICS[0];
    setTopic(next);
    textareaRef.current?.focus();
  }

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
      audience: audience.trim(),
      goal,
      emoji,
    });
  }

  /** Persist the current design as the user's Brand Kit (default for new posts). */
  async function saveStyle() {
    if (savingStyle) return;
    setSavingStyle(true);
    try {
      await saveBrandKit({
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
        audience: audience.trim(),
        goal,
        emoji,
      });
      toast.success("Brand Kit saved — new posts will start with this look");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save your Brand Kit");
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
          <button
            type="button"
            onClick={surpriseMe}
            className="flex items-center gap-1 text-xs bg-brand-600/15 hover:bg-brand-600/25 border border-brand-500/30 text-brand-200 px-2.5 py-1 rounded-lg transition-colors font-medium"
          >
            <Shuffle className="w-3 h-3" />
            Surprise me
          </button>
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
          title="Save the current design as your Brand Kit"
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-brand-300 transition-colors disabled:opacity-50"
        >
          {savingStyle ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Bookmark className="w-3.5 h-3.5" />
          )}
          Save Brand Kit
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
            <div className="pt-1">
              <DesignOptionsFields
                values={designValues}
                onChange={updateDesign}
                planLimits={lim}
                currentPlan={currentPlan}
                numSlides={numSlides}
                onNumSlidesChange={setNumSlides}
                maxSlides={maxSlides}
                showSlides
              />
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
