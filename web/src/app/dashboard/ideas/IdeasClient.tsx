"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb, Sparkles, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { clsx } from "clsx";
import { POST_FORMATS, type IdeaSuggestion } from "@/types";

const GOALS = ["Grow followers", "Drive engagement", "Educate my audience", "Promote a product", "Build authority"];

const NICHE_EXAMPLES = [
  "Personal finance for 20-somethings",
  "Home workout & calisthenics",
  "Indie game development",
  "Sustainable cooking",
  "Freelance design business",
];

/** Build the Create-page URL that pre-fills the generator with this idea. */
function ideaHref(idea: IdeaSuggestion): string {
  const params = new URLSearchParams({
    topic: `${idea.title} — ${idea.hook}`,
    tone: idea.suggested_tone,
    format: idea.suggested_format,
    slides: String(idea.suggested_slides),
  });
  return `/dashboard/create?${params.toString()}`;
}

export default function IdeasClient() {
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<IdeaSuggestion[]>([]);

  async function generate() {
    if (!niche.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: niche.trim(), audience: audience.trim(), goal }),
      });
      const data = (await res.json()) as { ideas?: IdeaSuggestion[]; error?: string };
      if (!res.ok || !data.ideas) throw new Error(data.error ?? "Could not generate ideas");
      setIdeas(data.ideas);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not generate ideas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-yellow-400/10 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-yellow-300" />
          </div>
          <h1 className="text-xl font-bold">Idea Studio</h1>
        </div>
        <p className="text-white/50 text-sm mt-2">
          Out of inspiration? Describe your niche and the AI proposes six post ideas — each one
          click away from a finished carousel. Ideas are free and don&apos;t use your monthly posts.
        </p>
      </div>

      {/* Input card */}
      <div className="glass rounded-2xl p-5 mb-6 space-y-4">
        <div>
          <label className="block text-xs text-white/50 mb-1.5 font-medium">
            Your niche or account theme
          </label>
          <input
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value.slice(0, 300))}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            placeholder='e.g. "Personal finance tips for 20-somethings"'
            disabled={loading}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-brand-500/60 transition-colors disabled:opacity-50"
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {NICHE_EXAMPLES.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNiche(n)}
                className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-white/55 hover:text-white/80 px-2.5 py-1 rounded-lg transition-colors"
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-white/50 mb-1.5 font-medium">
              Audience <span className="text-white/25">(optional)</span>
            </label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value.slice(0, 200))}
              placeholder="e.g. busy professionals, beginners"
              disabled={loading}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-brand-500/60 transition-colors disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1.5 font-medium">
              Goal <span className="text-white/25">(optional)</span>
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {GOALS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGoal(goal === g ? "" : g)}
                  disabled={loading}
                  className={clsx(
                    "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    goal === g
                      ? "bg-brand-600 text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={generate}
          disabled={!niche.trim() || loading}
          className={clsx(
            "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors",
            !niche.trim() || loading
              ? "bg-white/5 text-white/30 cursor-not-allowed"
              : "bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/30"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Brainstorming…
            </>
          ) : ideas.length > 0 ? (
            <>
              <RefreshCw className="w-4 h-4" />
              Generate new ideas
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate ideas
            </>
          )}
        </button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {ideas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            {ideas.map((idea, i) => (
              <motion.div
                key={`${idea.title}-${i}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass rounded-2xl p-5 flex flex-col gap-3 hover:bg-white/[0.07] transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm leading-snug">{idea.title}</h3>
                  <span className="shrink-0 text-[10px] uppercase tracking-wider bg-white/8 border border-white/10 text-white/50 px-2 py-0.5 rounded-full">
                    {POST_FORMATS[idea.suggested_format]?.label ?? idea.suggested_format} ·{" "}
                    {idea.suggested_slides} slide{idea.suggested_slides > 1 ? "s" : ""}
                  </span>
                </div>
                <p className="text-xs text-white/70 italic leading-relaxed">
                  &ldquo;{idea.hook}&rdquo;
                </p>
                <p className="text-[11px] text-white/40 leading-relaxed flex-1">{idea.angle}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-white/35 capitalize">
                    {idea.suggested_tone} tone
                  </span>
                  <Link
                    href={ideaHref(idea)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Create this post
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {ideas.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-white/20" />
          </div>
          <p className="text-white/40 text-sm max-w-sm">
            Your next six posts are one prompt away. Enter your niche above and let the AI do the
            brainstorming.
          </p>
        </div>
      )}
    </div>
  );
}
