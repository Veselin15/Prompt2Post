"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import type { SlideData } from "@/types";

interface Props {
  slides: SlideData[];
  generating?: number; // index of slide currently being generated (-1 = none)
  total?: number;
}

export default function SlideGallery({ slides, generating = -1, total }: Props) {
  const [active, setActive] = useState(0);

  if (slides.length === 0 && generating === -1) return null;

  // Determine what to show
  const showSlides = [...slides];
  const displayTotal = total ?? slides.length;

  // Add skeleton slots for slides still being generated
  const skeletonCount = Math.max(0, displayTotal - slides.length);
  const activeSlide = showSlides[active];

  return (
    <div className="space-y-4">
      {/* Main viewer */}
      <div className="relative w-full aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden bg-white/5 border border-white/10">
        {activeSlide?.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activeSlide.image_url}
            alt={activeSlide.headline}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {generating === active ? (
              <div className="text-center space-y-2">
                <div className="w-8 h-8 border-2 border-brand-500/40 border-t-brand-400 rounded-full animate-spin mx-auto" />
                <p className="text-white/40 text-xs">Generating slide {active + 1}…</p>
              </div>
            ) : (
              <div className="w-full h-full shimmer" />
            )}
          </div>
        )}

        {/* Slide counter overlay */}
        {displayTotal > 1 && (
          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
            {active + 1}/{displayTotal}
          </div>
        )}

        {/* Nav arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={() => setActive((v) => Math.max(0, v - 1))}
              disabled={active === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white disabled:opacity-30 hover:bg-black/60 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActive((v) => Math.min(slides.length - 1, v + 1))}
              disabled={active >= slides.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white disabled:opacity-30 hover:bg-black/60 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {(slides.length > 1 || skeletonCount > 0) && (
        <div className="flex gap-2 overflow-x-auto pb-1 justify-center">
          {showSlides.map((s, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={clsx(
                "w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all",
                active === i ? "border-brand-400 scale-110" : "border-transparent opacity-60 hover:opacity-90"
              )}
            >
              {s.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full shimmer" />
              )}
            </button>
          ))}
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div
              key={`sk-${i}`}
              className="w-12 h-12 rounded-lg shrink-0 bg-white/5 border-2 border-transparent"
            />
          ))}
        </div>
      )}

      {/* Slide text content */}
      {activeSlide && (
        <div className="glass rounded-xl p-4 animate-fade-in">
          <p className="font-bold text-sm mb-1">{activeSlide.headline}</p>
          {activeSlide.body && (
            <p className="text-white/60 text-xs leading-relaxed">{activeSlide.body}</p>
          )}
        </div>
      )}
    </div>
  );
}
