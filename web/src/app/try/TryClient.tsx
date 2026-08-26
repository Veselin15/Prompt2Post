"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Lock } from "lucide-react";
import SlideGallery from "@/components/generator/SlideGallery";
import type { GenerateEvent, SlideData } from "@/types";

const EXAMPLES = [
  "5 mistakes killing your gym progress",
  "Hidden gems in Lisbon",
  "How to save your first $10k",
  "3-ingredient protein breakfast",
];

const MAX_TOPIC_LEN = 120;

export default function TryClient() {
  const [topic, setTopic] = useState("");
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [total, setTotal] = useState(0);
  const [generating, setGenerating] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [finished, setFinished] = useState(false);

  function applyEvent(event: GenerateEvent) {
    switch (event.type) {
      case "status":
        setStatus(event.message ?? "");
        setProgress(event.progress ?? 0);
        break;
      case "structure":
        setTotal(event.structure?.num_slides ?? 0);
        break;
      case "slide": {
        const s = event.slide;
        if (!s) break;
        setTotal(s.total);
        setGenerating(s.index + 1 < s.total ? s.index + 1 : -1);
        setSlides((prev) => {
          const next = [...prev];
          next[s.index] = s;
          return next;
        });
        setProgress(event.progress ?? 0);
        setStatus(`Slide ${s.index + 1} of ${s.total} ready`);
        break;
      }
      case "done":
        setGenerating(-1);
        setBusy(false);
        setProgress(100);
        setStatus("");
        setFinished(true);
        break;
      case "error":
        setError(event.error ?? "Something went wrong.");
        setGenerating(-1);
        setBusy(false);
        setStatus("");
        break;
    }
  }

  async function run() {
    const clean = topic.trim();
    if (!clean || busy) return;

    setBusy(true);
    setError("");
    setSlides([]);
    setFinished(false);
    setGenerating(0);
    setProgress(2);
    setStatus("Starting…");

    const parseChunk = (chunk: string) => {
      for (const line of chunk.split("\n\n")) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;
        try {
          applyEvent(JSON.parse(trimmed.slice(6)) as GenerateEvent);
        } catch {
          /* malformed chunk */
        }
      }
    };

    try {
      const res = await fetch("/api/try", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: clean }),
      });

      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(body.error ?? "Request failed");
      }

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += dec.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        parseChunk(parts.join("\n\n"));
      }
      if (buffer.trim()) parseChunk(buffer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
      setBusy(false);
      setGenerating(-1);
      setStatus("");
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-12 sm:py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
          Try it. <span className="gradient-text">No account needed.</span>
        </h1>
        <p className="text-white/55 max-w-xl mx-auto">
          Type any topic and watch Prompt2Post plan, write, and design a real
          Instagram carousel — right here, in about a minute.
        </p>
      </div>

      {/* Input */}
      <div className="panel-strong rounded-3xl p-5 sm:p-7">
        <label htmlFor="try-topic" className="text-xs font-medium text-white/45 uppercase tracking-wider">
          Your topic
        </label>
        <input
          id="try-topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value.slice(0, MAX_TOPIC_LEN))}
          onKeyDown={(e) => e.key === "Enter" && run()}
          disabled={busy}
          placeholder="e.g. 5 mistakes killing your gym progress"
          className="mt-2 w-full rounded-2xl bg-black/30 border border-white/10 px-4 py-3.5 text-lg text-white placeholder:text-white/25 outline-none focus:border-brand-400/50 disabled:opacity-60"
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setTopic(ex)}
              disabled={busy}
              className="text-xs px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-white/55 hover:text-white hover:border-white/20 transition-colors disabled:opacity-40"
            >
              {ex}
            </button>
          ))}
        </div>

        <button
          onClick={run}
          disabled={busy || !topic.trim()}
          className="btn-shine mt-6 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-400 hover:to-purple-400 text-white font-semibold px-6 py-3.5 rounded-2xl transition-all disabled:opacity-50"
        >
          {busy ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              {status || "Working…"}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate my carousel
            </>
          )}
        </button>

        {busy && (
          <div className="mt-4 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-400 to-purple-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <p className="text-center text-xs text-white/35 mt-3">
          One free carousel per visitor, per day. No card, no sign-up.
        </p>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}
      </div>

      {/* Result */}
      {(slides.length > 0 || generating >= 0) && (
        <div className="mt-10">
          <SlideGallery
            slides={slides.filter(Boolean)}
            generating={generating}
            total={total}
            format="square"
            topic={topic || "carousel"}
          />
        </div>
      )}

      {/* Post-run conversion */}
      {finished && (
        <div className="mt-10 glass rounded-3xl p-7 text-center">
          <Lock className="w-5 h-5 text-brand-300 mx-auto mb-3" />
          <p className="text-lg font-semibold mb-1">This one&apos;s not saved.</p>
          <p className="text-white/50 text-sm mb-5 max-w-md mx-auto">
            Demo carousels are temporary. Create a free account to keep your
            posts, use all 4 formats, pick your own colours, and export.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-2xl font-medium transition-colors"
          >
            Create your free account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
