import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  // Marketing & legal pages
  "/privacy",
  "/terms",
  // SEO / discovery files and an unauthenticated health probe
  "/robots.txt",
  "/sitemap.xml",
  "/api/health",
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
