import Link from "next/link";
import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import {
  Sparkles,
  Image,
  ArrowRight,
  Instagram,
  Lightbulb,
  Wand2,
  CalendarClock,
  Repeat2,
  Palette,
  Hash,
  Star,
  Type,
  Languages,
  Check,
} from "lucide-react";
import SiteNav from "@/components/landing/SiteNav";
import InteractiveStudio from "@/components/landing/InteractiveStudio";
import StatsBand from "@/components/landing/StatsBand";
import Pricing from "@/components/landing/Pricing";
import SiteFooter from "@/components/landing/SiteFooter";
import Reveal from "@/components/landing/Reveal";
import { FAQ_ITEMS, faqJsonLd } from "@/lib/seo";
import { TOOLS } from "@/lib/marketing/tools";

const NAV_LINKS = [
  { href: "#studio", label: "Live demo" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "#faq", label: "FAQ" },
];

const MARQUEE_TOPICS = [
  "5 mistakes killing your gym progress",
  "Hidden gems in Lisbon",
  "How to save your first $10k",
  "3-ingredient protein breakfast",
  "Morning routines that actually work",
  "Psychology of color in branding",
  "7 habits that compound",
  "Skincare myths, busted",
  "The economics of streaming",
  "Productivity tips for creators",
];

const HERO_PROOF = [
  "No card required",
  "3 free posts every month",
  "13 languages",
];

const STEPS = [
  {
    n: "01",
    icon: <Lightbulb className="h-4 w-4 text-yellow-300" />,
    title: "Enter your topic",
    desc: "Type any subject — or let Idea Studio brainstorm six post ideas for your niche.",
  },
  {
    n: "02",
    icon: <Sparkles className="h-4 w-4 text-brand-300" />,
    title: "AI plans, then writes",
    desc: "It develops a creative brief — angle, tone, format, palette — then writes every slide against it.",
  },
  {
    n: "03",
    icon: <Image className="h-4 w-4 text-blue-400" />,
    title: "Artwork is generated",
    desc: "FLUX paints a background per slide and your headline is composited on top as vector type.",
  },
  {
    n: "04",
    icon: <CalendarClock className="h-4 w-4 text-green-400" />,
    title: "Export or schedule",
    desc: "ZIP or PDF with captions today — direct Instagram publishing and scheduling are coming.",
  },
];

const TESTIMONIALS = [
  { quote: "I batch a week of carousels in one coffee. My saves doubled.", who: "Maya", role: "fitness creator" },
  { quote: "It nails my brand colors and tone every single time. Wild.", who: "Leo", role: "finance page" },
  { quote: "Export to ZIP and I'm posting daily now. Game changer.", who: "Priya", role: "travel blog" },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden text-white">
      {/* Paint-once ambient backdrop — no animated blur filters. */}
      <div className="ambient" aria-hidden />
      <div className="grid-fade" aria-hidden />
      <div className="grain" aria-hidden />

      <SiteNav
        links={NAV_LINKS}
        auth={
          <>
            <ClerkLoading>
              <div className="h-9 w-28 animate-pulse rounded-full bg-white/5" />
            </ClerkLoading>
            <ClerkLoaded>
              <SignedOut>
                <SignInButton>
                  <button className="rounded-lg px-3 py-1.5 text-sm text-white/65 transition-colors hover:text-white">
                    Sign in
                  </button>
                </SignInButton>
                <Link href="/sign-up" className="btn-primary px-4 py-2 text-sm">
                  Start free
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard/create"
                  className="btn-primary px-4 py-2 text-sm"
                >
                  Dashboard <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </SignedIn>
            </ClerkLoaded>
          </>
        }
      />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 pb-12 pt-36 text-center sm:pt-40">
        <div className="animate-fade-in mx-auto max-w-4xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs">
            <span className="flex -space-x-1.5">
              <span className="h-4 w-4 rounded-full border border-[#08080d] bg-gradient-to-br from-emerald-400 to-sky-500" />
              <span className="h-4 w-4 rounded-full border border-[#08080d] bg-gradient-to-br from-amber-400 to-orange-500" />
              <span className="h-4 w-4 rounded-full border border-[#08080d] bg-gradient-to-br from-rose-400 to-fuchsia-500" />
            </span>
            <span className="text-white/60">Built for Instagram creators</span>
          </div>

          {/*
            The H1 leads with the phrase people actually search ("AI Instagram
            carousel generator") and then delivers the brand line, so the page
            reads as designed copy while still matching the query verbatim.
          */}
          <h1 className="font-display">
            <span className="mb-4 block text-sm font-semibold uppercase tracking-[0.2em] text-brand-300/90">
              The AI Instagram carousel generator
            </span>
            <span className="text-display block">
              One topic in.
              <br />
              <span className="gradient-text-animated">A whole carousel out.</span>
            </span>
          </h1>

          <p className="mx-auto mb-9 mt-7 max-w-2xl text-lg leading-relaxed text-white/60 sm:text-xl">
            Type an idea and Prompt2Post plans, writes, and designs a scroll-stopping
            carousel — slides, artwork, caption and hashtags. Try it right here. 👇
          </p>

          <div className="mb-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/try" className="btn-primary px-8 py-4 text-base">
              Generate one free — no sign-up
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/sign-up" className="btn-secondary px-8 py-4 text-base">
              Create a free account
            </Link>
          </div>

          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/45">
            {HERO_PROOF.map((p) => (
              <li key={p} className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-green-400/80" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Interactive studio ──────────────────────────────────────────── */}
      <section id="studio" className="relative z-10 mx-auto max-w-6xl scroll-mt-28 px-6 pb-16">
        <InteractiveStudio />
      </section>

      {/* ── Topic marquee ───────────────────────────────────────────────── */}
      <section className="relative z-10 border-y border-white/[0.06] py-6">
        <div className="marquee">
          {[0, 1].map((copy) => (
            <div key={copy} className="marquee-track" aria-hidden={copy === 1}>
              {MARQUEE_TOPICS.map((t) => (
                <Link
                  key={`${copy}-${t}`}
                  href="/sign-up"
                  className="whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/55 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {t}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats band ──────────────────────────────────────────────────── */}
      <section className="relative z-10 py-16">
        <StatsBand />
      </section>

      {/* ── Bento features ──────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 mx-auto max-w-5xl scroll-mt-24 px-6 py-16">
        <div className="mb-12 text-center">
          <p className="eyebrow mb-3">The studio</p>
          <h2 className="text-section mb-4">
            Your whole content workflow, in one box
          </h2>
          <p className="mx-auto max-w-xl text-white/50">
            From blank topic to ready-to-post carousel — without leaving the app.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-6">
          {/* Large cell: AI engine */}
          <Reveal className="sm:col-span-4">
            <div className="panel hover-lift relative h-full overflow-hidden p-7">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-600/20 blur-3xl" />
              <div className="relative">
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600/20">
                  <Sparkles className="h-5 w-5 text-brand-300" />
                </div>
                <h3 className="mb-2 text-xl">Two-stage AI engine</h3>
                <p className="max-w-md text-sm leading-relaxed text-white/55">
                  First it plans the structure — tone, format, palette, slide count —
                  then writes fact-rich copy for every slide. FLUX paints the
                  backgrounds and pixel-perfect vector text is composited on top.
                  In 13 languages.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {["Plan", "Write", "Paint", "Composite"].map((step, i) => (
                    <span
                      key={step}
                      className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] text-white/60"
                    >
                      {i + 1}. {step}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Publish & schedule */}
          <Reveal className="sm:col-span-2" delay={60}>
            <div className="panel hover-lift h-full p-6">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#E4405F]/15">
                <Instagram className="h-5 w-5 text-[#E4405F]" />
              </div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">Publish &amp; schedule</h3>
                <span className="rounded-full border border-white/15 bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/55">
                  Coming soon
                </span>
              </div>
              <p className="text-sm leading-relaxed text-white/55">
                Soon you&apos;ll post carousels straight to Instagram, or queue them on a
                content calendar and let them publish themselves.
              </p>
            </div>
          </Reveal>

          {[
            {
              icon: <Lightbulb className="h-5 w-5 text-yellow-300" />,
              tint: "bg-yellow-400/15",
              title: "Idea Studio",
              text: "Describe your niche, get six ready-to-generate post ideas — each one click from a finished carousel.",
            },
            {
              icon: <Wand2 className="h-5 w-5 text-purple-400" />,
              tint: "bg-purple-600/20",
              title: "Slide Studio",
              text: "Rewrite any slide with AI, edit copy yourself, or regenerate one image — without spending a post credit.",
            },
            {
              icon: <Repeat2 className="h-5 w-5 text-sky-400" />,
              tint: "bg-sky-500/15",
              title: "Repurpose everywhere",
              text: "One click turns a carousel into an X post, a LinkedIn post, and a Story hook — plus a PDF for document posts.",
            },
            {
              icon: <Type className="h-5 w-5 text-white/80" />,
              tint: "bg-white/[0.08]",
              title: "Text that stays sharp",
              text: "Headlines are real vector type composited over the artwork — never melted letters from an image model.",
            },
            {
              icon: <Image className="h-5 w-5 text-blue-400" />,
              tint: "bg-blue-500/15",
              title: "Any format, auto-chosen",
              text: "Square, portrait, story, or wide — the AI picks the best aspect ratio for your topic.",
            },
            {
              icon: <Palette className="h-5 w-5 text-green-400" />,
              tint: "bg-green-500/15",
              title: "Your brand, by default",
              text: "Save tone, colors, fonts and language as a Brand Kit — every post starts on-brand, captions and hashtags included.",
            },
          ].map((f, i) => (
            <Reveal key={f.title} className="sm:col-span-2" delay={(i % 3) * 60}>
              <div className="panel hover-lift h-full p-6">
                <div
                  className={`mb-5 flex h-10 w-10 items-center justify-center rounded-xl ${f.tint}`}
                >
                  {f.icon}
                </div>
                <h3 className="mb-2 font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-white/55">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/features"
            className="inline-flex items-center gap-1.5 text-sm text-brand-300 transition-colors hover:text-brand-200"
          >
            See every feature <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-16">
        <div className="mb-12 text-center">
          <p className="eyebrow mb-3">How it works</p>
          <h2 className="text-section">Four steps, about a minute</h2>
        </div>
        <ol className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Connector rule behind the cards on wide screens. */}
          <div
            className="rule-fade absolute left-0 right-0 top-9 hidden lg:block"
            aria-hidden
          />
          {STEPS.map((step, i) => (
            <Reveal as="li" key={step.n} delay={i * 70}>
              <div className="panel hover-lift relative h-full overflow-hidden p-5 text-left">
                <span className="absolute -right-1 -top-3 select-none text-[64px] font-black leading-none text-white/[0.045]">
                  {step.n}
                </span>
                <div className="relative mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06]">
                  {step.icon}
                </div>
                <h3 className="relative mb-1.5 text-sm font-semibold">{step.title}</h3>
                <p className="relative text-xs leading-relaxed text-white/55">
                  {step.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ── Social proof ────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.who} delay={i * 70}>
              <figure className="panel h-full p-6">
                <div className="mb-3 flex gap-0.5 text-amber-300">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-3.5 w-3.5 fill-amber-300" />
                  ))}
                </div>
                <blockquote className="font-editorial text-lg leading-snug text-white/85">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-2.5">
                  <span className="ig-ring flex h-7 w-7 items-center justify-center rounded-full">
                    <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#0c0c14] text-[10px] font-bold">
                      {t.who[0]}
                    </span>
                  </span>
                  <span className="text-xs text-white/50">
                    <span className="text-white/70">{t.who}</span> · {t.role}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────── */}
      <section id="pricing" className="relative z-10 mx-auto max-w-5xl scroll-mt-24 px-6 py-16">
        <Pricing />
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section id="faq" className="relative z-10 mx-auto max-w-3xl scroll-mt-24 px-6 py-16">
        <div className="mb-12 text-center">
          <p className="eyebrow mb-3">FAQ</p>
          <h2 className="text-section mb-4">Frequently asked questions</h2>
          <p className="text-white/50">
            Everything you need to know about creating posts with Prompt2Post.
          </p>
        </div>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.question}
              className="panel group px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-white/90">
                {item.question}
                <ArrowRight className="h-4 w-4 shrink-0 text-white/40 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-white/55">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FAQ structured data — eligible for Google's FAQ rich result. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }}
      />

      {/* ── Final CTA ───────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-20">
        <div className="panel-strong relative overflow-hidden rounded-3xl p-10 text-center sm:p-14">
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-brand-600/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#F07030]/15 blur-3xl" />
          <div className="relative">
            <h2 className="text-section mb-4">
              Your next 30 days of content,
              <br />
              <span className="gradient-text-animated">handled.</span>
            </h2>
            <p className="mx-auto mb-8 max-w-md text-white/55">
              Ideas, copy, visuals, captions, export — the whole pipeline, from one
              text box.
            </p>
            <Link href="/sign-up" className="btn-primary px-8 py-4 text-base">
              Start creating free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Tool directory ──────────────────────────────────────────────
          Surfaces the keyword landing pages to both readers and crawlers, so
          the deeper pages get internal links from the strongest page on the
          site rather than only from the footer. */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-20">
        <div className="rule-fade mb-10" />
        <h2 className="eyebrow mb-5">Explore Prompt2Post</h2>
        <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t) => (
            <li key={t.slug}>
              <Link
                href={`/${t.slug}`}
                className="panel group flex h-full items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.07]"
              >
                <span className="text-sm text-white/70 transition-colors group-hover:text-white">
                  {t.h1}
                </span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-white/30 transition-colors group-hover:text-brand-300" />
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 flex items-center gap-2 text-xs text-white/35">
          <Languages className="h-3.5 w-3.5" />
          Every tool writes in 13 languages.
          <Hash className="ml-2 h-3.5 w-3.5" />
          Captions and hashtags included.
        </p>
      </section>

      <SiteFooter />
    </div>
  );
}
