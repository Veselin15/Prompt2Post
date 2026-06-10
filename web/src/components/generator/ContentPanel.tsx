"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  Download,
  Hash,
  Instagram,
  ExternalLink,
  Lock,
  Loader2,
  Wand2,
  CalendarClock,
  X,
  Repeat2,
  FileDown,
  Twitter,
  Linkedin,
  GalleryVerticalEnd,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { clsx } from "clsx";
import { POST_FORMATS, OVERLAY_TEMPLATES, resolveFormat, resolveTemplate } from "@/types";
import type { CreativeContent, PostStructure, Post, RepurposedContent } from "@/types";

interface Props {
  structure: PostStructure | null;
  content: Omit<CreativeContent, "slides"> | null;
  post: Post | null;
  hasZip: boolean;
  // Instagram integration
  canPostToInstagram: boolean;        // plan allows it
  instagramConnected: boolean;        // account is linked
  instagramUsername: string | null;   // @handle for display
  canScheduleInstagram: boolean;      // Creator-only scheduling
}

type IgState = "idle" | "expanded" | "posting" | "posted" | "error" | "scheduled";

interface CaptionVariant {
  label: string;
  caption: string;
}

export default function ContentPanel({
  structure,
  content,
  post,
  hasZip,
  canPostToInstagram,
  instagramConnected,
  instagramUsername,
  canScheduleInstagram,
}: Props) {
  const [copied, setCopied]                 = useState(false);
  const [igState, setIgState]               = useState<IgState>("idle");
  const [igCaption, setIgCaption]           = useState("");
  const [igError, setIgError]               = useState("");
  const [postedId, setPostedId]             = useState("");
  const [scheduledFor, setScheduledFor]     = useState("");   // datetime-local value
  const [scheduledWhen, setScheduledWhen]   = useState("");   // confirmation display
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

  // ── Instagram helpers ────────────────────────────────────────────────────

  function openIgPanel() {
    setIgCaption(buildFullCaption());
    setIgState("expanded");
    setIgError("");
  }

  async function handlePostNow() {
    if (!post) return;
    const imageUrls = post.slides.map((s) => s.image_url).filter((u): u is string => !!u);
    if (imageUrls.length === 0) {
      toast.error("No image URLs found on this post.");
      return;
    }

    setIgState("posting");
    setIgError("");

    try {
      const res = await fetch("/api/instagram/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrls, caption: igCaption }),
      });
      const data = await res.json() as { mediaId?: string; error?: string; tokenInvalid?: boolean };

      if (!res.ok) {
        if (data.tokenInvalid) {
          // Prompt reconnect — state goes back to disconnected visually
          setIgError(
            "Your Instagram session expired. Reconnect your account in Billing → Connected Accounts."
          );
        } else {
          setIgError(data.error ?? "Failed to post to Instagram.");
        }
        setIgState("error");
        return;
      }

      setPostedId(data.mediaId ?? "");
      setIgState("posted");
      toast.success("Posted to Instagram!");
    } catch {
      setIgError("Network error. Please try again.");
      setIgState("error");
    }
  }

  async function handleSchedule() {
    if (!post || !scheduledFor) return;
    const when = new Date(scheduledFor);
    if (Number.isNaN(when.getTime())) {
      toast.error("Pick a valid date and time");
      return;
    }

    setIgState("posting");
    setIgError("");

    try {
      const res = await fetch("/api/instagram/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.id,
          caption: igCaption,
          scheduledFor: when.toISOString(),
        }),
      });
      const data = (await res.json()) as { scheduled?: unknown; error?: string };
      if (!res.ok) {
        setIgError(data.error ?? "Could not schedule the post.");
        setIgState("error");
        return;
      }

      setScheduledWhen(
        when.toLocaleString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      setIgState("scheduled");
      toast.success("Post scheduled!");
    } catch {
      setIgError("Network error. Please try again.");
      setIgState("error");
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  const imageCount  = post?.slides.filter((s) => s.image_url).length ?? 0;
  const postReady   = !!post && imageCount > 0;

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

      {/* ── Instagram section ─────────────────────────────────────────────── */}
      <InstagramSection
        canPost={canPostToInstagram}
        connected={instagramConnected}
        username={instagramUsername}
        postReady={postReady}
        canSchedule={canScheduleInstagram}
        igState={igState}
        igCaption={igCaption}
        igError={igError}
        postedId={postedId}
        scheduledFor={scheduledFor}
        scheduledWhen={scheduledWhen}
        onScheduledForChange={setScheduledFor}
        onOpenPanel={openIgPanel}
        onCaptionChange={setIgCaption}
        onPostNow={handlePostNow}
        onSchedule={handleSchedule}
        onReset={() => setIgState("idle")}
      />
    </div>
  );
}

// ── Instagram section sub-component ─────────────────────────────────────────

interface IgSectionProps {
  canPost: boolean;
  connected: boolean;
  username: string | null;
  postReady: boolean;
  canSchedule: boolean;
  igState: IgState;
  igCaption: string;
  igError: string;
  postedId: string;
  scheduledFor: string;
  scheduledWhen: string;
  onScheduledForChange: (v: string) => void;
  onOpenPanel: () => void;
  onCaptionChange: (v: string) => void;
  onPostNow: () => void;
  onSchedule: () => void;
  onReset: () => void;
}

/** datetime-local string for "now + 1 hour", in the user's local time. */
function defaultScheduleValue(): string {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function InstagramSection({
  canPost, connected, username, postReady, canSchedule,
  igState, igCaption, igError, postedId, scheduledFor, scheduledWhen,
  onScheduledForChange, onOpenPanel, onCaptionChange, onPostNow, onSchedule, onReset,
}: IgSectionProps) {
  const [showSchedule, setShowSchedule] = useState(false);

  // Plan upgrade prompt
  if (!canPost) {
    return (
      <div className="flex items-center gap-3 glass rounded-xl p-4 border border-white/[0.06]">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#E4405F]/10 shrink-0">
          <Instagram className="w-4 h-4 text-[#E4405F]/50" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white/40 flex items-center gap-1.5">
            <Lock className="w-3 h-3" />
            Post to Instagram
          </p>
          <p className="text-[11px] text-white/25 mt-0.5">
            Upgrade to{" "}
            <a href="/dashboard/billing" className="underline hover:text-white/40 transition-colors">
              Pro or Creator
            </a>{" "}
            to publish directly.
          </p>
        </div>
      </div>
    );
  }

  // Not connected yet
  if (!connected) {
    return (
      <a
        href={`/api/instagram/connect?return_to=${encodeURIComponent("/dashboard/create")}`}
        className="flex items-center gap-3 w-full glass rounded-xl p-4 border border-[#E4405F]/20 hover:border-[#E4405F]/40 hover:bg-[#E4405F]/5 transition-colors group"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#E4405F]/15 shrink-0 group-hover:bg-[#E4405F]/25 transition-colors">
          <Instagram className="w-4 h-4 text-[#E4405F]" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-white/80">Connect Instagram</p>
          <p className="text-[11px] text-white/40 mt-0.5">
            Link your Business or Creator account to post directly.
          </p>
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40 shrink-0 transition-colors" />
      </a>
    );
  }

  // Successfully posted
  if (igState === "posted") {
    return (
      <div className="glass rounded-xl p-4 border border-green-500/20 bg-green-500/5">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/15 shrink-0">
            <Check className="w-4 h-4 text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-green-300">Posted to Instagram!</p>
            <p className="text-[11px] text-white/40 mt-0.5">
              Your post is live on{" "}
              <span className="text-white/60">@{username}</span>
              {postedId && (
                <>
                  {" · "}
                  <a
                    href={`https://www.instagram.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-white/60 transition-colors"
                  >
                    Open Instagram ↗
                  </a>
                </>
              )}
            </p>
          </div>
          <button
            onClick={onReset}
            className="text-[11px] text-white/25 hover:text-white/50 shrink-0 transition-colors"
          >
            Post again
          </button>
        </div>
      </div>
    );
  }

  // Successfully scheduled
  if (igState === "scheduled") {
    return (
      <div className="glass rounded-xl p-4 border border-brand-500/20 bg-brand-600/5">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-600/20 shrink-0">
            <CalendarClock className="w-4 h-4 text-brand-300" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-brand-300">Post scheduled!</p>
            <p className="text-[11px] text-white/40 mt-0.5">
              Publishing to <span className="text-white/60">@{username}</span> on{" "}
              <span className="text-white/60">{scheduledWhen}</span>
              {" · "}
              <Link
                href="/dashboard/scheduled"
                className="underline hover:text-white/60 transition-colors"
              >
                View queue
              </Link>
            </p>
          </div>
          <button
            onClick={onReset}
            className="text-[11px] text-white/25 hover:text-white/50 shrink-0 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // Collapsed trigger button (not expanded yet)
  if (igState === "idle" || igState === "error") {
    return (
      <div className="space-y-2">
        <button
          onClick={onOpenPanel}
          disabled={!postReady}
          className={clsx(
            "flex items-center gap-3 w-full rounded-xl p-4 border transition-colors",
            postReady
              ? "glass border-[#E4405F]/20 hover:border-[#E4405F]/40 hover:bg-[#E4405F]/5 group cursor-pointer"
              : "glass border-white/[0.06] opacity-40 cursor-not-allowed"
          )}
        >
          <div className={clsx(
            "flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-colors",
            postReady ? "bg-[#E4405F]/15 group-hover:bg-[#E4405F]/25" : "bg-white/5"
          )}>
            <Instagram className={clsx("w-4 h-4", postReady ? "text-[#E4405F]" : "text-white/30")} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-xs font-semibold text-white/80">
              Post to Instagram
              {username && (
                <span className="ml-1.5 text-white/40 font-normal">@{username}</span>
              )}
            </p>
            <p className="text-[11px] text-white/40 mt-0.5">
              {postReady
                ? canSchedule
                  ? "Publish now or schedule for the perfect time."
                  : "Publish this post directly to your Instagram account."
                : "Generate a post first to enable Instagram publishing."}
            </p>
          </div>
        </button>

        {igState === "error" && igError && (
          <p className="text-[11px] text-red-400/80 px-1">{igError}</p>
        )}
      </div>
    );
  }

  // Expanded form (igState === "expanded" | "posting")
  const isPosting = igState === "posting";

  return (
    <div className="glass rounded-xl border border-[#E4405F]/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#E4405F]/15 shrink-0">
          <Instagram className="w-3.5 h-3.5 text-[#E4405F]" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-white/80">
            Post to Instagram
            {username && <span className="ml-1.5 text-white/40 font-normal">· @{username}</span>}
          </p>
        </div>
        {!isPosting && (
          <button
            onClick={onReset}
            className="text-[11px] text-white/25 hover:text-white/50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Caption editor */}
      <div className="p-4 space-y-3">
        <div>
          <label className="text-[11px] text-white/40 mb-1.5 block">Caption</label>
          <textarea
            value={igCaption}
            onChange={(e) => onCaptionChange(e.target.value)}
            disabled={isPosting}
            rows={5}
            className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 leading-relaxed resize-none focus:outline-none focus:border-white/20 placeholder:text-white/20 disabled:opacity-50"
            placeholder="Caption + hashtags…"
          />
          <p className="text-[10px] text-white/25 mt-1">{igCaption.length} chars</p>
        </div>

        {/* Schedule picker (Creator, toggled open) */}
        {canSchedule && showSchedule && (
          <div>
            <label className="text-[11px] text-white/40 mb-1.5 block">Publish at</label>
            <input
              type="datetime-local"
              value={scheduledFor}
              min={defaultScheduleValue().slice(0, 16)}
              onChange={(e) => onScheduledForChange(e.target.value)}
              disabled={isPosting}
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-white/20 disabled:opacity-50 [color-scheme:dark]"
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {showSchedule && canSchedule ? (
            <>
              {/* Confirm schedule */}
              <button
                onClick={onSchedule}
                disabled={isPosting || !igCaption.trim() || !scheduledFor}
                className={clsx(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-colors",
                  "bg-brand-600 hover:bg-brand-500 text-white",
                  "disabled:opacity-40 disabled:cursor-not-allowed"
                )}
              >
                {isPosting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Scheduling…
                  </>
                ) : (
                  <>
                    <CalendarClock className="w-3.5 h-3.5" />
                    Schedule post
                  </>
                )}
              </button>
              <button
                onClick={() => setShowSchedule(false)}
                disabled={isPosting}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium glass border border-white/10 text-white/50 hover:text-white/80 transition-colors disabled:opacity-50"
              >
                Back
              </button>
            </>
          ) : (
            <>
              {/* Post Now */}
              <button
                onClick={onPostNow}
                disabled={isPosting || !igCaption.trim()}
                className={clsx(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-colors",
                  "bg-gradient-to-r from-[#E4405F] to-[#f77737]",
                  "hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white"
                )}
              >
                {isPosting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Posting…
                  </>
                ) : (
                  <>
                    <Instagram className="w-3.5 h-3.5" />
                    Post Now
                  </>
                )}
              </button>

              {/* Schedule (Creator only) */}
              {canSchedule ? (
                <button
                  onClick={() => {
                    if (!scheduledFor) onScheduledForChange(defaultScheduleValue());
                    setShowSchedule(true);
                  }}
                  disabled={isPosting}
                  title="Pick a date & time — the post publishes automatically"
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium glass border border-brand-500/30 text-brand-300 hover:bg-brand-600/10 transition-colors disabled:opacity-50"
                >
                  <CalendarClock className="w-3.5 h-3.5" />
                  Schedule
                </button>
              ) : (
                <button
                  disabled
                  title="Post scheduling is a Creator feature"
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium glass border border-white/[0.06] text-white/20 cursor-not-allowed"
                >
                  <Lock className="w-3 h-3" />
                  Schedule
                </button>
              )}
            </>
          )}
        </div>

        <p className="text-[10px] text-white/25">
          Instagram requires a Business or Creator account linked to a Facebook Page.
          Max 25 posts per 24 hours.
        </p>
      </div>
    </div>
  );
}
