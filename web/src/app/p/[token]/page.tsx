import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles, Layers, Hash } from "lucide-react";
import { getPostByShareToken } from "@/lib/db";
import { POST_FORMATS, resolveFormat } from "@/types";

/**
 * Public, read-only view of a shared post. Anyone with the link can see the
 * slides + caption — no account needed. The owner can disable the link at any
 * time from the post page, which 404s this route.
 */

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const post = await getPostByShareToken(token).catch(() => null);
  if (!post) return { title: "Post not found – Prompt2Post" };

  const firstImage = post.slides[0]?.image_url;
  return {
    title: `${post.topic} – Prompt2Post`,
    description: post.content?.social_caption?.slice(0, 160) ?? "An AI-generated social media post.",
    openGraph: {
      title: post.topic,
      description: post.content?.social_caption?.slice(0, 160) ?? "",
      ...(firstImage ? { images: [{ url: firstImage }] } : {}),
    },
  };
}

export default async function SharedPostPage({ params }: PageProps) {
  const { token } = await params;
  const post = await getPostByShareToken(token).catch(() => null);
  if (!post) notFound();

  const format = resolveFormat(post.structure?.format);
  const spec = POST_FORMATS[format];
  const aspect = `${spec.width} / ${spec.height}`;
  const caption = post.content?.social_caption ?? "";
  const hashtags = post.content?.hashtags ?? [];
  const slides = post.slides.filter((s) => s.image_url);

  return (
    <div className="min-h-screen aurora">
      <div className="max-w-3xl mx-auto px-5 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Sparkles className="w-5 h-5 text-brand-400" />
            <span className="gradient-text">Prompt2Post</span>
          </Link>
          <Link
            href="/sign-up"
            className="text-xs bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl font-medium transition-colors"
          >
            Make your own →
          </Link>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold mb-2">{post.topic}</h1>
        <div className="flex flex-wrap items-center gap-3 text-white/40 text-xs mb-6">
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            {slides.length} slide{slides.length !== 1 ? "s" : ""}
          </span>
          <span className="bg-white/8 border border-white/10 px-2 py-0.5 rounded-full">
            {spec.label} · {spec.ratio}
          </span>
        </div>

        {/* Slides */}
        <div
          className={
            slides.length === 1
              ? "grid grid-cols-1 gap-4 mb-8 max-w-md mx-auto"
              : "grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
          }
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden border border-white/10 bg-white/5"
              style={{ aspectRatio: aspect }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image_url}
                alt={slide.headline || `Slide ${i + 1}`}
                className="w-full h-full object-cover"
                loading={i > 1 ? "lazy" : undefined}
              />
            </div>
          ))}
        </div>

        {/* Caption */}
        {caption && (
          <div className="glass rounded-2xl p-5 mb-4">
            <p className="text-xs font-semibold text-white/50 mb-2">Caption</p>
            <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{caption}</p>
          </div>
        )}

        {/* Hashtags */}
        {hashtags.length > 0 && (
          <div className="glass rounded-2xl p-5 mb-8">
            <div className="flex items-center gap-1.5 mb-2">
              <Hash className="w-3.5 h-3.5 text-blue-400" />
              <p className="text-xs font-semibold text-white/50">Hashtags</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {hashtags.map((tag) => (
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

        {/* Footer CTA */}
        <div className="glass rounded-2xl p-6 text-center">
          <p className="font-semibold text-white/90 mb-1">
            Made with <span className="gradient-text">Prompt2Post</span>
          </p>
          <p className="text-white/40 text-sm mb-4">
            Type a topic — get a ready-to-post carousel with AI copy and images.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Create yours free
          </Link>
        </div>
      </div>
    </div>
  );
}
