import Link from "next/link";
import { Sparkles, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-6 overflow-hidden">
      <div className="ambient" aria-hidden />
      <div className="grid-fade" aria-hidden />
      <div className="relative z-10 text-center max-w-md">
        <div className="inline-flex items-center gap-2 font-bold text-lg mb-8">
          <Sparkles className="w-5 h-5 text-brand-400" />
          <span className="gradient-text">Prompt2Post</span>
        </div>
        <h1 className="text-7xl font-black tracking-tight gradient-text-animated mb-4">404</h1>
        <p className="text-white/60 text-lg mb-8">
          This page wandered off. Let&rsquo;s get you back to creating.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="btn-shine inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-6 py-3 rounded-2xl transition-colors"
          >
            <Home className="w-4 h-4" /> Home
          </Link>
          <Link
            href="/dashboard/create"
            className="inline-flex items-center justify-center gap-2 bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white/80 font-medium px-6 py-3 rounded-2xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
