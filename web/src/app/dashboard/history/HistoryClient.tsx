"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X, Calendar, FileArchive, Layers, ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";
import { clsx } from "clsx";
import { POST_FORMATS, type PostFormat } from "@/types";

/** The lightweight shape the server page passes down — keeps the payload small. */
export interface HistoryItem {
  id: string;
  topic: string;
  tone: string;
  numSlides: number;
  createdAt: string; // ISO
  format: PostFormat;
  thumb: string | null;
  hasZip: boolean;
}

interface Props {
  posts: HistoryItem[];
}

export default function HistoryClient({ posts }: Props) {
  const [query, setQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState<"all" | PostFormat>("all");
  const [oldestFirst, setOldestFirst] = useState(false);

  // Only offer format pills for formats that actually appear in the list.
  const presentFormats = useMemo(() => {
    const seen = new Set<PostFormat>();
    for (const p of posts) seen.add(p.format);
    return (Object.keys(POST_FORMATS) as PostFormat[]).filter((f) => seen.has(f));
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = posts.filter(
      (p) =>
        (formatFilter === "all" || p.format === formatFilter) &&
        (!q || p.topic.toLowerCase().includes(q) || p.tone.toLowerCase().includes(q))
    );
    if (oldestFirst) result.reverse(); // server sends newest-first
    return result;
  }, [posts, query, formatFilter, oldestFirst]);

  const isFiltering = query.trim() !== "" || formatFilter !== "all";

  return (
    <>
      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="relative flex-1 min-w-0 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics…"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-brand-500/50 transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {presentFormats.length > 1 && (
          <div className="flex gap-1.5 flex-wrap">
            {(["all", ...presentFormats] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormatFilter(f)}
                className={clsx(
                  "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  formatFilter === f
                    ? "bg-brand-600 text-white"
                    : "bg-white/5 text-white/50 hover:bg-white/10"
                )}
              >
                {f === "all" ? "All" : POST_FORMATS[f].label}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => setOldestFirst((v) => !v)}
          title={oldestFirst ? "Showing oldest first" : "Showing newest first"}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/50 hover:bg-white/10 transition-colors"
        >
          {oldestFirst ? (
            <ArrowUpNarrowWide className="w-3.5 h-3.5" />
          ) : (
            <ArrowDownWideNarrow className="w-3.5 h-3.5" />
          )}
          {oldestFirst ? "Oldest" : "Newest"}
        </button>
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="font-medium text-white/70">No posts match</p>
          <p className="text-white/40 text-sm mt-1">
            {isFiltering ? "Try a different search or clear the filters." : "Nothing here yet."}
          </p>
          {isFiltering && (
            <button
              onClick={() => {
                setQuery("");
                setFormatFilter("all");
              }}
              className="mt-4 text-sm text-brand-400 hover:text-brand-300 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((post) => {
            const fmt = POST_FORMATS[post.format];
            return (
              <Link
                key={post.id}
                href={`/dashboard/history/${post.id}`}
                className="glass rounded-2xl overflow-hidden hover:bg-white/8 transition-colors group block"
              >
                <div className="aspect-square bg-white/5 relative overflow-hidden">
                  {post.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.thumb}
                      alt={post.topic}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Layers className="w-8 h-8 text-white/10" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <span className="bg-black/50 backdrop-blur-sm text-white/80 text-xs px-2 py-0.5 rounded-full">
                      {fmt.ratio}
                    </span>
                    <span className="bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
                      {post.numSlides} slide{post.numSlides !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-medium text-sm truncate">{post.topic}</p>
                  <div className="flex items-center gap-3 mt-2 text-white/40 text-xs">
                    <span className="flex items-center gap-1 capitalize">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                      {post.tone || "auto"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    {post.hasZip && (
                      <span className="flex items-center gap-1 text-green-400/80 ml-auto">
                        <FileArchive className="w-3 h-3" />
                        ZIP
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
