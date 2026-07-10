import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Lightbulb, Palette, Wand2 } from "lucide-react";
import MarketingShell, { MarketingCta } from "@/components/landing/MarketingShell";
import { NICHES, getNiche } from "@/lib/marketing/niches";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return NICHES.map((n) => ({ niche: n.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ niche: string }>;
}): Promise<Metadata> {
  const { niche: slug } = await params;
  const niche = getNiche(slug);
  if (!niche) return {};
  return {
    title: niche.title,
    description: niche.description,
    alternates: { canonical: `/for/${niche.slug}` },
    openGraph: {
      title: niche.title,
      description: niche.description,
      url: `/for/${niche.slug}`,
      type: "website",
    },
  };
}

const PAIN_ICONS = [Lightbulb, Wand2, Palette];

export default async function NichePage({
  params,
}: {
  params: Promise<{ niche: string }>;
}) {
  const { niche: slug } = await params;
  const niche = getNiche(slug);
  if (!niche) notFound();

  const structuredData = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: `For ${niche.audience}`, path: `/for/${niche.slug}` },
    ]),
    faqJsonLd(niche.faq),
  ];

  const otherNiches = NICHES.filter((n) => n.slug !== niche.slug).slice(0, 5);

  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 text-xs bg-white/[0.04] border border-white/10 px-3 py-1.5 rounded-full mb-6 text-white/60 capitalize">
          Prompt2Post for {niche.audience}
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-6 leading-[1.08]">
          {niche.h1}
        </h1>
        {niche.intro.map((p) => (
          <p key={p.slice(0, 32)} className="text-white/60 text-lg max-w-2xl mx-auto mb-4 leading-relaxed">
            {p}
          </p>
        ))}
        <div className="mt-8">
          <Link
            href="/sign-up"
            className="btn-shine inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-8 py-3.5 rounded-2xl text-base transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-brand-700/25"
          >
            Create your first post free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-white/35 text-xs mt-3">3 free posts every month · no card required</p>
        </div>
      </section>

      {/* Pain points */}
      <section className="max-w-5xl mx-auto px-6 mt-20">
        <div className="grid sm:grid-cols-3 gap-4">
          {niche.painPoints.map((point, i) => {
            const Icon = PAIN_ICONS[i % PAIN_ICONS.length];
            return (
              <div key={point.title} className="panel hover-lift rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-brand-400" />
                </div>
                <h2 className="font-semibold mb-1.5">{point.title}</h2>
                <p className="text-white/55 text-sm leading-relaxed">{point.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Example topics */}
      <section className="max-w-4xl mx-auto px-6 mt-20 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 capitalize">
          Carousel topics {niche.audience} generate with Prompt2Post
        </h2>
        <p className="text-white/50 mb-8">
          Type any of these — or your own idea — and get a finished carousel in minutes.
        </p>
        <div className="flex flex-wrap justify-center gap-2.5">
          {niche.topics.map((t) => (
            <Link
              key={t}
              href="/sign-up"
              className="text-sm bg-white/[0.04] hover:bg-white/10 border border-white/10 text-white/60 hover:text-white px-4 py-2 rounded-full transition-colors"
            >
              {t}
            </Link>
          ))}
        </div>
      </section>

      {/* What's included */}
      <section className="max-w-4xl mx-auto px-6 mt-20">
        <div className="panel-strong rounded-3xl p-8 sm:p-10">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Everything in the box, every post
          </h2>
          <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3 max-w-2xl mx-auto">
            {[
              "Slide structure planned by AI",
              "Copy written for every slide",
              "AI-generated visuals with crisp text",
              "Caption + hashtags in your tone",
              "Brand Kit: your colors, fonts, voice",
              "Rewrite or re-image any single slide",
              "Export as ZIP or PDF",
              "Repurpose to X, LinkedIn & Stories",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-white/75">
                <Check className="w-4 h-4 text-green-400 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 mt-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 capitalize">
          Questions from {niche.audience}
        </h2>
        <div className="space-y-3">
          {niche.faq.map((item) => (
            <details
              key={item.question}
              className="panel rounded-2xl px-5 py-4 group [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-white/90">
                {item.question}
                <ArrowRight className="w-4 h-4 text-white/40 transition-transform group-open:rotate-90" />
              </summary>
              <p className="text-white/55 text-sm leading-relaxed mt-3">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <MarketingCta
        title={`Your next post is one topic away`}
        subtitle={`Join the ${niche.audience} batching a week of carousels in one sitting. 3 free posts every month.`}
      />

      {/* Cross-links to sibling niches */}
      <section className="max-w-4xl mx-auto px-6 mt-16 text-center">
        <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">
          Also made for
        </h2>
        <div className="flex flex-wrap justify-center gap-2.5">
          {otherNiches.map((n) => (
            <Link
              key={n.slug}
              href={`/for/${n.slug}`}
              className="text-sm bg-white/[0.04] hover:bg-white/10 border border-white/10 text-white/55 hover:text-white px-4 py-2 rounded-full transition-colors capitalize"
            >
              {n.audience}
            </Link>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
