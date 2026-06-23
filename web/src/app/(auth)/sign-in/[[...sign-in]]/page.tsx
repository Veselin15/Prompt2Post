import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import AuthShell from "@/components/auth/AuthShell";
import { clerkAppearance } from "@/lib/clerk-appearance";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Prompt2Post account.",
  alternates: { canonical: "/sign-in" },
};

export default function SignInPage() {
  return (
    <AuthShell loadingLabel="Loading sign in…">
      <SignIn appearance={clerkAppearance} />
    </AuthShell>
  );
}
