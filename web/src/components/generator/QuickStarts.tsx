"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Flame,
  ListOrdered,
  MessageSquareQuote,
  AlertTriangle,
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/**
 * Curated proven post formats. Clicking one deep-links back into the Create
 * page with prefill params (same mechanism as Idea Studio links), seeding the
 * topic with a fill-in-the-blank scaffold built around whatever the user has
 * already typed.
 */
interface Recipe {
  id: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
  /** Builds the topic scaffold around the user's current topic (may be ""). */
  topic: (t: string) => string;
  tone: string;
  template: string;
  format: string;
  slides: number;
}

const RECIPES: Recipe[] = [
  {
    id: "myths",
    label: "Myths, busted",
    desc: "5 misconceptions debunked",
    icon: <Flame className="w-3.5 h-3.5 text-orange-400" />,
    topic: (t) => `5 myths about ${t} everyone believes`,
    tone: "educational",
    template: "banner",
    format: "portrait",
    slides: 6,
  },
  {
    id: "howto",
    label: "How-to in 5 steps",
    desc: "Actionable step-by-step guide",
    icon: <ListOrdered className="w-3.5 h-3.5 text-blue-400" />,
    topic: (t) => `How to master ${t} in 5 practical steps`,
    tone: "educational",
    template: "banner",
    format: "portrait",
    slides: 6,
  },
  {
    id: "mistakes",
    label: "Beginner mistakes",
    desc: "What newcomers get wrong",
    icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />,
    topic: (t) => `The biggest beginner mistakes in ${t} and how to avoid them`,
    tone: "educational",
    template: "classic",
    format: "portrait",
    slides: 5,
  },
  {
    id: "stats",
    label: "Surprising stats",
    desc: "Numbers that stop the scroll",
    icon: <BarChart3 className="w-3.5 h-3.5 text-green-400" />,
    topic: (t) => `Mind-blowing statistics about ${t}`,
    tone: "dramatic",
    template: "classic",
    format: "portrait",
    slides: 5,
  },
  {
    id: "hottake",
    label: "Hot take",
    desc: "One bold statement slide",
    icon: <MessageSquareQuote className="w-3.5 h-3.5 text-purple-400" />,
    topic: (t) => `An unpopular opinion about ${t}`,
    tone: "dramatic",
    template: "quote",
    format: "square",
    slides: 1,
  },
  {
    id: "story",
    label: "Story time",
    desc: "Narrative arc, full-bleed",
    icon: <BookOpen className="w-3.5 h-3.5 text-rose-400" />,
    topic: (t) => `The untold story of ${t}`,
    tone: "dramatic",
    template: "minimal",
    format: "story",
    slides: 7,
  },
];

function scrollMask(left: boolean, right: boolean): string | undefined {
  if (!left && !right) return undefined;
  if (left && right) {
    return "linear-gradient(90deg, transparent, black 32px, black calc(100% - 32px), transparent)";
  }
  if (left) return "linear-gradient(90deg, transparent, black 32px, black)";
  return "linear-gradient(90deg, black, black calc(100% - 32px), transparent)";
}

interface Props {
  /** Whatever the user has typed in the topic box so far. */
  currentTopic: string;
  disabled?: boolean;
}

export default function QuickStarts({ currentTopic, disabled }: Props) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollHints = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollHints();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateScrollHints, { passive: true });
    const observer = new ResizeObserver(updateScrollHints);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollHints);
      observer.disconnect();
    };
  }, [updateScrollHints]);

  function scrollBy(delta: number) {
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  function apply(recipe: Recipe) {
    const subject = currentTopic.trim() || "your topic";
    const params = new URLSearchParams({
      topic: recipe.topic(subject),
      tone: recipe.tone,
      template: recipe.template,
      format: recipe.format,
      slides: String(recipe.slides),
    });
    router.push(`/dashboard/create?${params.toString()}`);
  }

  const mask = scrollMask(canScrollLeft, canScrollRight);

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-2">
        Quick starts
      </p>
      <div className="relative group">
        {canScrollLeft && (
          <button
            type="button"
            aria-label="Scroll quick starts left"
            onClick={() => scrollBy(-220)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-[#12121a]/95 border border-white/10 text-white/45 hover:text-white hover:border-white/20 shadow-md backdrop-blur-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {canScrollRight && (
          <button
            type="button"
            aria-label="Scroll quick starts right"
            onClick={() => scrollBy(220)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-[#12121a]/95 border border-white/10 text-white/45 hover:text-white hover:border-white/20 shadow-md backdrop-blur-sm transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-none scroll-smooth py-0.5 -mx-1 px-1"
          style={
            mask
              ? { maskImage: mask, WebkitMaskImage: mask }
              : undefined
          }
        >
          {RECIPES.map((r) => (
            <button
              key={r.id}
              onClick={() => apply(r)}
              disabled={disabled}
              title={r.desc}
              className="group flex items-center gap-2 shrink-0 text-xs bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-white/20 text-white/65 hover:text-white px-3 py-2 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {r.icon}
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
