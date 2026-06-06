import { SignIn } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand-600/8 blur-[100px]" />
      </div>
      <Link href="/" className="flex items-center gap-2 mb-8 font-bold text-lg relative z-10">
        <Sparkles className="w-5 h-5 text-brand-400" />
        <span className="gradient-text">Prompt2Post</span>
      </Link>
      <SignIn
        appearance={{
          variables: {
            colorBackground: "#111118",
            colorInputBackground: "#1a1a24",
            colorText: "#ffffff",
            colorTextSecondary: "rgba(255,255,255,0.55)",
            colorPrimary: "#6750f8",
            borderRadius: "14px",
          },
        }}
      />
    </div>
  );
}
