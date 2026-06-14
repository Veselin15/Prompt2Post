import { SignUp } from "@clerk/nextjs";
import AuthShell from "@/components/auth/AuthShell";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  return (
    <AuthShell loadingLabel="Loading sign up…">
      <SignUp appearance={clerkAppearance} />
    </AuthShell>
  );
}
