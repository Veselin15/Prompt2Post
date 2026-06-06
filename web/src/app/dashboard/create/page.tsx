"use client";

import { useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import GeneratorForm from "@/components/generator/GeneratorForm";
import SlideGallery from "@/components/generator/SlideGallery";
import ContentPanel from "@/components/generator/ContentPanel";
import type {
  GenerateEvent,
  PostStructure,
  CreativeContent,
  SlideData,
  Post,
} from "@/types";
import { PLAN_LIMITS } from "@/types";

interface Progress {
  message: string;
  value: number;
}

export default function CreatePage() {
  const { user } = useUser();

  const plan = (user?.publicMetadata?.plan as string) ?? "free";
  const planKey = (["free", "pro", "creator"].includes(plan) ? plan : "free") as keyof typeof PLAN_LIMITS;
  const limits = PLAN_LIMITS[planKey];

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [structure, setStructure] = useState<PostStructure | null>(null);
  const [content, setContent] = useState<Omit<CreativeContent, "slides"> | null>(null);
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [generatingSlideIndex, setGeneratingSlideIndex] = useState(-1);
  const [totalSlides, setTotalSlides] = useState(0);
  const [post, setPost] = useState<Post | null>(null);

  const resetState = useCallback(() => {
    setProgress(null);
    setStructure(null);
    setContent(null);
    setSlides([]);
    setGeneratingSlideIndex(-1);
    setTotalSlides(0);
    setPost(null);
  }, []);

  const handleGenerate = useCallback(
    async (opts: { topic: string; tone: string; style: string; numSlides: number }) => {
      resetState();
      setIsGenerating(true);

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(opts),
        });

        if (!res.ok || !res.body) {
          const err = await res.json().catch(() => ({ error: "Request failed" }));
          throw new Error(err.error ?? "Failed to start generation");
        }

        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += dec.decode(value, { stream: true });

          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const event: GenerateEvent = JSON.parse(line.slice(6));
              handleEvent(event);
            } catch {
              // malformed chunk — skip
            }
          }
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Generation failed");
        setIsGenerating(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resetState]
  );

  function handleEvent(event: GenerateEvent) {
    switch (event.type) {
      case "status":
        setProgress({ message: event.message ?? "", value: event.progress ?? 0 });
        break;
      case "structure":
        setStructure(event.structure ?? null);
        setTotalSlides(event.structure?.num_slides ?? 0);
        break;
      case "content":
        setContent(event.content ?? null);
        break;
      case "slide": {
        const s = event.slide;
        if (!s) break;
        setGeneratingSlideIndex(s.index + 1 < s.total ? s.index + 1 : -1);
        setSlides((prev) => {
          const next = [...prev];
          next[s.index] = s;
          return next;
        });
        setProgress({ message: `Slide ${s.index + 1}/${s.total} ready`, value: event.progress ?? 0 });
        break;
      }
      case "done":
        setPost(event.post ?? null);
        setGeneratingSlideIndex(-1);
        setIsGenerating(false);
        setProgress({ message: "Done!", value: 100 });
        toast.success("Post generated successfully!");
        break;
      case "error":
        toast.error(event.error ?? "Something went wrong");
        setIsGenerating(false);
        setProgress(null);
        break;
    }
  }

  const hasContent = slides.length > 0 || structure !== null;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Create a post</h1>
        <p className="text-white/50 text-sm mt-1">
          Describe any topic — AI handles the writing, images, and layout.
        </p>
      </div>

      <div className={`grid gap-6 ${hasContent ? "lg:grid-cols-[1fr_360px_280px]" : "max-w-xl"}`}>
        {/* Left: form + progress */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <GeneratorForm
              isGenerating={isGenerating}
              maxSlides={limits.max_slides}
              onGenerate={handleGenerate}
            />
          </div>

          {progress && (
            <div className="glass rounded-2xl p-4 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-white/60">{progress.message}</p>
                <p className="text-xs text-brand-400 font-mono">{progress.value}%</p>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress.value}%` }}
                />
              </div>
            </div>
          )}

          {!limits.zip_download && (
            <p className="text-xs text-white/30 text-center">
              Upgrade to Pro for ZIP downloads &amp; up to 10 slides.
            </p>
          )}
        </div>

        {hasContent && (
          <SlideGallery
            slides={slides}
            generating={generatingSlideIndex}
            total={totalSlides || slides.length}
          />
        )}

        {hasContent && (
          <ContentPanel
            structure={structure}
            content={content}
            post={post}
            hasZip={limits.zip_download}
          />
        )}
      </div>
    </div>
  );
}
