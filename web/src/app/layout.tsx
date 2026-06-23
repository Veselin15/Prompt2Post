import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  organizationJsonLd,
  websiteJsonLd,
  softwareApplicationJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Prompt2Post – The AI content studio for Instagram creators",
    template: "%s · Prompt2Post",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "AI Instagram carousel generator",
    "Instagram carousel maker",
    "AI social media post generator",
    "AI content studio",
    "Instagram post scheduler",
    "carousel maker",
    "AI caption generator",
    "social media content creator",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "technology",
  alternates: { canonical: "/" },
  formatDetection: { telephone: false, address: false, email: false },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Prompt2Post – The AI content studio for Instagram creators",
    description:
      "One topic in. A whole carousel out. AI plans, writes, designs, and schedules your Instagram posts.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
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
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: "siXqmYd1Q2TMOAMaciA74hvbZe4rEVaZ4V7duzlSEHc",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = [
    organizationJsonLd(),
    websiteJsonLd(),
    softwareApplicationJsonLd(),
  ];

  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body>
          <script
            type="application/ld+json"
            // Site-wide identity markup (Organization, WebSite, SoftwareApplication).
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
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
