import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { TOOL_SLUGS } from "@/lib/marketing/tools";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  // Marketing & legal pages
  "/privacy",
  "/terms",
  "/features",
  "/pricing",
  "/try",
  "/blog(.*)",
  // Root-level keyword landing pages (/ai-instagram-carousel-generator, …).
  // Listed from the data file so adding a tool page cannot silently leave it
  // behind an auth wall — which would make it uncrawlable.
  ...TOOL_SLUGS.map((slug) => `/${slug}`),
  "/for/(.*)",
  // Social preview images — extension-less routes, so the matcher runs on them
  "/opengraph-image(.*)",
  "/twitter-image(.*)",
  // SEO / discovery files and an unauthenticated health probe
  "/robots.txt",
  "/sitemap.xml",
  "/llms.txt",
  "/api/health",
  // Anonymous "try it without signing up" generator (rate-limited in-route)
  "/api/try",
  "/api/webhooks/stripe",
  "/api/clerk/webhook",
  "/api/files(.*)",
  // Public read-only share pages (token-gated by unguessable URL)
  "/p/(.*)",
  // Cron-triggered scheduled publishing — authenticates itself via CRON_SECRET
  // (or a signed-in user for the local-dev fallback).
  "/api/instagram/schedule/run",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
