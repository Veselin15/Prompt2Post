import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Hash,
  Image as ImageIcon,
  Languages,
  Layers,
  Lightbulb,
  Palette,
  Repeat2,
  Share2,
  Sparkles,
  Type,
  Wand2,
} from "lucide-react";
import MarketingShell, { MarketingCta } from "@/components/landing/MarketingShell";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Features — AI Instagram carousel generator, explained",
  description:
    "Everything inside Prompt2Post: the two-stage AI engine, Idea Studio, Slide Studio, Brand Kits, 13 languages, repurposing, and export — the full feature tour.",
  alternates: { canonical: "/features" },
  openGraph: {
    title: "Prompt2Post Features — the AI Instagram content studio, explained",
    description:
      "The two-stage AI engine, Idea Studio, Slide Studio, Brand Kits, 13 languages, repurposing, and export — the full tour.",
    url: "/features",
    type: "website",
  },
};

const FEATURES: {
  icon: React.ReactNode;
  title: string;
  text: string;
}[] = [
  {
    icon: <Sparkles className="w-5 h-5 text-brand-400" />,
    title: "Two-stage AI engine",
    text: "Most AI tools write in one pass and it shows. Prompt2Post first develops a creative brief — tone, format, palette, slide count, narrative arc — then writes fact-rich copy for every slide against that plan. The result reads like it was art-directed, because it was.",
  },
  {
    icon: <ImageIcon className="w-5 h-5 text-blue-400" />,
    title: "Photoreal AI imagery",
    text: "FLUX generates rich, photography-grade backgrounds matched to each slide's message — not clip-art gradients. Every image is composed for the text that will sit on it.",
  },
  {
    icon: <Type className="w-5 h-5 text-white/80" />,
    title: "Pixel-perfect vector text",
    text: "Headlines aren't rasterized by an image model (that's how you get melted letters). Prompt2Post composites real vector typography over the artwork, so text is crisp at any export size.",
  },
  {
    icon: <Lightbulb className="w-5 h-5 text-yellow-300" />,
    title: "Idea Studio",
    text: "Describe your niche in one line and get six ready-to-generate post ideas, each engineered around what your audience searches, saves, and shares. The blank page is officially retired.",
  },
  {
    icon: <Wand2 className="w-5 h-5 text-purple-400" />,
    title: "Slide Studio",
    text: "Rewrite any slide with AI, edit the copy by hand, or regenerate a single image — without touching the rest of the post and without spending another credit.",
  },
  {
    icon: <Palette className="w-5 h-5 text-green-400" />,
    title: "Brand Kit",
    text: "Save your tone of voice, colors, fonts, and language once. Every new post — including captions and hashtags — is generated on-brand automatically. Agencies can keep a kit per client.",
  },
  {
    icon: <Hash className="w-5 h-5 text-sky-400" />,
    title: "Captions & hashtags included",
    text: "Every post ships with a ready-to-paste caption written in your voice and 3–8 niche hashtags chosen for reach, following current Instagram best practice.",
  },
  {
    icon: <Layers className="w-5 h-5 text-orange-300" />,
    title: "Any format, auto-chosen",
    text: "Square, portrait, story, or wide — the AI picks the aspect ratio that fits your topic, or you pick it yourself. Slide counts from 1 to 10, with a dedicated cover slide.",
  },
  {
    icon: <Languages className="w-5 h-5 text-emerald-400" />,
    title: "13 languages",
    text: "Write posts in English, Spanish, German, French, Portuguese, and more — same workflow, native-quality copy, for audiences anywhere.",
  },
  {
    icon: <Repeat2 className="w-5 h-5 text-sky-400" />,
    title: "Repurpose everywhere",
    text: "One click turns a finished carousel into an X post, a LinkedIn post, and a Story hook — plus a PDF sized for LinkedIn document posts.",
  },
  {
    icon: <Share2 className="w-5 h-5 text-pink-400" />,
    title: "Share & review links",
    text: "Every post gets a shareable preview link — send it to a client or teammate for review before anything goes live, no account needed on their side.",
  },
  {
    icon: <CalendarClock className="w-5 h-5 text-green-400" />,
    title: "Publishing & scheduling (coming soon)",
    text: "Direct Instagram publishing and a content calendar that posts for you are on the way — batch a month, queue it, done.",
  },
];

export default function FeaturesPage() {
  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Features", path: "/features" },
            ])
          ),
        }}
      />

      <section className="max-w-4xl mx-auto px-6 text-center mb-16">
        <h1 className="text-display font-display mb-6">
          Every step from idea to post,
          <br />
          <span className="gradient-text-animated">handled by AI</span>
        </h1>
        <p className="text-white/55 text-lg max-w-2xl mx-auto mb-8">
          Prompt2Post is a complete AI Instagram carousel generator: it plans the structure, writes
          the copy, paints the visuals, composites the text, and hands you captions and hashtags.
          Here&apos;s everything in the box.
        </p>
        <Link
          href="/sign-up"
          className="btn-shine inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-8 py-3.5 rounded-2xl text-base transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-brand-700/25"
        >
          Try every feature free
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <section className="max-w-5xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="panel hover-lift rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h2 className="font-semibold mb-1.5">{f.title}</h2>
              <p className="text-white/55 text-sm leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-20 text-center">
        <h2 className="text-2xl sm:text-3xl mb-4">Built for your niche</h2>
        <p className="text-white/50 mb-8">
          See how creators in your field use Prompt2Post day to day.
        </p>
        <div className="flex flex-wrap justify-center gap-2.5">
          {[
            { href: "/for/fitness-coaches", label: "Fitness coaches" },
            { href: "/for/real-estate-agents", label: "Real estate agents" },
            { href: "/for/travel-creators", label: "Travel creators" },
            { href: "/for/food-bloggers", label: "Food bloggers" },
            { href: "/for/finance-creators", label: "Finance creators" },
            { href: "/for/coaches-consultants", label: "Coaches & consultants" },
            { href: "/for/ecommerce-brands", label: "E-commerce brands" },
            { href: "/for/photographers", label: "Photographers" },
            { href: "/for/marketing-agencies", label: "Marketing agencies" },
            { href: "/for/beauty-creators", label: "Beauty & skincare" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm bg-white/[0.04] hover:bg-white/10 border border-white/10 text-white/55 hover:text-white px-4 py-2 rounded-full transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </section>

      <MarketingCta
        title="See it build a post in 60 seconds"
        subtitle="The free plan includes 3 posts a month with the full engine — no card required."
      />
    </MarketingShell>
  );
}
