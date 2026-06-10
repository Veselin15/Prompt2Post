"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Zap } from "lucide-react";
import { clsx } from "clsx";
import GeneratorForm, { type GenerateOptions, type FormPrefill } from "@/components/generator/GeneratorForm";
import DesignPreview, { type DesignState } from "@/components/generator/DesignPreview";
import SlideGallery from "@/components/generator/SlideGallery";
import ContentPanel from "@/components/generator/ContentPanel";
import QuickStarts from "@/components/generator/QuickStarts";
import { fireConfetti } from "@/lib/confetti";
import type { GenerateEvent, PostStructure, CreativeContent, SlideData, Post } from "@/types";
import { PLAN_LIMITS, DEFAULT_ACCENT } from "@/types";
import type { Plan, PlanLimits } from "@/types";

interface Props {
  planKey: Plan;
  limits: PlanLimits;
  postsThisMonth: number;
  instagramConnected: boolean;
  instagramUsername: string | null;
  prefill?: FormPrefill;
}

interface Progress {
  message: string;
  value: number;
}

const DEFAULT_DESIGN: DesignState = {
  topic: "",
  format: "auto",
  template: "auto",
  accent: DEFAULT_ACCENT,
  fontTheme: "modern",
  headlineCase: "normal",
  textAlign: "center",
  textAmount: "balanced",
  handle: "",
};

const STAGES = [
  { key: "plan",   label: "Plan",   from: 0   },
  { key: "write",  label: "Write",  from: 17  },
  { key: "images", label: "Images", from: 33  },
  { key: "done",   label: "Done",   from: 100 },
];

export default function CreatePageClient({ planKey, limits, postsThisMonth, instagramConnected, instagramUsername, prefill }: Props) {
  const [isGenerating, setIsGenerating]               = useState(false);
  const [progress, setProgress]                       = useState<Progress | null>(null);
  const [structure, setStructure]                     = useState<PostStructure | null>(null);
  const [content, setContent]                         = useState<Omit<CreativeContent, "slides"> | null>(null);
  const [slides, setSlides]                           = useState<SlideData[]>([]);
  const [generatingSlideIndex, setGeneratingSlideIndex] = useState(-1);
  const [totalSlides, setTotalSlides]                 = useState(0);
  const [post, setPost]                               = useState<Post | null>(null);
  const [design, setDesign]                           = useState<DesignState>(DEFAULT_DESIGN);
  // Optimistically track posts used so the meter updates after each generation
  const [postsUsed, setPostsUsed]                     = useState(postsThisMonth);

  const resetState = useCallback(() => {
    setProgress(null);
    setStructure(null);
    setContent(null);
    setSlides([]);
    setGeneratingSlideIndex(-1);
    setTotalSlides(0);
    setPost(null);
  }, []);

  const handleGenerate = useCallback(
    async (opts: GenerateOptions) => {
      resetState();
      setIsGenerating(true);
      let completed = false;

      const handleEvent = (event: GenerateEvent) => {
        if (event.type === "done" || event.type === "error") completed = true;
        dispatchEvent(event);
      };

      const parseSseChunk = (chunk: string) => {
        for (const line of chunk.split("\n\n")) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          try {
            handleEvent(JSON.parse(trimmed.slice(6)) as GenerateEvent);
          } catch { /* malformed chunk */ }
        }
      };

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(opts),
        });
        if (!res.ok || !res.body) {
          const err = await res.json().catch(() => ({ error: "Request failed" }));
          throw new Error(err.error ?? "Failed to start generation");
        }
        const reader = res.body.getReader();
        const dec    = new TextDecoder();
        let buffer   = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += dec.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";
          parseSseChunk(lines.join("\n\n"));
        }
        // Flush any remaining event that arrived in the final chunk
        if (buffer.trim()) parseSseChunk(buffer);

        if (!completed) {
          setIsGenerating(false);
          setProgress(null);
          toast.error("Generation stopped unexpectedly. Please try again.");
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Generation failed");
        setIsGenerating(false);
        setProgress(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resetState]
  );

  function dispatchEvent(event: GenerateEvent) {
    switch (event.type) {
      case "status":
        setProgress({ message: event.message ?? "", value: event.progress ?? 0 });
        break;
      case "structure":
        setStructure(event.structure ?? null);
        setTotalSlides(event.structure?.num_slides ?? 0);
        break;
      case "content":
        setContent(event.content ?? null);
        break;
      case "slide": {
        const s = event.slide;
        if (!s) break;
        setGeneratingSlideIndex(s.index + 1 < s.total ? s.index + 1 : -1);
        setSlides((prev) => {
          const next = [...prev];
          next[s.index] = s;
          return next;
        });
        setProgress({ message: `Slide ${s.index + 1}/${s.total} ready`, value: event.progress ?? 0 });
        break;
      }
      case "done":
        setPost(event.post ?? null);
        if (event.post?.slides?.length) setSlides(event.post.slides);
        setGeneratingSlideIndex(-1);
        setIsGenerating(false);
        setProgress({ message: "Done!", value: 100 });
        setPostsUsed((n) => n + 1); // optimistic counter update
        toast.success("Post generated successfully!");
        fireConfetti();
        break;
      case "error":
        toast.error(event.error ?? "Something went wrong");
        setIsGenerating(false);
        setProgress(null);
        break;
    }
  }

  const showResult  = isGenerating || slides.length > 0 || structure !== null;
  const activeStage = progress?.value === 100
    ? 3
    : progress
      ? progress.value >= 33 ? 2 : progress.value >= 17 ? 1 : 0
      : -1;

  const monthlyLimit   = limits.posts_per_month;
  const hasMonthlyLimit = monthlyLimit !== Infinity;
  const usagePct       = hasMonthlyLimit ? Math.min(100, (postsUsed / monthlyLimit) * 100) : 0;
  const nearMonthLimit = hasMonthlyLimit && postsUsed / monthlyLimit >= 0.8;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* ── Page header ── */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Create a post</h1>
            {limits.priority && (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-yellow-400/10 text-yellow-300 border border-yellow-400/20 px-2 py-0.5 rounded-full">
                <Zap className="w-2.5 h-2.5" /> Priority
              </span>
            )}
          </div>
          <p className="text-white/50 text-sm mt-1">
            Describe a topic, dial in the look on the right, and generate a ready-to-post carousel.
          </p>
        </div>
        {post && !isGenerating && (
          <button
            onClick={resetState}
            className="shrink-0 text-sm bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white px-4 py-2 rounded-xl transition-colors"
          >
            + New post
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)]">
        {/* ── Left: controls + progress ── */}
        <div className="space-y-4">
          <QuickStarts currentTopic={design.topic} disabled={isGenerating} />

          <div className="glass rounded-2xl p-5">
            <GeneratorForm
              // Remount when the prefill changes (Quick starts / Idea Studio
              // push new URL params) so useState initializers re-run.
              key={JSON.stringify(prefill ?? {})}
              isGenerating={isGenerating}
              maxSlides={limits.max_slides}
              onGenerate={handleGenerate}
              onChange={setDesign}
              planLimits={limits}
              currentPlan={planKey}
              prefill={prefill}
            />
          </div>

          {/* ── Monthly usage meter ── */}
          {hasMonthlyLimit && (
            <div className="glass rounded-xl px-4 py-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className={clsx("font-medium", nearMonthLimit ? "text-amber-400" : "text-white/50")}>
                  {PLAN_LIMITS[planKey].label} plan
                </span>
                <span className={clsx(nearMonthLimit ? "text-amber-400" : "text-white/40")}>
                  {postsUsed} / {monthlyLimit} posts this month
                </span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={clsx(
                    "h-full rounded-full transition-all duration-500",
                    nearMonthLimit ? "bg-amber-400" : "bg-brand-500"
                  )}
                  style={{ width: `${usagePct}%` }}
                />
              </div>
              {nearMonthLimit && planKey !== "creator" && (
                <p className="text-[10px] text-amber-400/70 mt-1.5">
                  Running low —{" "}
                  <a href="/dashboard/billing" className="underline underline-offset-2 hover:text-amber-300 transition-colors">
                    upgrade your plan
                  </a>{" "}
                  for more posts.
                </p>
              )}
            </div>
          )}

          {/* ── Progress / stage tracker ── */}
          <AnimatePresence>
            {progress && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="glass rounded-2xl p-4"
              >
                <div className="flex items-center gap-1.5 mb-3">
                  {STAGES.map((s, i) => (
                    <div key={s.key} className="flex items-center gap-1.5 flex-1 last:flex-none">
                      <div
                        className={clsx(
                          "flex items-center gap-1.5 text-[11px] font-medium transition-colors",
                          i <= activeStage ? "text-brand-300" : "text-white/30"
                        )}
                      >
                        <span
                          className={clsx(
                            "w-1.5 h-1.5 rounded-full",
                            i < activeStage
                              ? "bg-brand-400"
                              : i === activeStage
                              ? "bg-brand-400 animate-pulse"
                              : "bg-white/20"
                          )}
                        />
                        {s.label}
                        {/* Priority badge on the Images stage for Creator */}
                        {s.key === "images" && limits.priority && i === activeStage && (
                          <Zap className="w-2.5 h-2.5 text-yellow-300" />
                        )}
                      </div>
                      {i < STAGES.length - 1 && (
                        <div
                          className={clsx(
                            "flex-1 h-px",
                            i < activeStage ? "bg-brand-500/40" : "bg-white/10"
                          )}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-white/60">{progress.message}</p>
                  <p className="text-xs text-brand-400 font-mono">{progress.value}%</p>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full"
                    animate={{ width: `${progress.value}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!limits.zip_download && !showResult && (
            <p className="text-xs text-white/30 text-center">
              Upgrade to Pro for ZIP downloads &amp; up to 10 slides.
            </p>
          )}
        </div>

        {/* ── Right: live preview → result ── */}
        <div className="space-y-4 lg:sticky lg:top-6 self-start">
          <AnimatePresence mode="wait">
            {showResult ? (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {slides.length > 0 || totalSlides > 0 ? (
                  <SlideGallery
                    slides={slides}
                    generating={generatingSlideIndex}
                    total={totalSlides || slides.length}
                    format={structure?.format}
                    topic={content?.topic ?? design.topic ?? "post"}
                    postId={post?.id}
                    editable={!isGenerating}
                  />
                ) : (
                  <div className="aspect-square max-w-sm mx-auto rounded-2xl border border-white/10 glass flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="w-8 h-8 border-2 border-brand-500/40 border-t-brand-400 rounded-full animate-spin mx-auto" />
                      <p className="text-white/40 text-xs">Planning your post…</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <DesignPreview design={design} />
                <p className="text-center text-[11px] text-white/30 mt-3">
                  Live preview · final images use AI-generated backgrounds
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {(structure || content) && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <ContentPanel
                  structure={structure}
                  content={content}
                  post={post}
                  hasZip={limits.zip_download}
                  canPostToInstagram={limits.instagram_posting}
                  instagramConnected={instagramConnected}
                  instagramUsername={instagramUsername}
                  canScheduleInstagram={limits.instagram_scheduling}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
