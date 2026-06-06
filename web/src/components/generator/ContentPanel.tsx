"use client";

import { useState } from "react";
import { Copy, Check, Download, Hash } from "lucide-react";
import { toast } from "sonner";
import type { CreativeContent, PostStructure, Post } from "@/types";

interface Props {
  structure: PostStructure | null;
  content: Omit<CreativeContent, "slides"> | null;
  post: Post | null;
  hasZip: boolean;
}

export default function ContentPanel({ structure, content, post, hasZip }: Props) {
  const [copied, setCopied] = useState(false);

  if (!structure && !content) return null;

  async function copyCaption() {
    if (!content) return;
    const text = [
      content.social_caption,
      "",
      content.hashtags.join(" "),
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Caption copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Structure badge */}
      {structure && (
        <div className="flex flex-wrap gap-2">
          {[
            { label: structure.tone },
            { label: structure.style },
            { label: structure.post_type },
            { label: structure.color_mood },
          ].map((b) => (
            <span key={b.label} className="text-xs bg-white/8 border border-white/10 text-white/70 px-2.5 py-1 rounded-full capitalize">
              {b.label}
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
      {content?.social_caption && (
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-white/60">Caption</p>
            <button
              onClick={copyCaption}
              className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-sm text-white/75 leading-relaxed">{content.social_caption}</p>
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

      {/* ZIP download */}
      {hasZip && post?.zip_url && (
        <a
          href={post.zip_url}
          download
          className="flex items-center justify-center gap-2 w-full py-3 glass rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 transition-colors border border-white/10"
        >
          <Download className="w-4 h-4 text-green-400" />
          Download ZIP ({post.num_slides} slides)
        </a>
      )}
    </div>
  );
}
