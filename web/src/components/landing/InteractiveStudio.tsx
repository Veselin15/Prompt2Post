"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Wand2,
  ImageIcon,
  Languages,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";

type Slide = {
  tag: string;
  title: string;
  body?: string;
  image: string; // themed AI-generated background, /public/landing/*.jpg
  gradient: string; // fallback while the image loads
  accent: string; // text color for eyebrow
};

type Preset = {
  id: string;
  label: string;
  emoji: string;
  handle: string;
  prompt: string;
  ringFrom: string;
  ringTo: string;
  caption: string;
  hashtags: string[];
  slides: Slide[];
};

const PRESETS: Preset[] = [
  {
    id: "fitness",
    label: "Fitness",
    emoji: "🏋️",
    handle: "@stronger.daily",
    prompt: "5 mistakes killing your gym progress",
    ringFrom: "#34d399",
    ringTo: "#0ea5e9",
    caption: "Stop doing these 👆 Save this before your next session.",
    hashtags: ["#gymtips", "#fitness", "#progress"],
    slides: [
      {
        tag: "The Hook",
        title: "93% Make Mistake #1",
        body: "And it quietly stalls every workout.",
        image: "/landing/fitness-0.jpg",
        gradient: "linear-gradient(135deg,#059669 0%,#0f766e 45%,#0b1120 100%)",
        accent: "#6ee7b7",
      },
      {
        tag: "Mistake 02",
        title: "Junk Volume",
        body: "More sets ≠ more muscle. Train hard, not long.",
        image: "/landing/fitness-1.jpg",
        gradient: "linear-gradient(135deg,#0ea5e9 0%,#1e3a8a 50%,#0b1120 100%)",
        accent: "#7dd3fc",
      },
      {
        tag: "Do This",
        title: "Track Every Set",
        body: "Progressive overload beats motivation.",
        image: "/landing/fitness-2.jpg",
        gradient: "linear-gradient(135deg,#10b981 0%,#065f46 45%,#031b14 100%)",
        accent: "#6ee7b7",
      },
    ],
  },
  {
    id: "travel",
    label: "Travel",
    emoji: "🌍",
    handle: "@wander.notes",
    prompt: "Hidden gems in Lisbon you'll love",
    ringFrom: "#818cf8",
    ringTo: "#22d3ee",
    caption: "Bookmark this for your next trip ✈️ Which one's first?",
    hashtags: ["#lisbon", "#travel", "#hiddengems"],
    slides: [
      {
        tag: "Lisbon",
        title: "Skip the Crowds",
        body: "7 spots locals actually love.",
        image: "/landing/travel-0.jpg",
        gradient: "linear-gradient(135deg,#6366f1 0%,#7e22ce 50%,#1e1b4b 100%)",
        accent: "#c4b5fd",
      },
      {
        tag: "Gem 03",
        title: "LX Factory",
        body: "Old factory → design + coffee heaven.",
        image: "/landing/travel-1.jpg",
        gradient: "linear-gradient(135deg,#0891b2 0%,#1e40af 55%,#0b1120 100%)",
        accent: "#67e8f9",
      },
      {
        tag: "Pro Tip",
        title: "Go at Sunrise",
        body: "Empty streets, golden tiles, no lines.",
        image: "/landing/travel-2.jpg",
        gradient: "linear-gradient(135deg,#7c3aed 0%,#4338ca 50%,#0b1120 100%)",
        accent: "#c4b5fd",
      },
    ],
  },
  {
    id: "money",
    label: "Money",
    emoji: "💸",
    handle: "@wealth.simple",
    prompt: "How to save your first $10,000",
    ringFrom: "#fbbf24",
    ringTo: "#f97316",
    caption: "The boring system that actually works 💰 Save + follow.",
    hashtags: ["#money", "#savings", "#personalfinance"],
    slides: [
      {
        tag: "The Goal",
        title: "Your First $10k",
        body: "Without a bigger paycheck.",
        image: "/landing/money-0.jpg",
        gradient: "linear-gradient(135deg,#f59e0b 0%,#b45309 50%,#1c1207 100%)",
        accent: "#fcd34d",
      },
      {
        tag: "Step 01",
        title: "Pay Yourself First",
        body: "Automate 20% the day you get paid.",
        image: "/landing/money-1.jpg",
        gradient: "linear-gradient(135deg,#f97316 0%,#9a3412 50%,#1c0f07 100%)",
        accent: "#fdba74",
      },
      {
        tag: "Step 02",
        title: "Kill One Subscription",
        body: "€40/mo = €480/yr back in your pocket.",
        image: "/landing/money-2.jpg",
        gradient: "linear-gradient(135deg,#d97706 0%,#7c2d12 55%,#160a05 100%)",
        accent: "#fcd34d",
      },
    ],
  },
  {
    id: "food",
    label: "Food",
    emoji: "🍳",
    handle: "@easy.eats",
    prompt: "3-ingredient high-protein breakfast",
    ringFrom: "#fb7185",
    ringTo: "#e879f9",
    caption: "30g protein, 5 minutes, 3 ingredients 🍳 Save for tomorrow!",
    hashtags: ["#highprotein", "#breakfast", "#easyrecipes"],
    slides: [
      {
        tag: "5 Min Recipe",
        title: "30g Protein, 3 Items",
        body: "No protein powder needed.",
        image: "/landing/food-0.jpg",
        gradient: "linear-gradient(135deg,#fb7185 0%,#be123c 50%,#1f0a12 100%)",
        accent: "#fda4af",
      },
      {
        tag: "You Need",
        title: "Eggs · Skyr · Oats",
        body: "That's the whole list. Promise.",
        image: "/landing/food-1.jpg",
        gradient: "linear-gradient(135deg,#e879f9 0%,#a21caf 50%,#1a0820 100%)",
        accent: "#f5d0fe",
      },
      {
        tag: "The Result",
        title: "Creamy & Filling",
        body: "Keeps you full till lunch.",
        image: "/landing/food-2.jpg",
        gradient: "linear-gradient(135deg,#f472b6 0%,#9d174d 55%,#1c0712 100%)",
        accent: "#fbcfe8",
      },
    ],
  },
];

const STEPS = [
  { label: "Planning structure", icon: Sparkles },
  { label: "Writing copy", icon: Wand2 },
  { label: "Painting visuals", icon: ImageIcon },
  { label: "Compositing text", icon: Languages },
];

const FORMATS = ["Portrait 4:5", "Square 1:1", "Story 9:16"];

type Phase = "idle" | "typing" | "generating" | "done";

export default function InteractiveStudio() {
  const [presetIdx, setPresetIdx] = useState(0);
  const [typed, setTyped] = useState(PRESETS[0].prompt);
  const [phase, setPhase] = useState<Phase>("done");
  const [step, setStep] = useState(0);
  const [slide, setSlide] = useState(0);
  const [dir, setDir] = useState(1);
  const [liked, setLiked] = useState(false);
  const [format, setFormat] = useState(0);

  const preset = PRESETS[presetIdx];
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const generate = useCallback((idx: number) => {
    clearTimers();
    const p = PRESETS[idx];
    setPresetIdx(idx);
    setLiked(false);
    setSlide(0);
    setStep(0);

    // Typewriter the prompt, then run the staged generation.
    setPhase("typing");
    setTyped("");
    const text = p.prompt;
    text.split("").forEach((_, i) => {
      timers.current.push(
        setTimeout(() => setTyped(text.slice(0, i + 1)), 18 * i)
      );
    });
    const typeDone = 18 * text.length + 150;

    timers.current.push(setTimeout(() => setPhase("generating"), typeDone));
    STEPS.forEach((_, i) => {
      timers.current.push(setTimeout(() => setStep(i), typeDone + 260 + i * 360));
    });
    timers.current.push(
      setTimeout(() => setPhase("done"), typeDone + 260 + STEPS.length * 360)
    );
  }, []);

  // Auto-advance the carousel once a post is ready.
  useEffect(() => {
    if (phase !== "done") return;
    const id = setInterval(() => {
      setDir(1);
      setSlide((s) => (s + 1) % preset.slides.length);
    }, 2800);
    return () => clearInterval(id);
  }, [phase, preset.slides.length]);

  useEffect(() => () => clearTimers(), []);

  const go = (d: number) => {
    setDir(d);
    setSlide((s) => (s + d + preset.slides.length) % preset.slides.length);
  };

  const busy = phase === "typing" || phase === "generating";
  const current = preset.slides[slide];

  return (
    <div className="grid lg:grid-cols-[1fr_minmax(300px,360px)] gap-6 lg:gap-10 items-center">
      {/* ── Left: the "console" ───────────────────────────────────────── */}
      <div className="panel-strong rounded-3xl p-5 sm:p-7 text-left">
        <div className="flex items-center gap-2 text-xs text-white/50 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
          <span className="ml-2">Prompt2Post Studio</span>
        </div>

        <label className="text-xs font-medium text-white/45 uppercase tracking-wider">
          Your topic
        </label>
        <div className="mt-2 rounded-2xl bg-black/30 border border-white/10 px-4 py-3.5 min-h-[58px] flex items-center">
          <span className="text-lg sm:text-xl font-medium text-white">
            {typed}
            {(phase === "typing" || phase === "idle") && (
              <span className="inline-block w-[2px] h-5 bg-brand-400 ml-0.5 align-middle animate-pulse" />
            )}
          </span>
        </div>

        {/* Format + language pills */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          {FORMATS.map((f, i) => (
            <button
              key={f}
              onClick={() => setFormat(i)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                format === i
                  ? "bg-brand-500/25 border-brand-400/50 text-white"
                  : "bg-white/[0.04] border-white/10 text-white/55 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
          <span className="text-xs px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-white/55 flex items-center gap-1.5">
            <Languages className="w-3 h-3" /> 13 languages
          </span>
        </div>

        {/* Try chips */}
        <div className="mt-5">
          <div className="text-xs text-white/40 mb-2">Try a niche — watch it build live:</div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p, i) => (
              <button
                key={p.id}
                onClick={() => generate(i)}
                disabled={busy}
                className={`text-sm px-3.5 py-2 rounded-xl border transition-all disabled:opacity-50 ${
                  presetIdx === i
                    ? "bg-white/[0.09] border-white/25 text-white"
                    : "bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:border-white/20"
                }`}
              >
                <span className="mr-1.5">{p.emoji}</span>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={() => generate(presetIdx)}
          disabled={busy}
          className="btn-shine mt-6 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-400 hover:to-purple-400 text-white font-semibold px-6 py-3.5 rounded-2xl transition-all disabled:opacity-70"
        >
          {busy ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              {phase === "typing" ? "Reading your topic…" : STEPS[step].label + "…"}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate carousel
            </>
          )}
        </button>
        <p className="text-center text-xs text-white/35 mt-2.5">
          No sign-up to watch the demo. Real posts take ~60 seconds.
        </p>
      </div>

      {/* ── Right: the phone ──────────────────────────────────────────── */}
      <div className="relative mx-auto w-[300px] sm:w-[330px]">
        {/* glow */}
        <div
          className="absolute -inset-6 rounded-[3rem] blur-2xl opacity-40 -z-10"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${preset.ringFrom}, transparent 70%)`,
          }}
        />
        <div className="relative rounded-[2.5rem] border border-white/15 bg-[#0c0c14] p-2.5 shadow-2xl shadow-black/60">
          {/* notch */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-2xl z-20" />

          <div className="rounded-[2rem] overflow-hidden bg-black">
            {/* IG header */}
            <div className="flex items-center gap-2.5 px-3.5 pt-5 pb-2.5">
              <div
                className="w-8 h-8 rounded-full p-[2px]"
                style={{
                  background: `conic-gradient(from 0deg, ${preset.ringFrom}, ${preset.ringTo}, ${preset.ringFrom})`,
                }}
              >
                <div className="w-full h-full rounded-full bg-[#0c0c14] flex items-center justify-center text-sm">
                  {preset.emoji}
                </div>
              </div>
              <div className="flex-1 leading-tight">
                <div className="text-[13px] font-semibold">{preset.handle}</div>
                <div className="text-[10px] text-white/45">Sponsored · Prompt2Post</div>
              </div>
              <MoreHorizontal className="w-4 h-4 text-white/60" />
            </div>

            {/* Carousel image */}
            <div className="relative aspect-[4/5] overflow-hidden bg-black">
              <AnimatePresence initial={false} custom={dir} mode="popLayout">
                <motion.div
                  key={`${preset.id}-${slide}`}
                  custom={dir}
                  initial={{ opacity: 0, x: dir * 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir * -60 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute inset-0"
                  style={{ background: current.gradient }}
                >
                  <Image
                    src={current.image}
                    alt=""
                    fill
                    sizes="330px"
                    priority={slide === 0}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/25" />
                  <div
                    className="absolute top-4 left-4 h-1 w-9 rounded-full"
                    style={{ background: current.accent }}
                  />
                  <div className="absolute bottom-0 p-5 text-left">
                    <div
                      className="text-[10px] font-bold tracking-[0.22em] uppercase mb-2"
                      style={{ color: current.accent }}
                    >
                      {current.tag}
                    </div>
                    <div
                      className="font-black text-2xl leading-[1.05] mb-2"
                      style={{ fontFamily: "Poppins Display" }}
                    >
                      {current.title}
                    </div>
                    {current.body && (
                      <div className="text-[12px] text-white/75 leading-snug max-w-[88%]">
                        {current.body}
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* slide counter */}
              <div className="absolute top-3.5 right-3.5 text-[10px] font-semibold bg-black/55 backdrop-blur-sm px-2 py-0.5 rounded-full z-10">
                {slide + 1}/{preset.slides.length}
              </div>

              {/* nav arrows */}
              <button
                onClick={() => go(-1)}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/65 flex items-center justify-center z-10 transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => go(1)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/65 flex items-center justify-center z-10 transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Generation overlay */}
              <AnimatePresence>
                {busy && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-30 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center gap-4"
                  >
                    <div className="relative w-14 h-14">
                      <div className="absolute inset-0 rounded-full spin-conic" />
                      <div className="absolute inset-[3px] rounded-full bg-black flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-brand-300" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {STEPS.map((s, i) => {
                        const active = phase === "generating" && i === step;
                        const done = phase === "generating" && i < step;
                        return (
                          <div
                            key={s.label}
                            className={`flex items-center gap-2 text-xs transition-opacity ${
                              active ? "text-white" : done ? "text-white/45" : "text-white/30"
                            }`}
                          >
                            <s.icon className={`w-3.5 h-3.5 ${active ? "text-brand-300" : ""}`} />
                            {s.label}
                            {active && (
                              <span className="flex gap-0.5 ml-0.5">
                                <span className="w-1 h-1 rounded-full bg-brand-300 animate-bounce [animation-delay:-0.2s]" />
                                <span className="w-1 h-1 rounded-full bg-brand-300 animate-bounce [animation-delay:-0.1s]" />
                                <span className="w-1 h-1 rounded-full bg-brand-300 animate-bounce" />
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* IG action row */}
            <div className="px-3.5 pt-3 pb-1 flex items-center gap-4">
              <button onClick={() => setLiked((v) => !v)} aria-label="Like">
                <Heart
                  className={`w-6 h-6 transition-transform ${
                    liked ? "fill-rose-500 text-rose-500 animate-pop" : "text-white"
                  }`}
                />
              </button>
              <MessageCircle className="w-6 h-6 -scale-x-100" />
              <Send className="w-6 h-6" />
              <Bookmark className="w-6 h-6 ml-auto" />
            </div>

            {/* dots */}
            <div className="flex justify-center gap-1.5 pb-1">
              {preset.slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDir(i > slide ? 1 : -1);
                    setSlide(i);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    i === slide ? "w-4 bg-brand-400" : "w-1.5 bg-white/30"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* likes + caption */}
            <div className="px-3.5 pb-4 pt-1 text-left">
              <div className="text-[12px] font-semibold">
                {(2147 + slide * 313 + (liked ? 1 : 0)).toLocaleString()} likes
              </div>
              <div className="text-[12px] text-white/80 mt-0.5 leading-snug">
                <span className="font-semibold">{preset.handle}</span> {preset.caption}
              </div>
              <div className="text-[12px] text-sky-400 mt-0.5">
                {preset.hashtags.join(" ")}
              </div>
            </div>
          </div>
        </div>

        {/* Export-ready chip */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 panel-strong rounded-full px-3.5 py-2 flex items-center gap-2 text-[11px] text-white/70 whitespace-nowrap shadow-xl">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Ready to export · ZIP &amp; PDF
        </div>
      </div>
    </div>
  );
}
