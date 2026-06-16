"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Layers,
  Trash2,
  Loader2,
  Share2,
  Link2,
  Check,
  CopyPlus,
} from "lucide-react";
import { toast } from "sonner";
import SlideGallery from "@/components/generator/SlideGallery";
import ContentPanel from "@/components/generator/ContentPanel";
import { POST_FORMATS, resolveFormat, type Post } from "@/types";

/** Create-page URL that reuses this post's topic + full design as the template. */
function templateHref(post: Post): string {
  const s = post.structure ?? ({} as Post["structure"]);
  const params = new URLSearchParams({ topic: post.topic });
  if (s.tone) params.set("tone", s.tone);
  if (s.style) params.set("style", s.style);
  if (s.format) params.set("format", s.format);
  if (s.template) params.set("template", s.template);
  if (s.accent_color) params.set("accent", s.accent_color);
  if (s.text_amount) params.set("textAmount", s.text_amount);
  if (s.font_theme) params.set("fontTheme", s.font_theme);
  if (s.headline_case) params.set("headlineCase", s.headline_case);
  if (s.text_align) params.set("textAlign", s.text_align);
  if (s.handle) params.set("handle", s.handle);
  if (post.num_slides) params.set("slides", String(post.num_slides));
  return `/dashboard/create?${params.toString()}`;
}

interface Props {
  post: Post;
  canPostToInstagram: boolean;
  instagramConnected: boolean;
  instagramUsername: string | null;
  canScheduleInstagram: boolean;
}

export default function PostDetailClient({
  post,
  canPostToInstagram,
  instagramConnected,
  instagramUsername,
  canScheduleInstagram,
}: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(post.share_token ?? null);
  const [shareBusy, setShareBusy] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const format = resolveFormat(post.structure?.format);
  const spec = POST_FORMATS[format];
  const shareUrl = shareToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/p/${shareToken}`
    : "";

  async function copyShareUrl(url: string) {
    await navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  }

  async function enableShare() {
    if (shareBusy) return;
    setShareBusy(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/share`, { method: "POST" });
      const data = (await res.json()) as { token?: string; url?: string; error?: string };
      if (!res.ok || !data.token) throw new Error(data.error ?? "Could not create the link");
      setShareToken(data.token);
      await copyShareUrl(`${window.location.origin}/p/${data.token}`);
      toast.success("Public link created & copied — anyone with it can view this post");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create the link");
    } finally {
      setShareBusy(false);
    }
  }

  async function disableShare() {
    if (shareBusy) return;
    setShareBusy(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/share`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not disable the link");
      setShareToken(null);
      toast.success("Public link disabled");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not disable the link");
    } finally {
      setShareBusy(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Post deleted");
      router.push("/dashboard/history");
      router.refresh();
    } catch {
      toast.error("Could not delete this post");
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <Link
          href="/dashboard/history"
          className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to history
        </Link>

        {/* Actions: template · share · delete (inline confirm) */}
        {confirming ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50">Delete this post?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 text-xs font-medium bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete
            </button>
            <button
              onClick={() => setConfirming(false)}
              disabled={deleting}
              className="text-xs text-white/40 hover:text-white/70 px-2 py-1.5 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href={templateHref(post)}
              title="Open the Create form with this post's topic and design pre-filled"
              className="flex items-center gap-1.5 text-xs text-white/50 hover:text-brand-300 border border-white/10 hover:border-brand-500/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              <CopyPlus className="w-3.5 h-3.5" />
              Use as template
            </Link>
            <button
              onClick={shareToken ? () => copyShareUrl(shareUrl) : enableShare}
              disabled={shareBusy}
              title={
                shareToken
                  ? "Copy the public link"
                  : "Create a public read-only link anyone can open"
              }
              className="flex items-center gap-1.5 text-xs text-white/50 hover:text-sky-300 border border-white/10 hover:border-sky-500/30 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {shareBusy ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : shareCopied ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : shareToken ? (
                <Link2 className="w-3.5 h-3.5" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              {shareCopied ? "Copied!" : shareToken ? "Copy link" : "Share"}
            </button>
            <button
              onClick={() => setConfirming(true)}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-red-300 border border-white/10 hover:border-red-500/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Active share-link bar */}
      {shareToken && (
        <div className="mb-5 flex items-center gap-3 glass rounded-xl px-4 py-2.5 border border-sky-500/15 text-xs">
          <Link2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <a
            href={`/p/${shareToken}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-sky-300 truncate transition-colors"
          >
            {shareUrl || `/p/${shareToken}`}
          </a>
          <span className="text-white/25 hidden sm:inline">· public, read-only</span>
          <button
            onClick={disableShare}
            disabled={shareBusy}
            className="ml-auto text-white/35 hover:text-red-300 shrink-0 transition-colors disabled:opacity-50"
          >
            Disable
          </button>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-xl font-bold">{post.topic}</h1>
        <div className="flex flex-wrap items-center gap-3 mt-2 text-white/40 text-xs">
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            {post.num_slides} slide{post.num_slides > 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(post.created_at).toLocaleDateString()}
          </span>
          <span className="bg-white/8 border border-white/10 px-2 py-0.5 rounded-full">
            {spec.label} · {spec.ratio}
          </span>
        </div>
      </div>

      {/* Gallery + content */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <SlideGallery
          slides={post.slides}
          format={format}
          topic={post.topic}
          postId={post.id}
          editable
        />
        <ContentPanel
          structure={post.structure}
          content={post.content}
          post={post}
          hasZip={!!post.zip_url}
          canPostToInstagram={canPostToInstagram}
          instagramConnected={instagramConnected}
          instagramUsername={instagramUsername}
          canScheduleInstagram={canScheduleInstagram}
        />
      </div>
    </div>
  );
}
