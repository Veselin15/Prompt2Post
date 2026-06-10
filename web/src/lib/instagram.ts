/**
 * instagram.ts — Meta Graph API helpers for Instagram Content Publishing.
 *
 * Flow:
 *   1. buildOAuthUrl()          → redirect user to Facebook Login
 *   2. handleOAuthCallback()    → exchange code → long-lived user token
 *                                 → permanent page access token + IG account
 *   3. postToInstagram()        → single image or carousel publish
 *
 * Token strategy:
 *   - Short-lived user token (1 h) is exchanged for a long-lived user token (60 d).
 *   - A page access token derived from a long-lived user token never expires.
 *   - We store the permanent page access token in the DB.
 */

const GRAPH = "https://graph.facebook.com/v19.0";

// ── Types ────────────────────────────────────────────────────────────────────

export interface ConnectedInstagramAccount {
  instagramUserId: string;
  accessToken: string;    // permanent page access token
  tokenExpiresAt: Date | null;
  username: string;
}

// ── OAuth ─────────────────────────────────────────────────────────────────────

/**
 * Build the Facebook Login OAuth URL.
 * `state` is an opaque value the caller uses for CSRF protection / return path.
 */
export function buildOAuthUrl(state: string): string {
  const appId    = process.env.FACEBOOK_APP_ID;
  const redirect = callbackUrl();
  const scope    = [
    "instagram_basic",
    "instagram_content_publish",
    "pages_show_list",
    "pages_read_engagement",
  ].join(",");

  return (
    `https://www.facebook.com/v19.0/dialog/oauth` +
    `?client_id=${appId}` +
    `&redirect_uri=${encodeURIComponent(redirect)}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&state=${encodeURIComponent(state)}` +
    `&response_type=code`
  );
}

function callbackUrl(): string {
  // NEXT_PUBLIC_URL kept for back-compat; NEXT_PUBLIC_APP_URL is the app-wide base.
  const base =
    process.env.NEXT_PUBLIC_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/api/instagram/callback`;
}

/** Exchange an OAuth authorization code for a short-lived user access token. */
async function exchangeCode(code: string): Promise<string> {
  const params = new URLSearchParams({
    client_id:     process.env.FACEBOOK_APP_ID!,
    client_secret: process.env.FACEBOOK_APP_SECRET!,
    redirect_uri:  callbackUrl(),
    code,
  });
  const res  = await fetch(`${GRAPH}/oauth/access_token?${params}`);
  const data = await res.json() as { access_token?: string; error?: { message: string } };
  if (!res.ok || !data.access_token) {
    throw new Error(data.error?.message ?? "OAuth code exchange failed");
  }
  return data.access_token;
}

/** Exchange a short-lived user token for a long-lived one (60 days). */
async function getLongLivedToken(shortToken: string): Promise<{ token: string; expiresIn: number }> {
  const params = new URLSearchParams({
    grant_type:        "fb_exchange_token",
    client_id:         process.env.FACEBOOK_APP_ID!,
    client_secret:     process.env.FACEBOOK_APP_SECRET!,
    fb_exchange_token: shortToken,
  });
  const res  = await fetch(`${GRAPH}/oauth/access_token?${params}`);
  const data = await res.json() as { access_token?: string; expires_in?: number; error?: { message: string } };
  if (!res.ok || !data.access_token) {
    throw new Error(data.error?.message ?? "Long-lived token exchange failed");
  }
  return { token: data.access_token, expiresIn: data.expires_in ?? 5_184_000 /* 60 days */ };
}

/**
 * Walk the user's Facebook Pages, find one linked to an Instagram Business
 * or Creator account, and return its permanent page access token + IG user info.
 */
async function resolveInstagramAccount(
  longLivedUserToken: string
): Promise<ConnectedInstagramAccount | null> {
  // 1. List pages (page access tokens derived from long-lived user token = permanent)
  const pagesRes = await fetch(
    `${GRAPH}/me/accounts?fields=id,name,access_token&access_token=${longLivedUserToken}`
  );
  const pagesData = await pagesRes.json() as { data?: Array<{ id: string; name: string; access_token: string }> };
  if (!pagesRes.ok || !pagesData.data?.length) return null;

  for (const page of pagesData.data) {
    // 2. Check for linked Instagram Business Account
    const igRes  = await fetch(
      `${GRAPH}/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
    );
    const igData = await igRes.json() as { instagram_business_account?: { id: string } };
    const igId   = igData.instagram_business_account?.id;
    if (!igId) continue;

    // 3. Get username
    const uRes  = await fetch(`${GRAPH}/${igId}?fields=id,username&access_token=${page.access_token}`);
    const uData = await uRes.json() as { username?: string };
    if (!uData.username) continue;

    return {
      instagramUserId: igId,
      accessToken:     page.access_token, // permanent (derived from long-lived user token)
      tokenExpiresAt:  null,              // page access tokens don't expire
      username:        uData.username,
    };
  }
  return null;
}

/**
 * Full OAuth callback handler.
 * Takes the `code` from the callback query string and returns a ready-to-store
 * `ConnectedInstagramAccount`.
 */
export async function handleOAuthCallback(code: string): Promise<ConnectedInstagramAccount> {
  const shortToken = await exchangeCode(code);
  const { token: longToken } = await getLongLivedToken(shortToken);
  const account = await resolveInstagramAccount(longToken);
  if (!account) {
    throw new Error(
      "No Instagram Business or Creator account found linked to your Facebook Page. " +
      "Make sure your Instagram account is set to Business or Creator, " +
      "and is connected to a Facebook Page."
    );
  }
  return account;
}

// ── Publishing ────────────────────────────────────────────────────────────────

type GraphError = { error?: { message: string } };

async function graphPost<T>(
  endpoint: string,
  accessToken: string,
  params: Record<string, string>
): Promise<T> {
  const body = new URLSearchParams({ access_token: accessToken, ...params });
  const res  = await fetch(`${GRAPH}/${endpoint}`, { method: "POST", body });
  const data = await res.json() as T & GraphError;
  if (!res.ok) {
    const msg = (data as GraphError).error?.message ?? `Graph API ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

/**
 * Post a single image or a carousel to Instagram.
 * Returns the published media ID.
 *
 * @param igUserId   — the Instagram Business Account user ID
 * @param accessToken — permanent page access token
 * @param imageUrls  — public HTTPS URLs for each slide (1 = single, 2-10 = carousel)
 * @param caption    — the post caption (can include hashtags)
 */
export async function postToInstagram(
  igUserId: string,
  accessToken: string,
  imageUrls: string[],
  caption: string
): Promise<{ mediaId: string }> {
  if (imageUrls.length === 0) throw new Error("No image URLs provided");

  if (imageUrls.length === 1) {
    return publishSingle(igUserId, accessToken, imageUrls[0], caption);
  }
  return publishCarousel(igUserId, accessToken, imageUrls.slice(0, 10), caption);
}

async function publishSingle(
  igUserId: string,
  accessToken: string,
  imageUrl: string,
  caption: string
): Promise<{ mediaId: string }> {
  const { id: containerId } = await graphPost<{ id: string }>(
    `${igUserId}/media`,
    accessToken,
    { image_url: imageUrl, caption }
  );

  const { id: mediaId } = await graphPost<{ id: string }>(
    `${igUserId}/media_publish`,
    accessToken,
    { creation_id: containerId }
  );
  return { mediaId };
}

async function publishCarousel(
  igUserId: string,
  accessToken: string,
  imageUrls: string[],
  caption: string
): Promise<{ mediaId: string }> {
  // Create one container per image
  const childIds: string[] = [];
  for (const imageUrl of imageUrls) {
    const { id } = await graphPost<{ id: string }>(
      `${igUserId}/media`,
      accessToken,
      { image_url: imageUrl, is_carousel_item: "true" }
    );
    childIds.push(id);
  }

  // Create carousel container
  const { id: carouselId } = await graphPost<{ id: string }>(
    `${igUserId}/media`,
    accessToken,
    { media_type: "CAROUSEL", children: childIds.join(","), caption }
  );

  // Publish
  const { id: mediaId } = await graphPost<{ id: string }>(
    `${igUserId}/media_publish`,
    accessToken,
    { creation_id: carouselId }
  );
  return { mediaId };
}

// ── Config check ──────────────────────────────────────────────────────────────

export function isInstagramConfigured(): boolean {
  return !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET);
}
