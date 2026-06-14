import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of Prompt2Post.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="June 14, 2026">
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of Prompt2Post (the
        &ldquo;Service&rdquo;). By creating an account or using the Service, you agree to these Terms.
      </p>

      <h2>The Service</h2>
      <p>
        Prompt2Post is an AI content studio that helps you plan, generate, edit, and publish social
        media posts. Features and plan limits may change as the Service evolves.
      </p>

      <h2>Accounts</h2>
      <p>
        You must provide accurate information and keep your credentials secure. You are responsible
        for activity that happens under your account. You must be old enough to form a binding
        contract in your jurisdiction.
      </p>

      <h2>Your content</h2>
      <p>
        You retain ownership of the topics you submit and the posts you generate. You grant us the
        limited rights needed to host, process, and—at your direction—publish that content to
        connected platforms. You are responsible for ensuring your content and its publication comply
        with applicable laws and the rules of any third-party platform (including Instagram and Meta).
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Do not use the Service to create unlawful, deceptive, infringing, or harmful content.</li>
        <li>Do not attempt to disrupt, reverse-engineer, or abuse the Service or its rate limits.</li>
        <li>Do not resell or misrepresent AI-generated output in ways that violate platform rules.</li>
      </ul>

      <h2>AI-generated output</h2>
      <p>
        Generated text and images are produced by third-party AI models and may be inaccurate. You are
        responsible for reviewing output before publishing. We make no warranty that output is unique,
        accurate, or fit for a particular purpose.
      </p>

      <h2>Subscriptions &amp; billing</h2>
      <p>
        Paid plans are billed through Stripe on a recurring basis until cancelled. You can manage or
        cancel your subscription from the billing area; cancellation takes effect at the end of the
        current billing period. Fees are non-refundable except where required by law.
      </p>

      <h2>Termination</h2>
      <p>
        You may stop using the Service at any time. We may suspend or terminate access if you violate
        these Terms or use the Service in a way that risks harm to others or to the Service.
      </p>

      <h2>Disclaimer &amp; liability</h2>
      <p>
        The Service is provided &ldquo;as is&rdquo; without warranties of any kind. To the maximum
        extent permitted by law, we are not liable for indirect or consequential damages arising from
        your use of the Service.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these Terms? Email{" "}
        <a href="mailto:support@prompt2post.app">support@prompt2post.app</a>.
      </p>
    </LegalLayout>
  );
}
