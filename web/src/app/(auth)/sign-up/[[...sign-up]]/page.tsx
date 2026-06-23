import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import AuthShell from "@/components/auth/AuthShell";
import { clerkAppearance } from "@/lib/clerk-appearance";

export const metadata: Metadata = {
  title: "Sign up – Create your first Instagram carousel free",
  description:
    "Create a free Prompt2Post account and turn any topic into a scroll-stopping Instagram carousel — copy, AI images, captions, and hashtags included.",
  alternates: { canonical: "/sign-up" },
};

export default function SignUpPage() {
  return (
    <AuthShell loadingLabel="Loading sign up…">
      <SignUp appearance={clerkAppearance} />
    </AuthShell>
  );
}
