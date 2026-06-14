import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import SiteFooter from "@/components/landing/SiteFooter";

export default function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      <div className="ambient" aria-hidden />

      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 glass border-t-0 border-l-0 border-r-0">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Sparkles className="w-5 h-5 text-brand-400" />
          <span className="gradient-text">Prompt2Post</span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back home
        </Link>
      </nav>

      <main className="relative z-10 max-w-3xl mx-auto px-6 pt-14 pb-20">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">{title}</h1>
        <p className="text-white/40 text-sm mb-10">Last updated: {updated}</p>
        <div className="legal-prose space-y-6 text-white/70 leading-relaxed">{children}</div>
      </main>

      <SiteFooter />
    </div>
  );
}
