import Link from "next/link";
import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import {
  Sparkles,
  Image,
  ArrowRight,
  Check,
  Instagram,
  Lightbulb,
  Wand2,
  CalendarClock,
  Repeat2,
  Palette,
  Hash,
} from "lucide-react";

const MARQUEE_TOPICS = [
  "The history of the internet",
  "5 myths about productivity",
  "Why the ocean is blue",
  "Morning routines of CEOs",
  "SpaceX Starship explained",
  "Psychology of color in branding",
  "How sleep actually works",
  "7 habits that compound",
  "The economics of streaming",
  "Coffee: bean to cup",
];

const STATS = [
  { value: "<60s", label: "topic → finished carousel" },
  { value: "13", label: "copy languages" },
  { value: "4", label: "formats, auto-chosen" },
  { value: "24/7", label: "scheduled auto-publishing" },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    features: [
      "10 posts / month",
      "Up to 3 slides",
      "Idea Studio & AI rewrites",
      "Square & Portrait formats",
      "HD image generation",
      "Social captions & hashtags",
    ],
    cta: "Get started free",
    href: "/sign-up",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    features: [
      "100 posts / month",
      "Up to 10 slides",
      "Post directly to Instagram",
      "All 4 formats (Story, Wide…)",
      "All 4 text layouts & both fonts",
      "Custom accent & @handle watermark",
      "ZIP & PDF download",
    ],
    cta: "Start Pro",
    href: "/sign-up",
    highlight: true,
    badge: "Most popular",
  },
  {
    name: "Creator",
    price: "$29",
    period: "/month",
    features: [
      "Unlimited posts",
      "Schedule Instagram posts",
      "Auto-publish at the perfect time",
      "Content calendar",
      "Priority parallel generation",
      "All Pro features",
    ],
    cta: "Go Creator",
    href: "/sign-up",
    highlight: false,
  },
];

/* Fake generated-slide cards floating in the hero — pure CSS, no images. */
function HeroMockups() {
  return (
    <div className="relative h-[340px] sm:h-[400px] mt-14 max-w-3xl mx-auto select-none" aria-hidden>
      {/* Left card */}
      <div
        className="animate-float-delayed absolute left-[2%] sm:left-[8%] top-10 w-40 sm:w-48 aspect-[4/5] rounded-2xl overflow-hidden border border-white/15 shadow-2xl shadow-purple-900/40"
        style={{ "--float-rotate": "-7deg" } as React.CSSProperties}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />
        <div className="absolute bottom-0 p-3.5 text-left">
          <div className="text-[8px] font-bold tracking-[0.2em] text-emerald-300 uppercase mb-1">Fact 03</div>
          <div className="font-black text-base leading-tight" style={{ fontFamily: "Poppins Display" }}>
            Octopuses Have 3 Hearts
          </div>
        </div>
      </div>

      {/* Center card */}
      <div
        className="animate-float absolute left-1/2 -translate-x-1/2 top-0 w-48 sm:w-60 aspect-[4/5] rounded-2xl overflow-hidden border border-white/20 shadow-2xl shadow-brand-900/50 z-10"
        style={{ "--float-rotate": "0deg" } as React.CSSProperties}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500 via-purple-700 to-[#1a103d]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent" />
        <div className="absolute top-3 left-3.5 h-0.5 w-8 bg-amber-300 rounded-full" />
        <div className="absolute bottom-0 p-4 text-left">
          <div className="text-[9px] font-bold tracking-[0.2em] text-amber-300 uppercase mb-1.5">The Hook</div>
          <div className="font-black text-xl leading-tight" style={{ fontFamily: "Poppins Display" }}>
            93% Get This Wrong
          </div>
          <div className="text-[10px] text-white/70 mt-1.5 leading-snug">
            The brain processes images 60,000× faster than text.
          </div>
        </div>
      </div>

      {/* Right card */}
      <div
        className="animate-float-slow absolute right-[2%] sm:right-[8%] top-14 w-40 sm:w-48 aspect-[4/5] rounded-2xl overflow-hidden border border-white/15 shadow-2xl shadow-orange-900/30"
        style={{ "--float-rotate": "7deg" } as React.CSSProperties}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-rose-600 to-[#2a0a18]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />
        <div className="absolute bottom-0 p-3.5 text-left">
          <div className="text-[8px] font-bold tracking-[0.2em] text-orange-300 uppercase mb-1">Step 5</div>
          <div className="font-black text-base leading-tight" style={{ fontFamily: "Poppins Display" }}>
            Ship It Daily
          </div>
        </div>
      </div>

      {/* Caption chip floating under the cards */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 glass rounded-2xl px-4 py-2.5 flex items-center gap-2.5 text-xs text-white/70 shadow-xl whitespace-nowrap">
        <Instagram className="w-3.5 h-3.5 text-[#E4405F]" />
        Scheduled · Tomorrow 9:00 AM
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      <div className="aurora" aria-hidden />

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass border-t-0 border-l-0 border-r-0">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Sparkles className="w-5 h-5 text-brand-400" />
          <span className="gradient-text">Prompt2Post</span>
        </Link>
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
      <section className="relative px-6 pt-36 pb-16 text-center">
        <div className="relative z-10 max-w-4xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 text-xs bg-brand-600/15 border border-brand-500/30 text-brand-300 px-3 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3 h-3" />
            Powered by Groq Llama 3 × Pollinations.ai
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6 leading-tight">
            Turn any idea into
            <br />
            <span className="gradient-text-animated">stunning posts</span>
          </h1>

          <p className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto mb-9 leading-relaxed">
            Type a topic. Our AI plans, writes, and generates a complete carousel — real facts, vivid
            imagery, and captions — then publishes it to Instagram for you, now or on a schedule.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/sign-up"
              className="btn-shine inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-8 py-3.5 rounded-2xl text-base transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-brand-700/25"
            >
              Create your first post free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#pricing"
              className="inline-flex items-center justify-center gap-2 glass hover:bg-white/10 text-white/80 font-medium px-8 py-3.5 rounded-2xl text-base transition-colors"
            >
              See pricing
            </Link>
          </div>
        </div>

        <HeroMockups />
      </section>

      {/* ── Topic marquee ───────────────────────────────────────────────── */}
      <section className="py-6 border-y border-white/[0.06]">
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
      <section className="max-w-4xl mx-auto px-6 py-14 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
        {STATS.map((s) => (
          <div key={s.label}>
            <div className="text-3xl sm:text-4xl font-black gradient-text">{s.value}</div>
            <div className="text-white/40 text-xs mt-1.5 leading-snug">{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── Bento features ──────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-3">Everything you need</h2>
        <p className="text-white/50 text-center mb-12">
          From blank topic to published post — one workflow.
        </p>

        <div className="grid sm:grid-cols-6 gap-4">
          {/* Large cell: AI engine */}
          <div className="sm:col-span-4 glass hover-lift rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-brand-600/15 blur-3xl" />
            <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 text-brand-400" />
            </div>
            <h3 className="font-semibold text-lg mb-1.5">Two-stage AI engine</h3>
            <p className="text-white/55 text-sm leading-relaxed max-w-md">
              Groq Llama 3 first plans the structure — tone, format, palette, slide count — then writes
              fact-rich copy for every slide. Pollinations FLUX paints the backgrounds and pixel-perfect
              vector text is composited on top. In 13 languages.
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
          <div className="sm:col-span-2 glass hover-lift rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-[#E4405F]/15 flex items-center justify-center mb-4">
              <Instagram className="w-5 h-5 text-[#E4405F]" />
            </div>
            <h3 className="font-semibold mb-1.5">Publish &amp; schedule</h3>
            <p className="text-white/55 text-sm leading-relaxed">
              Post carousels straight to Instagram, or queue them on a content calendar and let them
              publish themselves.
            </p>
          </div>

          {/* Idea Studio */}
          <div className="sm:col-span-2 glass hover-lift rounded-2xl p-6">
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
          <div className="sm:col-span-2 glass hover-lift rounded-2xl p-6">
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
          <div className="sm:col-span-2 glass hover-lift rounded-2xl p-6">
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
          <div className="sm:col-span-2 glass hover-lift rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center mb-4">
              <Image className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-semibold mb-1.5">Any format, auto-chosen</h3>
            <p className="text-white/55 text-sm leading-relaxed">
              Square, portrait, story, or wide — the AI picks the best aspect ratio for your topic.
            </p>
          </div>

          {/* Brand kit + captions */}
          <div className="sm:col-span-2 glass hover-lift rounded-2xl p-6">
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
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">How it works</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { n: "01", icon: <Lightbulb className="w-4 h-4 text-yellow-300" />, title: "Enter your topic", desc: "Type any subject — or let the Idea Studio brainstorm six post ideas for your niche." },
            { n: "02", icon: <Sparkles className="w-4 h-4 text-brand-400" />, title: "AI plans & writes", desc: "Groq Llama 3 determines structure, then writes creative, researched copy slide-by-slide." },
            { n: "03", icon: <Image className="w-4 h-4 text-blue-400" />, title: "Images are generated", desc: "Pollinations.ai generates visuals. Sharp composites your headline on top — refine any slide afterwards." },
            { n: "04", icon: <CalendarClock className="w-4 h-4 text-green-400" />, title: "Publish or schedule", desc: "Post straight to Instagram, schedule it for the perfect time, or export ZIP / PDF with captions." },
          ].map((step) => (
            <div key={step.n} className="glass hover-lift rounded-2xl p-5 text-left relative overflow-hidden">
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

      {/* ── Pricing ─────────────────────────────────────────────────────── */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-3">Simple pricing</h2>
        <p className="text-white/50 text-center mb-12">Start free. Upgrade when you need more.</p>
        <div className="grid sm:grid-cols-3 gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 flex flex-col gap-5 hover-lift ${
                plan.highlight
                  ? "bg-brand-600/20 border border-brand-500/50 shadow-lg shadow-brand-900/30"
                  : "glass"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs bg-brand-500 text-white px-3 py-1 rounded-full font-medium shadow-lg shadow-brand-600/40">
                  {plan.badge}
                </div>
              )}
              <div>
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className="text-white/50 text-sm">{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/75">
                    <Check className="w-4 h-4 text-green-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`btn-shine text-center py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                  plan.highlight
                    ? "bg-brand-500 hover:bg-brand-400 text-white"
                    : "glass hover:bg-white/10 text-white/80"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="relative glass rounded-3xl p-10 sm:p-14 text-center overflow-hidden">
          <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-brand-600/20 blur-3xl" />
          <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-purple-600/15 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-black mb-3">
              Your next 30 days of content,
              <br />
              <span className="gradient-text-animated">handled.</span>
            </h2>
            <p className="text-white/55 mb-8 max-w-md mx-auto">
              Ideas, copy, visuals, captions, scheduling — the whole pipeline, from one text box.
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
      <footer className="border-t border-white/10 py-8 text-center text-white/40 text-sm">
        <p>© 2026 Prompt2Post. Built with Next.js, Groq, Sharp &amp; Pollinations.ai.</p>
      </footer>
    </div>
  );
}
