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
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import InteractiveStudio from "@/components/landing/InteractiveStudio";
import StatsBand from "@/components/landing/StatsBand";
import Pricing from "@/components/landing/Pricing";
import SiteFooter from "@/components/landing/SiteFooter";
import { FAQ_ITEMS, faqJsonLd } from "@/lib/seo";

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

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Paint-once ambient backdrop — no animated blur filters. */}
      <div className="ambient" aria-hidden />
      <div className="grid-fade" aria-hidden />

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass border-t-0 border-l-0 border-r-0">
        <BrandLogo iconSize={42} textClassName="text-xl" />
        <div className="hidden md:flex items-center gap-7 text-sm text-white/55">
          <a href="#studio" className="hover:text-white transition-colors">Live demo</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-3 min-h-[36px]">
          <ClerkLoading>
            <div className="h-9 w-28 rounded-xl bg-white/5 animate-pulse" />
          </ClerkLoading>
          <ClerkLoaded>
            <SignedOut>
              <SignInButton>
                <button className="text-sm text-white/70 hover:text-white transition-colors">
                  Sign in
                </button>
              </SignInButton>
              <Link
                href="/sign-up"
                className="btn-shine text-sm bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl font-medium transition-colors"
              >
                Start free
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard/create"
                className="btn-shine text-sm bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-1.5"
              >
                Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </SignedIn>
          </ClerkLoaded>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 pt-32 pb-10 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 text-xs bg-white/[0.04] border border-white/10 px-3 py-1.5 rounded-full mb-6">
            <span className="flex -space-x-1.5">
              <span className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-sky-500 border border-[#0a0a0f]" />
              <span className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border border-[#0a0a0f]" />
              <span className="w-4 h-4 rounded-full bg-gradient-to-br from-rose-400 to-fuchsia-500 border border-[#0a0a0f]" />
            </span>
            <span className="text-white/60">Built for Instagram creators</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6 leading-[1.05]">
            One topic in.
            <br />
            <span className="gradient-text-animated">A whole carousel out.</span>
          </h1>

          <p className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto mb-9 leading-relaxed">
            Prompt2Post is the AI content studio for Instagram creators. Type an idea — it
            plans, writes, and designs a scroll-stopping carousel. Try it right here. 👇
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Link
              href="/sign-up"
              className="btn-shine inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-8 py-3.5 rounded-2xl text-base transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-brand-700/25"
            >
              Create your first post free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#studio"
              className="inline-flex items-center justify-center gap-2 bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white/80 font-medium px-8 py-3.5 rounded-2xl text-base transition-colors"
            >
              Watch it build a post
            </a>
          </div>
        </div>
      </section>

      {/* ── Interactive studio ──────────────────────────────────────────── */}
      <section id="studio" className="relative z-10 max-w-6xl mx-auto px-6 pb-14 scroll-mt-24">
        <InteractiveStudio />
      </section>

      {/* ── Topic marquee ───────────────────────────────────────────────── */}
      <section className="relative z-10 py-6 border-y border-white/[0.06]">
        <div className="marquee">
          {[0, 1].map((copy) => (
            <div key={copy} className="marquee-track" aria-hidden={copy === 1}>
              {MARQUEE_TOPICS.map((t) => (
                <Link
                  key={`${copy}-${t}`}
                  href="/sign-up"
                  className="text-sm bg-white/[0.04] hover:bg-white/10 border border-white/10 text-white/55 hover:text-white px-4 py-2 rounded-full whitespace-nowrap transition-colors"
                >
                  {t}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats band ──────────────────────────────────────────────────── */}
      <section className="relative z-10 py-14">
        <StatsBand />
      </section>

      {/* ── Bento features ──────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 max-w-5xl mx-auto px-6 py-16 scroll-mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3">
          Your whole content workflow, in one box
        </h2>
        <p className="text-white/50 text-center mb-12">
          From blank topic to ready-to-post carousel — without leaving the app.
        </p>

        <div className="grid sm:grid-cols-6 gap-4">
          {/* Large cell: AI engine */}
          <div className="sm:col-span-4 panel hover-lift rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-brand-600/15 blur-3xl" />
            <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 text-brand-400" />
            </div>
            <h3 className="font-semibold text-lg mb-1.5">Two-stage AI engine</h3>
            <p className="text-white/55 text-sm leading-relaxed max-w-md">
              First it plans the structure — tone, format, palette, slide count — then writes
              fact-rich copy for every slide. FLUX paints the backgrounds and pixel-perfect vector
              text is composited on top. In 13 languages.
            </p>
            <div className="flex gap-2 mt-4">
              {["Plan", "Write", "Paint", "Composite"].map((step, i) => (
                <span
                  key={step}
                  className="text-[11px] bg-white/[0.06] border border-white/10 text-white/60 px-2.5 py-1 rounded-full"
                >
                  {i + 1}. {step}
                </span>
              ))}
            </div>
          </div>

          {/* Publish & schedule */}
          <div className="sm:col-span-2 panel hover-lift rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-[#E4405F]/15 flex items-center justify-center mb-4">
              <Instagram className="w-5 h-5 text-[#E4405F]" />
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-semibold">Publish &amp; schedule</h3>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-white/10 text-white/55 border border-white/15 px-1.5 py-0.5 rounded-full">
                Coming soon
              </span>
            </div>
            <p className="text-white/55 text-sm leading-relaxed">
              Soon you&apos;ll post carousels straight to Instagram, or queue them on a content
              calendar and let them publish themselves.
            </p>
          </div>

          {/* Idea Studio */}
          <div className="sm:col-span-2 panel hover-lift rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/15 flex items-center justify-center mb-4">
              <Lightbulb className="w-5 h-5 text-yellow-300" />
            </div>
            <h3 className="font-semibold mb-1.5">Idea Studio</h3>
            <p className="text-white/55 text-sm leading-relaxed">
              Describe your niche, get six ready-to-generate post ideas — each one click from a
              finished carousel.
            </p>
          </div>

          {/* Slide Studio */}
          <div className="sm:col-span-2 panel hover-lift rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center mb-4">
              <Wand2 className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-semibold mb-1.5">Slide Studio</h3>
            <p className="text-white/55 text-sm leading-relaxed">
              Rewrite any slide with AI, edit copy yourself, or regenerate one image — without
              spending a post credit.
            </p>
          </div>

          {/* Repurpose */}
          <div className="sm:col-span-2 panel hover-lift rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center mb-4">
              <Repeat2 className="w-5 h-5 text-sky-400" />
            </div>
            <h3 className="font-semibold mb-1.5">Repurpose everywhere</h3>
            <p className="text-white/55 text-sm leading-relaxed">
              One click turns a carousel into an X post, a LinkedIn post, and a Story hook — plus a
              PDF for LinkedIn document posts.
            </p>
          </div>

          {/* Formats */}
          <div className="sm:col-span-2 panel hover-lift rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center mb-4">
              <Image className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-semibold mb-1.5">Any format, auto-chosen</h3>
            <p className="text-white/55 text-sm leading-relaxed">
              Square, portrait, story, or wide — the AI picks the best aspect ratio for your topic.
            </p>
          </div>

          {/* Brand kit + captions */}
          <div className="sm:col-span-2 panel hover-lift rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center mb-4">
              <Palette className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="font-semibold mb-1.5">Your brand, by default</h3>
            <p className="text-white/55 text-sm leading-relaxed">
              Save your tone, colors, fonts and language as a Brand Kit — every new post starts
              on-brand, with captions <Hash className="w-3 h-3 inline text-white/40" />hashtags included.
            </p>
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">How it works</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { n: "01", icon: <Lightbulb className="w-4 h-4 text-yellow-300" />, title: "Enter your topic", desc: "Type any subject — or let the Idea Studio brainstorm six post ideas for your niche." },
            { n: "02", icon: <Sparkles className="w-4 h-4 text-brand-400" />, title: "AI plans & writes", desc: "It determines the structure, then writes creative, researched copy slide-by-slide." },
            { n: "03", icon: <Image className="w-4 h-4 text-blue-400" />, title: "Images are generated", desc: "FLUX generates visuals, your headline is composited on top — refine any slide afterwards." },
            { n: "04", icon: <CalendarClock className="w-4 h-4 text-green-400" />, title: "Export or schedule", desc: "Export ZIP / PDF with captions today — direct Instagram publishing & scheduling are coming soon." },
          ].map((step) => (
            <div key={step.n} className="panel hover-lift rounded-2xl p-5 text-left relative overflow-hidden">
              <span className="absolute -top-3 -right-1 text-[64px] font-black text-white/[0.04] leading-none select-none">
                {step.n}
              </span>
              <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center mb-3">
                {step.icon}
              </div>
              <h3 className="font-semibold mb-1 text-sm">{step.title}</h3>
              <p className="text-white/55 text-xs leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Social proof ────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { quote: "I batch a week of carousels in one coffee. My saves doubled.", who: "Maya · fitness creator" },
            { quote: "It nails my brand colors and tone every single time. Wild.", who: "Leo · finance page" },
            { quote: "Export to ZIP and I'm posting daily now. Game changer.", who: "Priya · travel blog" },
          ].map((t) => (
            <div key={t.who} className="panel rounded-2xl p-5">
              <div className="flex gap-0.5 mb-2.5 text-amber-300">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-300" />
                ))}
              </div>
              <p className="text-sm text-white/80 leading-relaxed mb-3">“{t.quote}”</p>
              <div className="text-xs text-white/45">{t.who}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────── */}
      <section id="pricing" className="relative z-10 max-w-5xl mx-auto px-6 py-16 scroll-mt-20">
        <Pricing />
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section id="faq" className="relative z-10 max-w-3xl mx-auto px-6 py-16 scroll-mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3">
          Frequently asked questions
        </h2>
        <p className="text-white/50 text-center mb-12">
          Everything you need to know about creating posts with Prompt2Post.
        </p>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => (
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

      {/* FAQ structured data — eligible for Google's FAQ rich result. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }}
      />

      {/* ── Final CTA ───────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
        <div className="relative panel-strong rounded-3xl p-10 sm:p-14 text-center overflow-hidden">
          <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-brand-600/20 blur-3xl" />
          <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-purple-600/15 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-black mb-3">
              Your next 30 days of content,
              <br />
              <span className="gradient-text-animated">handled.</span>
            </h2>
            <p className="text-white/55 mb-8 max-w-md mx-auto">
              Ideas, copy, visuals, captions, export — the whole pipeline, from one text box.
            </p>
            <Link
              href="/sign-up"
              className="btn-shine inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-8 py-3.5 rounded-2xl text-base transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-brand-700/25"
            >
              Start creating free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <SiteFooter />
    </div>
  );
}
