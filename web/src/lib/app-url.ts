import type { NextRequest } from "next/server";

/**
 * Canonical public base URL for server-side redirects (Stripe, OAuth, share links).
 *
 * Behind Docker + Cloudflare Tunnel, req.nextUrl.origin is often https://0.0.0.0:3000.
 * Prefer APP_BASE_URL (runtime env, not baked at build) over NEXT_PUBLIC_*.
 */
export function getAppBaseUrl(req?: NextRequest): string {
  const runtime = process.env.APP_BASE_URL?.trim();
  if (runtime) return stripTrailingSlash(runtime);

  for (const key of ["NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_URL"] as const) {
    const value = process.env[key]?.trim();
    if (value && isUsablePublicUrl(value)) return stripTrailingSlash(value);
  }

  if (req) {
    const forwardedHost = req.headers.get("x-forwarded-host");
    const forwardedProto = req.headers.get("x-forwarded-proto") ?? "https";
    if (forwardedHost) {
      const host = forwardedHost.split(",")[0]?.trim();
      if (host && host !== "0.0.0.0" && !host.startsWith("0.0.0.0:")) {
        return stripTrailingSlash(`${forwardedProto}://${host}`);
      }
    }

    const origin = req.nextUrl.origin;
    if (isUsablePublicUrl(origin)) return stripTrailingSlash(origin);
  }

  return "http://localhost:3000";
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

function isUsablePublicUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname !== "0.0.0.0" && hostname !== "127.0.0.1";
  } catch {
    return false;
  }
}
