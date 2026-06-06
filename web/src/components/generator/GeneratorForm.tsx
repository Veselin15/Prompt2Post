"use client";

import { useState } from "react";
import { Sparkles, ChevronDown } from "lucide-react";
import { clsx } from "clsx";

const TONES = ["auto", "inspirational", "educational", "funny", "dramatic", "professional", "promotional"];
const STYLES = ["auto", "cinematic", "vibrant", "minimalist", "neon", "vintage", "dreamy", "flat", "bold"];
const SLIDE_COUNTS = [1, 3, 5, 7, 10];

interface Props {
  isGenerating: boolean;
  maxSlides: number;
  onGenerate: (opts: { topic: string; tone: string; style: string; numSlides: number }) => void;
}

export default function GeneratorForm({ isGenerating, maxSlides, onGenerate }: Props) {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("auto");
  const [style, setStyle] = useState("auto");
  const [numSlides, setNumSlides] = useState(5);
  const [showOptions, setShowOptions] = useState(false);

  const cappedSlides = Math.min(numSlides, maxSlides);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;
    onGenerate({
      topic: topic.trim(),
      tone: tone === "auto" ? "" : tone,
      style: style === "auto" ? "" : style,
      numSlides: cappedSlides,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Topic input */}
      <div className="relative">
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter any topic… e.g. 'The surprising history of coffee' or 'Top productivity hacks'"
          rows={3}
          disabled={isGenerating}
          className={clsx(
            "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-white/30",
            "text-sm resize-none outline-none transition-all duration-200",
            "focus:border-brand-500/60 focus:bg-white/8",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as unknown as React.FormEvent);
            }
          }}
        />
        <div className="absolute bottom-3 right-3 text-white/20 text-xs">
          {topic.length}/200
        </div>
      </div>

      {/* Advanced options toggle */}
      <button
        type="button"
        onClick={() => setShowOptions((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
      >
        <ChevronDown className={clsx("w-3.5 h-3.5 transition-transform", showOptions && "rotate-180")} />
        {showOptions ? "Hide" : "Show"} options
      </button>

      {showOptions && (
        <div className="grid grid-cols-3 gap-3 animate-fade-in">
          {/* Tone */}
          <div>
            <label className="block text-xs text-white/50 mb-1.5 font-medium">Tone</label>
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

          {/* Style */}
          <div>
            <label className="block text-xs text-white/50 mb-1.5 font-medium">Visual Style</label>
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

          {/* Slides */}
          <div>
            <label className="block text-xs text-white/50 mb-1.5 font-medium">
              Slides (max {maxSlides})
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {SLIDE_COUNTS.filter((n) => n <= maxSlides).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNumSlides(n)}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    numSlides === n
                      ? "bg-brand-600 text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!topic.trim() || isGenerating}
        className={clsx(
          "w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all",
          !topic.trim() || isGenerating
            ? "bg-white/5 text-white/30 cursor-not-allowed"
            : "bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/30 hover:scale-[1.01]"
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
      </button>
    </form>
  );
}
