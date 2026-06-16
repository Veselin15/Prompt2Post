"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bookmark, Loader2, Trash2, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { clsx } from "clsx";
import DesignOptionsFields, { type DesignOptionValues } from "@/components/generator/DesignOptionsFields";
import DesignPreview, { type DesignState } from "@/components/generator/DesignPreview";
import { TONES, STYLES, FORMAT_OPTIONS } from "@/components/generator/design-form-ui";
import { saveBrandKit, clearBrandKit } from "@/lib/brand-kit-client";
import {
  PLAN_LIMITS,
  resolveAccent,
  resolveTextAmount,
  resolveFontTheme,
  resolveHeadlineCase,
  resolveTextAlign,
  resolveLanguage,
  type BrandKit,
  type OverlayTemplate,
  type PostFormat,
  type Plan,
  type PlanLimits,
} from "@/types";

const TEMPLATE_OPTIONS = ["auto", "classic", "banner", "quote", "minimal"] as const;

interface Props {
  planKey: Plan;
  limits: PlanLimits;
  initialKit: BrandKit | null;
}

function kitToValues(kit: BrandKit | null): DesignOptionValues {
  return {
    tone: kit?.tone && TONES.includes(kit.tone) ? kit.tone : "auto",
    style: kit?.style && STYLES.includes(kit.style) ? kit.style : "auto",
    format:
      kit?.format && FORMAT_OPTIONS.includes(kit.format as "auto" | PostFormat)
        ? (kit.format as "auto" | PostFormat)
        : "portrait",
    template:
      kit?.template && TEMPLATE_OPTIONS.includes(kit.template as typeof TEMPLATE_OPTIONS[number])
        ? (kit.template as "auto" | OverlayTemplate)
        : "auto",
    accent: resolveAccent(kit?.accent),
    handle: (kit?.handle ?? "").replace(/^@+/, ""),
    textAmount: resolveTextAmount(kit?.textAmount),
    fontTheme: resolveFontTheme(kit?.fontTheme),
    headlineCase: resolveHeadlineCase(kit?.headlineCase),
    align: resolveTextAlign(kit?.textAlign),
    language: resolveLanguage(kit?.language),
  };
}

export default function BrandKitClient({ planKey, limits, initialKit }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<DesignOptionValues>(() => kitToValues(initialKit));
  const [saved, setSaved] = useState(!!initialKit);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);

  const onChange = useCallback(
    <K extends keyof DesignOptionValues>(key: K, value: DesignOptionValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const design: DesignState = {
    topic: "Your brand, every time",
    format: values.format,
    template: values.template,
    accent: values.accent,
    fontTheme: values.fontTheme,
    headlineCase: values.headlineCase,
    textAlign: values.align,
    textAmount: values.textAmount,
    handle: values.handle,
  };

  useEffect(() => {
    if (!limits) return;
    if (!limits.font_themes.includes(values.fontTheme)) onChange("fontTheme", "modern");
    if (!limits.text_amounts.includes(values.textAmount)) onChange("textAmount", "balanced");
    if (values.format !== "auto" && !limits.formats.includes(values.format)) onChange("format", "auto");
    if (values.template !== "auto" && !limits.templates.includes(values.template)) onChange("template", "auto");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limits]);

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      await saveBrandKit({
        tone: values.tone === "auto" ? "" : values.tone,
        style: values.style === "auto" ? "" : values.style,
        format: values.format,
        template: values.template,
        accent: values.accent,
        handle: values.handle.trim(),
        textAmount: values.textAmount,
        fontTheme: values.fontTheme,
        headlineCase: values.headlineCase,
        textAlign: values.align,
        language: values.language,
      });
      setSaved(true);
      toast.success("Brand Kit saved — new posts will start with this look");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save your Brand Kit");
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    if (clearing || !saved) return;
    setClearing(true);
    try {
      await clearBrandKit();
      setSaved(false);
      setValues(kitToValues(null));
      toast.success("Brand Kit cleared — posts will use default settings");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not clear your Brand Kit");
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Brand Kit</h1>
        <p className="text-white/50 text-sm mt-1">
          Save your tone, colors, fonts, and language — every new post starts on-brand.
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300 text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          You have a saved Brand Kit. Update the settings below and save again to change it.
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="glass rounded-2xl p-5 sm:p-6">
          <DesignOptionsFields
            values={values}
            onChange={onChange}
            planLimits={limits}
            currentPlan={planKey}
          />

          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-5 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={clsx(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors",
                saving
                  ? "bg-brand-600/50 text-white/60 cursor-not-allowed"
                  : "bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/30"
              )}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  Save Brand Kit
                </>
              )}
            </button>

            {saved && (
              <button
                type="button"
                onClick={handleClear}
                disabled={clearing}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-white/50 hover:text-red-300 hover:bg-red-500/10 border border-white/[0.06] transition-colors disabled:opacity-50"
              >
                {clearing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <p className="text-xs text-white/40 mb-4 font-medium uppercase tracking-wider">Live preview</p>
            <DesignPreview design={design} />
          </div>

          <Link
            href="/dashboard/create"
            className="flex items-center gap-3 glass hover-lift hover:bg-white/8 rounded-2xl p-5 group"
          >
            <div>
              <div className="font-semibold text-sm">Create a post with this style</div>
              <div className="text-white/40 text-xs">Your Brand Kit applies automatically on the Create page</div>
            </div>
            <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 ml-auto transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
