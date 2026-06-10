"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  RefreshCw,
  Pencil,
  X,
  Check,
  Wand2,
} from "lucide-react";
import { clsx } from "clsx";
import { toast } from "sonner";
import { POST_FORMATS, type SlideData, type PostFormat } from "@/types";
import { downloadUrl, downloadSlides, slugify } from "@/lib/download";

interface Props {
  slides: SlideData[];
  generating?: number; // index of slide currently being generated (-1 = none)
  total?: number;
  format?: PostFormat;
  topic?: string;
  /** When set (with `editable`), enables per-slide editing/regeneration. */
  postId?: string;
  editable?: boolean;
}

/** Append a cache-busting token so an overwritten image file is re-fetched. */
function withVersion(url: string | undefined, version?: number): string | undefined {
  if (!url) return url;
  return version ? `${url}${url.includes("?") ? "&" : "?"}v=${version}` : url;
}

export default function SlideGallery({
  slides,
  generating = -1,
  total,
  format = "square",
  topic = "post",
  postId,
  editable = false,
}: Props) {
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState(false);

  // Edit state — overrides hold locally-edited slides; versions cache-bust images.
  const [overrides, setOverrides] = useState<Record<number, SlideData>>({});
  const [versions, setVersions] = useState<Record<number, number>>({});
  const [working, setWorking] = useState<"" | "reimage" | "recompose" | "rewrite">("");
  const [editing, setEditing] = useState(false);
  const [draftHeadline, setDraftHeadline] = useState("");
  const [draftBody, setDraftBody] = useState("");

  // Leaving a slide closes any open editor on it.
  useEffect(() => {
    setEditing(false);
  }, [active]);

  if (slides.length === 0 && generating === -1) return null;

  const spec = POST_FORMATS[format] ?? POST_FORMATS.square;
  const aspectRatio = `${spec.width} / ${spec.height}`;

  const displayTotal = total ?? slides.length;
  // Pad to displayTotal so thumbnail indices stay aligned (sparse slots = still generating)
  const showSlides: (SlideData | undefined)[] = Array.from(
    { length: Math.max(slides.length, displayTotal) },
    (_, i) => overrides[i] ?? slides[i]
  );

  // Add skeleton slots for slides still being generated
  const readySlides = showSlides.filter((s): s is SlideData => s != null);
  const activeSlide = showSlides[active];
  const allReady = readySlides.length > 0 && readySlides.length >= displayTotal && generating === -1;

  const canEdit = editable && !!postId && !!activeSlide?.image_url && generating === -1;
  const activeImageUrl = withVersion(activeSlide?.image_url, versions[active]);

  async function saveOne() {
    if (!activeImageUrl) return;
    setBusy(true);
    try {
      await downloadUrl(activeImageUrl, `${slugify(topic)}_slide_${String(active + 1).padStart(2, "0")}.jpg`);
    } catch {
      toast.error("Could not download image");
    } finally {
      setBusy(false);
    }
  }

  async function saveAll() {
    setBusy(true);
    try {
      await downloadSlides(readySlides, topic);
      toast.success(`Downloaded ${readySlides.length} image${readySlides.length > 1 ? "s" : ""}`);
    } catch {
      toast.error("Could not download images");
    } finally {
      setBusy(false);
    }
  }

  // ── Editing ────────────────────────────────────────────────────────────────

  async function callSlideApi(
    action: "reimage" | "recompose" | "rewrite",
    payload: { headline?: string; body?: string } = {}
  ) {
    if (!postId) return;
    setWorking(action);
    try {
      const res = await fetch(`/api/posts/${postId}/slide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index: active, action, ...payload }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        slide?: SlideData;
        version?: number;
        error?: string;
      };
      if (!res.ok || !data.slide) {
        throw new Error(data.error ?? "Update failed");
      }
      setOverrides((prev) => ({ ...prev, [active]: data.slide! }));
      setVersions((prev) => ({ ...prev, [active]: data.version ?? Date.now() }));
      toast.success(
        action === "reimage"
          ? "New image generated"
          : action === "rewrite"
          ? "Copy rewritten by AI"
          : "Slide updated"
      );
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update slide");
      return false;
    } finally {
      setWorking("");
    }
  }

  function openEditor() {
    if (!activeSlide) return;
    setDraftHeadline(activeSlide.headline ?? "");
    setDraftBody(activeSlide.body ?? "");
    setEditing(true);
  }

  async function saveText() {
    if (!draftHeadline.trim()) {
      toast.error("Headline can't be empty");
      return;
    }
    const ok = await callSlideApi("recompose", {
      headline: draftHeadline,
      body: draftBody,
    });
    if (ok) setEditing(false);
  }

  const isWorking = working !== "";

  return (
    <div className="space-y-4">
      {/* Main viewer */}
      <div
        className="relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden bg-white/5 border border-white/10"
        style={{ aspectRatio }}
      >
        {activeSlide?.image_url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImageUrl}
              alt={activeSlide.headline}
              className="w-full h-full object-cover"
            />
            {/* Working overlay (regenerating / recompositing this slide) */}
            {isWorking && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Loader2 className="w-7 h-7 text-brand-400 animate-spin mx-auto" />
                  <p className="text-white/70 text-xs">
                    {working === "reimage"
                      ? "Generating a new image…"
                      : working === "rewrite"
                      ? "AI is rewriting this slide…"
                      : "Updating slide…"}
                  </p>
                </div>
              </div>
            )}
            {/* Per-slide download */}
            <button
              onClick={saveOne}
              disabled={busy || isWorking}
              title="Download this image"
              className="absolute bottom-3 right-3 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors disabled:opacity-50"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            </button>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {generating === active ? (
              <div className="text-center space-y-2">
                <div className="w-8 h-8 border-2 border-brand-500/40 border-t-brand-400 rounded-full animate-spin mx-auto" />
                <p className="text-white/40 text-xs">Generating slide {active + 1}…</p>
              </div>
            ) : (
              <div className="w-full h-full shimmer" />
            )}
          </div>
        )}

        {/* Slide counter overlay */}
        {displayTotal > 1 && (
          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
            {active + 1}/{displayTotal}
          </div>
        )}

        {/* Nav arrows */}
        {displayTotal > 1 && (
          <>
            <button
              onClick={() => setActive((v) => Math.max(0, v - 1))}
              disabled={active === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white disabled:opacity-30 hover:bg-black/60 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActive((v) => Math.min(displayTotal - 1, v + 1))}
              disabled={active >= displayTotal - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white disabled:opacity-30 hover:bg-black/60 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* ── Edit toolbar (owner, finished slide) ──────────────────────────── */}
      {canEdit && (
        <div className="max-w-sm mx-auto w-full space-y-2">
          {!editing ? (
            <div className="flex gap-2">
              <button
                onClick={() => callSlideApi("reimage")}
                disabled={isWorking}
                title="Generate a fresh AI background for this slide"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 glass rounded-xl text-xs font-medium text-white/80 hover:bg-white/10 transition-colors border border-white/10 disabled:opacity-50"
              >
                <RefreshCw className={clsx("w-3.5 h-3.5 text-brand-400", working === "reimage" && "animate-spin")} />
                New image
              </button>
              <button
                onClick={() => callSlideApi("rewrite")}
                disabled={isWorking}
                title="AI rewrites this slide's copy — same idea, sharper words"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 glass rounded-xl text-xs font-medium text-white/80 hover:bg-white/10 transition-colors border border-white/10 disabled:opacity-50"
              >
                {working === "rewrite" ? (
                  <Loader2 className="w-3.5 h-3.5 text-purple-300 animate-spin" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5 text-purple-300" />
                )}
                AI rewrite
              </button>
              <button
                onClick={openEditor}
                disabled={isWorking}
                title="Edit the headline and supporting text yourself"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 glass rounded-xl text-xs font-medium text-white/80 hover:bg-white/10 transition-colors border border-white/10 disabled:opacity-50"
              >
                <Pencil className="w-3.5 h-3.5 text-brand-400" />
                Edit text
              </button>
            </div>
          ) : (
            <div className="glass rounded-xl p-3 space-y-2.5 border border-brand-500/20">
              <div>
                <label className="text-[11px] text-white/40 mb-1 block">Headline</label>
                <input
                  type="text"
                  value={draftHeadline}
                  onChange={(e) => setDraftHeadline(e.target.value.slice(0, 90))}
                  disabled={isWorking}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-brand-500/50 disabled:opacity-50"
                  placeholder="Short, punchy headline"
                />
              </div>
              <div>
                <label className="text-[11px] text-white/40 mb-1 block">Supporting line</label>
                <textarea
                  value={draftBody}
                  onChange={(e) => setDraftBody(e.target.value.slice(0, 420))}
                  disabled={isWorking}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 leading-relaxed resize-none outline-none focus:border-brand-500/50 disabled:opacity-50"
                  placeholder="Optional supporting text (shown for Balanced / Detailed posts)"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={saveText}
                  disabled={isWorking || !draftHeadline.trim()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-colors disabled:opacity-40"
                >
                  {working === "recompose" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  Save text
                </button>
                <button
                  onClick={() => setEditing(false)}
                  disabled={isWorking}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium glass border border-white/10 text-white/60 hover:text-white/90 transition-colors disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </div>
              <p className="text-[10px] text-white/25 leading-relaxed">
                Edits re-render text over the same background instantly. &ldquo;New image&rdquo; fetches a
                fresh AI background — neither counts against your monthly posts.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Thumbnail strip */}
      {displayTotal > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 justify-center">
          {showSlides.slice(0, displayTotal).map((s, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={clsx(
                "w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all",
                active === i ? "border-brand-400 scale-110" : "border-transparent opacity-60 hover:opacity-90"
              )}
            >
              {s?.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={withVersion(s.image_url, versions[i])} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full shimmer" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Download all */}
      {allReady && (
        <button
          onClick={saveAll}
          disabled={busy || isWorking}
          className="flex items-center justify-center gap-2 w-full py-2.5 glass rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 transition-colors border border-white/10 disabled:opacity-50"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-green-400" />}
          Download {readySlides.length > 1 ? `all ${readySlides.length} images` : "image"}
        </button>
      )}

      {/* Slide text content */}
      {activeSlide && (
        <div className="glass rounded-xl p-4 animate-fade-in">
          <p className="font-bold text-sm mb-1">{activeSlide.headline}</p>
          {activeSlide.body && (
            <p className="text-white/60 text-xs leading-relaxed">{activeSlide.body}</p>
          )}
        </div>
      )}
    </div>
  );
}
