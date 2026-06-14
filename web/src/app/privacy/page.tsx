import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Prompt2Post collects, uses, and protects your data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="June 14, 2026">
      <p>
        This Privacy Policy explains how Prompt2Post (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects, uses, and
        protects information when you use the Prompt2Post web application (the &ldquo;Service&rdquo;). By
        using the Service you agree to the practices described here.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Account data.</strong> When you sign up we receive your name, email address, and
          authentication identifiers from our authentication provider (Clerk).
        </li>
        <li>
          <strong>Content you create.</strong> The topics, prompts, brand settings, and generated
          posts (copy and images) you produce in the app are stored so you can access them.
        </li>
        <li>
          <strong>Billing data.</strong> Payments are processed by Stripe. We do not store your full
          card details; Stripe provides us a customer identifier and subscription status.
        </li>
        <li>
          <strong>Connected accounts.</strong> If you connect Instagram, we store the access token
          needed to publish on your behalf. You can disconnect at any time from your dashboard.
        </li>
        <li>
          <strong>Usage data.</strong> Basic technical logs (e.g. error reports) used to keep the
          Service running.
        </li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>To provide the Service — generating, storing, and publishing your content.</li>
        <li>To process subscriptions and enforce plan limits.</li>
        <li>To publish or schedule posts to third-party platforms you explicitly connect.</li>
        <li>To maintain security, prevent abuse, and improve reliability.</li>
      </ul>

      <h2>Third-party services</h2>
      <p>
        We rely on trusted processors to operate the Service: <strong>Clerk</strong> (authentication),
        <strong> Stripe</strong> (payments), <strong>Groq</strong> (AI text generation),
        <strong> Pollinations</strong> (AI image generation), and <strong>Meta / Instagram</strong>
        (optional publishing). Each processes data only as needed to perform its function.
      </p>

      <h2>Data retention</h2>
      <p>
        Your content is retained while your account is active. You can delete individual posts at any
        time, and deleting your account removes your stored content and disconnects linked accounts.
      </p>

      <h2>Your rights</h2>
      <p>
        You may access, correct, export, or delete your personal data. To make a request, contact us
        at the address below.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? Email{" "}
        <a href="mailto:support@prompt2post.app">support@prompt2post.app</a>.
      </p>
    </LegalLayout>
  );
}
