"use client";

import { motion } from "framer-motion";
import {
  POST_FORMATS,
  resolveFormat,
  resolveTemplate,
  type PostFormat,
  type OverlayTemplate,
  type FontTheme,
  type HeadlineCase,
  type TextAlign,
  type TextAmount,
} from "@/types";

export interface DesignState {
  topic: string;
  format: "auto" | PostFormat;
  template: "auto" | OverlayTemplate;
  accent: string;
  fontTheme: FontTheme;
  headlineCase: HeadlineCase;
  textAlign: TextAlign;
  textAmount: TextAmount;
  handle: string;
}

function sampleHeadline(topic: string): string {
  const t = topic.trim();
  if (!t) return "Your big idea, beautifully set";
  const words = t.split(/\s+/).slice(0, 6).join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export default function DesignPreview({ design }: { design: DesignState }) {
  const fmt = POST_FORMATS[design.format === "auto" ? "square" : resolveFormat(design.format)];
  const template: OverlayTemplate = design.template === "auto" ? "classic" : resolveTemplate(design.template);
  const accent = design.accent;
  const isQuote = template === "quote";
  const position = isQuote ? "center" : "bottom";
  const align: TextAlign = isQuote ? "center" : design.textAlign;
  const showBar = template === "classic" || template === "minimal";

  const headline = sampleHeadline(design.topic);
  const body =
    design.textAmount === "minimal"
      ? ""
      : design.textAmount === "detailed"
        ? "Two crisp supporting lines of detail sit right here for context."
        : "One short supporting line sits right here.";
  const handle = design.handle.trim() ? `@${design.handle.trim().replace(/^@+/, "")}` : "";

  const headlineFont =
    design.fontTheme === "editorial"
      ? { fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400 }
      : { fontFamily: "'Poppins Display', system-ui, sans-serif", fontWeight: 800 };

  const alignItems = align === "left" ? "flex-start" : "center";
  const textAlign = (align === "left" ? "left" : "center") as "left" | "center";

  const content = (
    <div className="flex flex-col" style={{ gap: "1.6cqw", alignItems, textAlign, width: "100%" }}>
      <span
        style={{
          color: accent,
          fontFamily: "'Poppins Display', sans-serif",
          fontWeight: 600,
          fontSize: "2.4cqw",
          letterSpacing: "0.32cqw",
        }}
      >
        PREVIEW
      </span>
      <div
        style={{
          ...headlineFont,
          color: "#fff",
          fontSize: design.fontTheme === "editorial" ? "9.4cqw" : "8.8cqw",
          lineHeight: 1.05,
          textTransform: design.headlineCase === "upper" ? "uppercase" : "none",
          textShadow: template === "minimal" ? "0 2px 10px rgba(0,0,0,0.55)" : "0 2px 6px rgba(0,0,0,0.4)",
        }}
      >
        {headline}
      </div>
      {showBar && <span style={{ background: accent, width: "7cqw", height: "0.7cqw", borderRadius: 99 }} />}
      {body && (
        <p
          style={{
            fontFamily: "'Poppins Display', sans-serif",
            fontWeight: 600,
            color: "rgba(255,255,255,0.9)",
            fontSize: "2.7cqw",
            lineHeight: 1.35,
            maxWidth: "86%",
            marginLeft: align === "left" ? 0 : "auto",
            marginRight: align === "left" ? 0 : "auto",
          }}
        >
          {body}
        </p>
      )}
    </div>
  );

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40"
      style={{
        aspectRatio: `${fmt.width} / ${fmt.height}`,
        containerType: "inline-size",
        background: `radial-gradient(120% 90% at 70% 18%, ${accent}38 0%, #0c0b16 60%)`,
      }}
    >
      {/* decorative blobs */}
      <div className="absolute rounded-full blur-2xl opacity-40" style={{ width: "55%", height: "40%", top: "8%", right: "-6%", background: accent }} />
      <div className="absolute rounded-full blur-2xl opacity-20" style={{ width: "45%", height: "32%", bottom: "26%", left: "-8%", background: "#fff" }} />

      {/* scrim */}
      {(template === "classic" || isQuote) && (
        <div
          className="absolute inset-x-0"
          style={
            isQuote
              ? { top: "28%", bottom: "28%", background: "rgba(0,0,0,0.55)" }
              : { bottom: 0, height: "55%", background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)" }
          }
        />
      )}
      {template === "minimal" && (
        <div className="absolute inset-x-0 bottom-0" style={{ height: "55%", background: "linear-gradient(to top, rgba(0,0,0,0.45), transparent)" }} />
      )}

      {/* content area */}
      <div
        className="absolute inset-0 flex flex-col"
        style={{ padding: "7cqw", justifyContent: position === "center" ? "center" : "flex-end" }}
      >
        {isQuote && (
          <div style={{ ...headlineFont, color: accent, fontSize: "14cqw", lineHeight: 0.8, textAlign, marginBottom: "1cqw" }}>
            &ldquo;
          </div>
        )}

        {template === "banner" ? (
          <div className="relative rounded-xl" style={{ background: "rgba(11,10,20,0.82)", padding: "5cqw" }}>
            <span className="absolute left-0 top-0 bottom-0 rounded-full" style={{ width: "1.6cqw", background: accent }} />
            {content}
          </div>
        ) : (
          content
        )}
      </div>

      {/* handle */}
      {handle && (
        <span
          className="absolute inset-x-0 text-center"
          style={{
            bottom: "3.5cqw",
            color: "rgba(255,255,255,0.75)",
            fontFamily: "'Poppins Display', sans-serif",
            fontWeight: 600,
            fontSize: "2.4cqw",
          }}
        >
          {handle}
        </span>
      )}

      {/* format tag */}
      <span
        className="absolute rounded-full bg-white/10 text-white/80 backdrop-blur-sm"
        style={{ top: "3.5cqw", left: "3.5cqw", fontSize: "1.9cqw", padding: "1cqw 2.4cqw" }}
      >
        {design.format === "auto" ? "Auto" : fmt.label} · {fmt.ratio}
      </span>
    </motion.div>
  );
}
