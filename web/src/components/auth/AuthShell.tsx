import { ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import { Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

interface Props {
  loadingLabel: string;
  children: React.ReactNode;
}

export default function AuthShell({ loadingLabel, children }: Props) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] px-4 py-12 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full bg-brand-600/10 blur-[120px]" />
        <div className="absolute top-0 right-0 w-[320px] h-[320px] rounded-full bg-purple-600/6 blur-[100px]" />
      </div>

      <Link
        href="/"
        className="relative z-10 flex items-center gap-2 mb-8 font-bold text-lg hover:opacity-90 transition-opacity"
      >
        <Sparkles className="w-5 h-5 text-brand-400" />
        <span className="gradient-text">Prompt2Post</span>
      </Link>

      <ClerkLoading>
        <div className="relative z-10 flex flex-col items-center gap-3 py-16">
          <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
          <p className="text-sm text-white/50">{loadingLabel}</p>
        </div>
      </ClerkLoading>

      <ClerkLoaded>
        <div className="relative z-10 w-full max-w-[420px] animate-fade-in">{children}</div>
      </ClerkLoaded>
    </div>
  );
}
