"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  Download,
  Hash,
  Loader2,
  Wand2,
  X,
  Repeat2,
  FileDown,
  Twitter,
  Linkedin,
  GalleryVerticalEnd,
} from "lucide-react";
import { toast } from "sonner";
import { clsx } from "clsx";
import { POST_FORMATS, OVERLAY_TEMPLATES, GOALS, resolveFormat, resolveTemplate } from "@/types";
import type { CreativeContent, PostStructure, Post, RepurposedContent } from "@/types";

interface Props {
  structure: PostStructure | null;
  content: Omit<CreativeContent, "slides"> | null;
  post: Post | null;
  hasZip: boolean;
}

interface CaptionVariant {
  label: string;
  caption: string;
}

export default function ContentPanel({
  structure,
  content,
  post,
  hasZip,
}: Props) {
  const [copied, setCopied]                 = useState(false);
  // Caption remix
  const [remixing, setRemixing]             = useState(false);
  const [variants, setVariants]             = useState<CaptionVariant[]>([]);
  const [applyingVariant, setApplyingVariant] = useState("");
  const [captionOverride, setCaptionOverride] = useState("");
  // Repurpose pack
  const [repurposing, setRepurposing]       = useState(false);
  const [pack, setPack]                     = useState<RepurposedContent | null>(
    content?.repurposed ?? null
  );
  const [packTab, setPackTab]               = useState<keyof Omit<RepurposedContent, "generated_at">>("tweet");
  const [packCopied, setPackCopied]         = useState(false);

  if (!structure && !content) return null;

  const caption = captionOverride || content?.social_caption || "";

  // ── Caption helpers ──────────────────────────────────────────────────────

  function buildFullCaption(): string {
    if (!content) return "";
    return [caption, "", content.hashtags.join(" ")].join("\n");
  }

  async function copyCaption() {
    if (!content) return;
    await navigator.clipboard.writeText(buildFullCaption());
    setCopied(true);
    toast.success("Caption copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRemix() {
    if (!post || remixing) return;
    setRemixing(true);
    try {
      const res = await fetch("/api/remix-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      });
      const data = (await res.json()) as { variants?: CaptionVariant[]; error?: string };
      if (!res.ok || !data.variants) throw new Error(data.error ?? "Remix failed");
      setVariants(data.variants);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remix the caption");
    } finally {
      setRemixing(false);
    }
  }

  async function applyVariant(variant: CaptionVariant) {
    if (!post || applyingVariant) return;
    setApplyingVariant(variant.label);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: variant.caption }),
      });
      if (!res.ok) throw new Error("Could not save the caption");
      setCaptionOverride(variant.caption);
      setVariants([]);
      toast.success(`Caption replaced with the ${variant.label.toLowerCase()} take`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the caption");
    } finally {
      setApplyingVariant("");
    }
  }

  // ── Repurpose helpers ────────────────────────────────────────────────────

  async function handleRepurpose() {
    if (!post || repurposing) return;
    setRepurposing(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/repurpose`, { method: "POST" });
      const data = (await res.json()) as { repurposed?: RepurposedContent; error?: string };
      if (!res.ok || !data.repurposed) throw new Error(data.error ?? "Repurpose failed");
      setPack(data.repurposed);
      toast.success("Cross-platform pack ready!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not repurpose the post");
    } finally {
      setRepurposing(false);
    }
  }

  async function copyPack(text: string) {
    await navigator.clipboard.writeText(text);
    setPackCopied(true);
    toast.success("Copied!");
    setTimeout(() => setPackCopied(false), 2000);
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Structure badges */}
      {structure && (
        <div className="flex flex-wrap gap-2">
          {[
            structure.tone,
            structure.style,
            structure.post_type,
            `${POST_FORMATS[resolveFormat(structure.format)].label} · ${POST_FORMATS[resolveFormat(structure.format)].ratio}`,
            OVERLAY_TEMPLATES[resolveTemplate(structure.template)].label,
            structure.audience ? `For: ${structure.audience}` : "",
            structure.goal ? GOALS[structure.goal]?.label : "",
            structure.color_mood,
          ]
            .filter(Boolean)
            .map((label) => (
              <span
                key={label}
                className="text-xs bg-white/8 border border-white/10 text-white/70 px-2.5 py-1 rounded-full capitalize"
              >
                {label}
              </span>
            ))}
        </div>
      )}

      {/* Hook */}
      {content?.hook && (
        <div className="glass rounded-xl p-4">
          <p className="text-xs font-semibold text-brand-400 mb-1">Hook</p>
          <p className="text-sm text-white/80 italic">&ldquo;{content.hook}&rdquo;</p>
        </div>
      )}

      {/* Caption */}
      {caption && (
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-white/60">Caption</p>
            <div className="flex items-center gap-3">
              {/* AI remix — available once the post exists */}
              {post && (
                <button
                  onClick={handleRemix}
                  disabled={remixing || !!applyingVariant}
                  title="Three AI-written alternative captions"
                  className="flex items-center gap-1 text-xs text-purple-300 hover:text-purple-200 transition-colors disabled:opacity-50"
                >
                  {remixing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="w-3.5 h-3.5" />
                  )}
                  {remixing ? "Remixing…" : "Remix"}
                </button>
              )}
              <button
                onClick={copyCaption}
                className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
          <p className="text-sm text-white/75 leading-relaxed">{caption}</p>

          {/* Remix variants */}
          {variants.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-white/40">Pick a take to replace the caption:</p>
                <button
                  onClick={() => setVariants([])}
                  className="text-white/25 hover:text-white/50 transition-colors"
                  aria-label="Dismiss variants"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {variants.map((v) => (
                <button
                  key={v.label}
                  onClick={() => applyVariant(v)}
                  disabled={!!applyingVariant}
                  className="w-full text-left bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-purple-400/30 rounded-lg p-3 transition-colors disabled:opacity-50 group"
                >
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-300/80 mb-1">
                    {applyingVariant === v.label ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Wand2 className="w-3 h-3" />
                    )}
                    {v.label}
                  </span>
                  <span className="block text-xs text-white/65 leading-relaxed">{v.caption}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hashtags */}
      {content?.hashtags && content.hashtags.length > 0 && (
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Hash className="w-3.5 h-3.5 text-blue-400" />
            <p className="text-xs font-semibold text-white/60">Hashtags</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {content.hashtags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Downloads: ZIP + PDF (LinkedIn document carousel) */}
      {hasZip && post && (
        <div className="flex gap-2">
          {post.zip_url && (
            <a
              href={post.zip_url}
              download
              className="flex-1 flex items-center justify-center gap-2 py-3 glass rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 transition-colors border border-white/10"
            >
              <Download className="w-4 h-4 text-green-400" />
              ZIP ({post.num_slides} slides)
            </a>
          )}
          <a
            href={`/api/posts/${post.id}/pdf`}
            title="One PDF page per slide — upload to LinkedIn as a document post"
            className="flex-1 flex items-center justify-center gap-2 py-3 glass rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 transition-colors border border-white/10"
          >
            <FileDown className="w-4 h-4 text-sky-400" />
            PDF for LinkedIn
          </a>
        </div>
      )}

      {/* ── Repurpose pack ───────────────────────────────────────────────── */}
      {post && (
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Repeat2 className="w-3.5 h-3.5 text-sky-400" />
              <p className="text-xs font-semibold text-white/60">Repurpose everywhere</p>
            </div>
            {pack && (
              <button
                onClick={handleRepurpose}
                disabled={repurposing}
                className="flex items-center gap-1 text-xs text-sky-300 hover:text-sky-200 transition-colors disabled:opacity-50"
              >
                {repurposing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5" />
                )}
                {repurposing ? "Rewriting…" : "Regenerate"}
              </button>
            )}
          </div>

          {!pack ? (
            <>
              <p className="text-[11px] text-white/35 mb-3">
                One click turns this carousel into a native X post, a LinkedIn post, and a
                Story hook. Free — no post credit used.
              </p>
              <button
                onClick={handleRepurpose}
                disabled={repurposing}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold bg-sky-600/20 border border-sky-500/30 text-sky-300 hover:bg-sky-600/30 transition-colors disabled:opacity-50"
              >
                {repurposing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Writing 3 platform versions…
                  </>
                ) : (
                  <>
                    <Repeat2 className="w-3.5 h-3.5" />
                    Generate cross-platform pack
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="mt-2">
              {/* Tabs */}
              <div className="flex gap-1.5 mb-3">
                {(
                  [
                    { key: "tweet", label: "X / Twitter", icon: <Twitter className="w-3 h-3" /> },
                    { key: "linkedin", label: "LinkedIn", icon: <Linkedin className="w-3 h-3" /> },
                    { key: "story_hook", label: "Story", icon: <GalleryVerticalEnd className="w-3 h-3" /> },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setPackTab(t.key)}
                    className={clsx(
                      "flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border transition-colors",
                      packTab === t.key
                        ? "bg-sky-600/20 border-sky-500/30 text-sky-300"
                        : "bg-white/[0.03] border-white/10 text-white/40 hover:text-white/70"
                    )}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Active version */}
              <div className="bg-white/[0.04] border border-white/10 rounded-lg p-3">
                <p className="text-xs text-white/70 leading-relaxed whitespace-pre-wrap">
                  {pack[packTab]}
                </p>
              </div>
              <button
                onClick={() => copyPack(pack[packTab])}
                className="mt-2 flex items-center gap-1 text-xs text-sky-300 hover:text-sky-200 transition-colors"
              >
                {packCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {packCopied ? "Copied!" : "Copy this version"}
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
