import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import {
  Sparkles,
  Zap,
  Image,
  BarChart3,
  ArrowRight,
  Check,
} from "lucide-react";

const FEATURES = [
  {
    icon: <Sparkles className="w-5 h-5 text-brand-400" />,
    title: "Two-Stage AI Engine",
    desc: "Groq Llama 3 plans your structure, then writes creative, fact-rich copy for every slide.",
  },
  {
    icon: <Image className="w-5 h-5 text-purple-400" />,
    title: "Auto Image Generation",
    desc: "Pollinations.ai / Hugging Face generate stunning visuals. Sharp composites text perfectly.",
  },
  {
    icon: <Zap className="w-5 h-5 text-yellow-400" />,
    title: "Real-Time Streaming",
    desc: "Watch your post build slide-by-slide via server-sent events. No waiting.",
  },
  {
    icon: <BarChart3 className="w-5 h-5 text-green-400" />,
    title: "Smart Copy & Hashtags",
    desc: "Every post ships with a social caption, hook, and optimised hashtags ready to paste.",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    features: ["10 posts / month", "Up to 3 slides", "HD image generation", "Social captions"],
    cta: "Get started free",
    href: "/sign-up",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    features: ["100 posts / month", "Up to 10 slides", "ZIP download", "Priority queue", "All styles & tones"],
    cta: "Start Pro",
    href: "/sign-up",
    highlight: true,
    badge: "Most popular",
  },
  {
    name: "Creator",
    price: "$29",
    period: "/month",
    features: ["Unlimited posts", "Up to 10 slides", "ZIP download", "Priority generation", "API access (soon)"],
    cta: "Go Creator",
    href: "/sign-up",
    highlight: false,
  },
];

const EXAMPLES = [
  "The history of the internet",
  "Top 5 morning routines of CEOs",
  "Why the ocean is blue",
  "SpaceX Starship: what you need to know",
  "How to build a morning journaling habit",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass border-t-0 border-l-0 border-r-0">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Sparkles className="w-5 h-5 text-brand-400" />
          <span className="gradient-text">Prompt2Post</span>
        </Link>
        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton>
              <button className="text-sm text-white/70 hover:text-white transition-colors">
                Sign in
              </button>
            </SignInButton>
            <Link
              href="/sign-up"
              className="text-sm bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl font-medium transition-colors"
            >
              Start free
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard/create"
              className="text-sm bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-1.5"
            >
              Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </SignedIn>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 pt-24 pb-16">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-brand-600/10 blur-[120px]" />
          <div className="absolute top-2/3 left-1/4 w-[300px] h-[300px] rounded-full bg-purple-600/8 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 text-xs bg-brand-600/15 border border-brand-500/30 text-brand-300 px-3 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3 h-3" />
            Powered by Groq Llama 3 × Pollinations.ai
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6 leading-tight">
            Turn any idea into
            <br />
            <span className="gradient-text">stunning posts</span>
          </h1>

          <p className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Type a topic. Our AI plans, writes, and generates a complete carousel — real facts, vivid imagery,
            and captions — ready in under 60 seconds.
          </p>

          {/* Example prompts */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {EXAMPLES.map((ex) => (
              <span
                key={ex}
                className="text-sm bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 px-3 py-1.5 rounded-lg cursor-default transition-colors"
              >
                {ex}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-8 py-3.5 rounded-2xl text-base transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-brand-700/25"
            >
              Create your first post free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#pricing"
              className="inline-flex items-center gap-2 glass hover:bg-white/10 text-white/80 font-medium px-8 py-3.5 rounded-2xl text-base transition-colors"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-3">Everything you need</h2>
        <p className="text-white/50 text-center mb-12">
          From blank topic to polished carousel in one click.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 hover:bg-white/8 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-white/55 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-12">How it works</h2>
        <div className="space-y-6">
          {[
            { n: "01", title: "Enter your topic", desc: "Type any subject — a fact, a product, a story idea, a how-to." },
            { n: "02", title: "AI plans & writes", desc: "Groq Llama 3 determines structure, then writes creative, researched copy slide-by-slide." },
            { n: "03", title: "Images are generated", desc: "Pollinations.ai generates visuals. Sharp composites your headline on top." },
            { n: "04", title: "Download & post", desc: "Get your ZIP with all slides, captions, and hashtags. Ready to publish." },
          ].map((step) => (
            <div key={step.n} className="flex gap-5 items-start text-left glass rounded-2xl p-5">
              <span className="text-3xl font-black text-brand-400/40 leading-none w-10 shrink-0">{step.n}</span>
              <div>
                <h3 className="font-semibold mb-1">{step.title}</h3>
                <p className="text-white/55 text-sm">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────── */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-3">Simple pricing</h2>
        <p className="text-white/50 text-center mb-12">Start free. Upgrade when you need more.</p>
        <div className="grid sm:grid-cols-3 gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 flex flex-col gap-5 ${
                plan.highlight
                  ? "bg-brand-600/20 border border-brand-500/50 shadow-lg shadow-brand-900/30"
                  : "glass"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs bg-brand-500 text-white px-3 py-1 rounded-full font-medium">
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
                className={`text-center py-2.5 rounded-xl font-semibold text-sm transition-colors ${
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

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 py-8 text-center text-white/40 text-sm">
        <p>© 2026 Prompt2Post. Built with Next.js, Groq, Sharp &amp; Pollinations.ai.</p>
      </footer>
    </div>
  );
}
