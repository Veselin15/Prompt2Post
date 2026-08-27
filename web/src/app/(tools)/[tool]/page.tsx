import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import MarketingShell, { MarketingCta } from "@/components/landing/MarketingShell";
import Reveal from "@/components/landing/Reveal";
import { TOOLS, getTool } from "@/lib/marketing/tools";
import { NICHES } from "@/lib/marketing/niches";
import { ARTICLES } from "@/lib/marketing/articles";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  howToJsonLd,
  webApplicationJsonLd,
} from "@/lib/seo";

/**
 * Keyword landing pages, served from the site root (/ai-instagram-carousel-generator
 * and friends). `dynamicParams = false` means anything not in TOOLS 404s at the
 * routing layer instead of this catch-all swallowing unknown URLs.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return TOOLS.map((t) => ({ tool: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string }>;
}): Promise<Metadata> {
  const { tool: slug } = await params;
  const tool = getTool(slug);
  if (!tool) return {};
  return {
    title: tool.title,
    description: tool.description,
    keywords: [tool.h1, ...tool.alsoKnownAs],
    alternates: { canonical: `/${tool.slug}` },
    openGraph: {
      title: tool.title,
      description: tool.description,
      url: `/${tool.slug}`,
      type: "website",
    },
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ tool: string }>;
}) {
  const { tool: slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  const path = `/${tool.slug}`;
  const structuredData = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: tool.h1, path },
    ]),
    webApplicationJsonLd({ name: tool.h1, description: tool.description, path }),
    howToJsonLd({
      name: `How to use the ${tool.h1.toLowerCase()}`,
      description: tool.description,
      path,
      steps: tool.steps,
    }),
    faqJsonLd(tool.faq),
  ];

  const otherTools = TOOLS.filter((t) => t.slug !== tool.slug);
  const niches = NICHES.slice(0, 6);
  const guides = ARTICLES.slice(0, 4);

  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 text-center">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-white/40">
          <Link href="/" className="transition-colors hover:text-white/70">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-white/60">{tool.h1}</span>
        </nav>

        <h1 className="text-display font-display">{tool.h1}</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
          {tool.tagline}
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/try" className="btn-primary px-7 py-3.5 text-base">
            Generate one free — no sign-up
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/sign-up" className="btn-secondary px-7 py-3.5 text-base">
            Create a free account
          </Link>
        </div>

        {/* The phrases people search for this with — useful to the reader and
            an honest way to cover query variants without keyword stuffing. */}
        <div className="mt-10">
          <p className="eyebrow mb-3">Also called</p>
          <ul className="flex flex-wrap justify-center gap-2">
            {tool.alsoKnownAs.map((k) => (
              <li
                key={k}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/55"
              >
                {k}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Intro prose ───────────────────────────────────────────────── */}
      <section className="mx-auto mt-20 max-w-3xl px-6">
        <Reveal className="space-y-5">
          {tool.intro.map((p, i) => (
            <p
              key={i}
              className={
                i === 0
                  ? "font-editorial text-2xl leading-snug text-white/85"
                  : "leading-relaxed text-white/60"
              }
            >
              {p}
            </p>
          ))}
        </Reveal>
      </section>

      {/* ── Steps ─────────────────────────────────────────────────────── */}
      <section className="mx-auto mt-24 max-w-5xl px-6">
        <div className="mb-10 text-center">
          <p className="eyebrow mb-3">How it works</p>
          <h2 className="text-section">From one line to a finished carousel</h2>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tool.steps.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 70}>
              <div
                id={`step-${i + 1}`}
                className="panel hover-lift relative h-full overflow-hidden p-5"
              >
                <span className="absolute -right-1 -top-3 select-none text-[64px] font-black leading-none text-white/[0.04]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="relative mb-2 text-sm font-semibold">{s.title}</h3>
                <p className="relative text-xs leading-relaxed text-white/55">
                  {s.text}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ── Differentiators ───────────────────────────────────────────── */}
      <section className="mx-auto mt-24 max-w-5xl px-6">
        <div className="mb-10 text-center">
          <p className="eyebrow mb-3">Why this one</p>
          <h2 className="text-section">What makes the output actually usable</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {tool.points.map((p, i) => (
            <Reveal key={p.title} delay={i * 70}>
              <div className="panel hover-lift h-full p-6">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600/20">
                  <Sparkles className="h-4 w-4 text-brand-300" />
                </div>
                <h3 className="mb-1.5 font-semibold">{p.title}</h3>
                <p className="text-sm leading-relaxed text-white/55">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Audience ──────────────────────────────────────────────────── */}
      <section className="mx-auto mt-24 max-w-3xl px-6">
        <div className="panel-strong p-8 sm:p-10">
          <h2 className="mb-6 text-2xl">Who it&apos;s for</h2>
          <ul className="space-y-3">
            {tool.audience.map((a) => (
              <li key={a} className="flex items-start gap-3 text-white/70">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                <span className="text-sm leading-relaxed">{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="mx-auto mt-24 max-w-3xl px-6">
        <div className="mb-10 text-center">
          <p className="eyebrow mb-3">FAQ</p>
          <h2 className="text-section">Questions people ask first</h2>
        </div>
        <div className="space-y-3">
          {tool.faq.map((item) => (
            <details
              key={item.question}
              className="panel group px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-white/90">
                {item.question}
                <ArrowRight className="h-4 w-4 shrink-0 text-white/40 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-white/55">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <MarketingCta
        title={`Try the ${tool.h1.toLowerCase()} free`}
        subtitle="Type one topic and see a finished carousel in about a minute. No account needed for the first one."
      />

      {/* ── Internal links ────────────────────────────────────────────── */}
      <section className="mx-auto mt-20 max-w-5xl px-6">
        <div className="rule-fade mb-10" />
        <div className="grid gap-8 sm:grid-cols-3 text-sm">
          <div>
            <h2 className="eyebrow mb-4">Related tools</h2>
            <ul className="space-y-2.5">
              {otherTools.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/${t.slug}`}
                    className="text-white/55 transition-colors hover:text-white"
                  >
                    {t.h1}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="eyebrow mb-4">Made for</h2>
            <ul className="space-y-2.5">
              {niches.map((n) => (
                <li key={n.slug}>
                  <Link
                    href={`/for/${n.slug}`}
                    className="text-white/55 transition-colors hover:text-white"
                  >
                    {n.audience}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="eyebrow mb-4">Guides</h2>
            <ul className="space-y-2.5">
              {guides.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/blog/${a.slug}`}
                    className="text-white/55 transition-colors hover:text-white"
                  >
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
