/**
 * rate-limit.ts – tiny in-process rate limiter for unauthenticated endpoints.
 *
 * Deliberately in-memory: this app runs as a single container, so a shared
 * store would be extra infrastructure for no benefit. The trade-off is that
 * counters reset on restart and would not be shared across replicas — if this
 * ever scales horizontally, swap the Map for Redis behind the same interface.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Drop expired buckets so the Map can't grow without bound. */
function prune(now: number) {
  if (buckets.size < 5000) return;
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the caller may retry (0 when allowed). */
  retryAfter: number;
}

/**
 * Consume one token from `key`'s bucket.
 * @param limit  max requests allowed inside the window
 * @param windowMs  window length in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  prune(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true, retryAfter: 0 };
}

/**
 * Give back a token consumed by `rateLimit` — used when the work the token was
 * spent on failed for our reasons, so a visitor isn't locked out by our bug.
 * No-op once the window has rolled over.
 */
export function refundRateLimit(key: string): void {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= Date.now()) return;
  bucket.count = Math.max(0, bucket.count - 1);
}

/**
 * Best-effort client IP. Cloudflare sets CF-Connecting-IP; x-forwarded-for is
 * the generic proxy header (first entry is the original client).
 */
export function clientIp(headers: Headers): string {
  const cf = headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return headers.get("x-real-ip")?.trim() ?? "unknown";
}
