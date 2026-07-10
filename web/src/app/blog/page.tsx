import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import MarketingShell, { MarketingCta } from "@/components/landing/MarketingShell";
import { ARTICLES } from "@/lib/marketing/articles";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Blog — Instagram growth guides for creators",
  description:
    "Practical guides on Instagram carousels, hashtags, content planning, and AI workflows — from the team behind Prompt2Post.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Prompt2Post Blog — Instagram growth guides for creators",
    description:
      "Practical guides on Instagram carousels, hashtags, content planning, and AI workflows.",
    url: "/blog",
    type: "website",
  },
};

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function BlogIndexPage() {
  const posts = [...ARTICLES].sort((a, b) => b.datePublished.localeCompare(a.datePublished));

  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Blog", path: "/blog" },
            ])
          ),
        }}
      />

      <section className="max-w-4xl mx-auto px-6 text-center mb-14">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
          Instagram growth, <span className="gradient-text-animated">demystified</span>
        </h1>
        <p className="text-white/55 text-lg max-w-2xl mx-auto">
          Practical, no-fluff guides on carousels, hashtags, and content workflows — everything we
          learn building an AI content studio, written down.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 space-y-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="panel hover-lift rounded-2xl p-6 sm:p-7 flex flex-col gap-2 group block"
          >
            <div className="flex items-center gap-3 text-xs text-white/40">
              <time dateTime={post.datePublished}>{formatDate(post.datePublished)}</time>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" /> {post.readMinutes} min read
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold group-hover:text-brand-300 transition-colors">
              {post.title}
            </h2>
            <p className="text-white/55 text-sm leading-relaxed">{post.description}</p>
            <span className="inline-flex items-center gap-1.5 text-sm text-brand-400 font-medium mt-1">
              Read the guide <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </section>

      <MarketingCta />
    </MarketingShell>
  );
}
