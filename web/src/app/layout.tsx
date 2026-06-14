import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

// `||` (not `??`) so an empty-string env var falls through to the next option —
// otherwise `new URL("")` below throws "Invalid URL" during the build.
const siteUrl =
  process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Prompt2Post – The AI content studio for Instagram creators",
    template: "%s · Prompt2Post",
  },
  description:
    "Type one topic and Prompt2Post plans, writes, designs, and schedules a scroll-stopping Instagram carousel — with on-brand copy, AI images, captions, and hashtags.",
  applicationName: "Prompt2Post",
  keywords: [
    "AI Instagram carousel generator",
    "social media post generator",
    "AI content studio",
    "Instagram scheduler",
    "carousel maker",
  ],
  authors: [{ name: "Prompt2Post" }],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Prompt2Post – The AI content studio for Instagram creators",
    description:
      "One topic in. A whole carousel out. AI plans, writes, designs, and schedules your Instagram posts.",
    url: siteUrl,
    siteName: "Prompt2Post",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prompt2Post",
    description: "One topic in. A whole carousel out — the AI content studio for Instagram creators.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body>
          {children}
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "rgba(20,20,30,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
