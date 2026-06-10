import { getPool } from "@/lib/pg";
import type {
  Plan, Post, User, Subscription, SlideData, PostStructure, CreativeContent,
  BrandKit, ScheduledPost,
} from "@/types";

// ── User queries ───────────────────────────────────────────────────────────────

export async function upsertUser(data: {
  id: string;
  email: string;
}): Promise<User> {
  const { rows } = await getPool().query<User>(
    `insert into users (id, email)
     values ($1, $2)
     on conflict (id) do update set email = excluded.email
     returning *`,
    [data.id, data.email]
  );
  return rows[0];
}

export async function getUserById(id: string): Promise<User | null> {
  const { rows } = await getPool().query<User>(
    `select * from users where id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function getUserByStripeCustomer(
  customerId: string
): Promise<User | null> {
  const { rows } = await getPool().query<User>(
    `select * from users where stripe_customer_id = $1`,
    [customerId]
  );
  return rows[0] ?? null;
}

export async function updateUserStripeId(
  userId: string,
  customerId: string
): Promise<void> {
  await getPool().query(
    `update users set stripe_customer_id = $2 where id = $1`,
    [userId, customerId]
  );
}

export async function updateUserPlan(userId: string, plan: Plan): Promise<void> {
  await getPool().query(`update users set plan = $2 where id = $1`, [userId, plan]);
}

export async function saveInstagramAccount(
  userId: string,
  account: {
    instagramUserId: string;
    accessToken: string;
    tokenExpiresAt: Date | null;
    username: string;
  }
): Promise<void> {
  await getPool().query(
    `update users set
       instagram_user_id          = $2,
       instagram_access_token     = $3,
       instagram_token_expires_at = $4,
       instagram_username         = $5
     where id = $1`,
    [userId, account.instagramUserId, account.accessToken, account.tokenExpiresAt, account.username]
  );
}

export async function clearInstagramAccount(userId: string): Promise<void> {
  await getPool().query(
    `update users set
       instagram_user_id          = null,
       instagram_access_token     = null,
       instagram_token_expires_at = null,
       instagram_username         = null
     where id = $1`,
    [userId]
  );
}

export async function incrementUserPostCount(userId: string): Promise<void> {
  await getPool().query(
    `update users set posts_this_month = posts_this_month + 1 where id = $1`,
    [userId]
  );
}

/** Refund a post credit (used when a generation fails before producing anything). */
export async function decrementUserPostCount(userId: string): Promise<void> {
  await getPool().query(
    `update users set posts_this_month = greatest(posts_this_month - 1, 0) where id = $1`,
    [userId]
  );
}

// ── Brand Kit ──────────────────────────────────────────────────────────────────

export async function saveUserBrandKit(userId: string, kit: BrandKit): Promise<void> {
  await getPool().query(`update users set brand_kit = $2 where id = $1`, [
    userId,
    JSON.stringify(kit),
  ]);
}

export async function clearUserBrandKit(userId: string): Promise<void> {
  await getPool().query(`update users set brand_kit = null where id = $1`, [userId]);
}

// ── Post queries ───────────────────────────────────────────────────────────────

export async function createPost(data: {
  user_id: string;
  topic: string;
  tone: string;
  style: string;
  post_type: string;
  num_slides: number;
  structure: PostStructure;
  content: CreativeContent;
  slides: SlideData[];
  zip_url?: string;
}): Promise<Post> {
  const { rows } = await getPool().query<Post>(
    `insert into posts (user_id, topic, tone, style, post_type, num_slides, structure, content, slides, zip_url)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     returning *`,
    [
      data.user_id,
      data.topic,
      data.tone,
      data.style,
      data.post_type,
      data.num_slides,
      JSON.stringify(data.structure),
      JSON.stringify(data.content),
      JSON.stringify(data.slides),
      data.zip_url ?? null,
    ]
  );
  return mapPost(rows[0]);
}

export async function updatePostSlides(
  postId: string,
  slides: SlideData[],
  zipUrl?: string
): Promise<void> {
  if (zipUrl) {
    await getPool().query(
      `update posts set slides = $2, zip_url = $3 where id = $1`,
      [postId, JSON.stringify(slides), zipUrl]
    );
  } else {
    await getPool().query(`update posts set slides = $2 where id = $1`, [
      postId,
      JSON.stringify(slides),
    ]);
  }
}

export async function getPostsByUser(
  userId: string,
  limit = 20,
  offset = 0,
  since?: Date
): Promise<Post[]> {
  if (since) {
    const { rows } = await getPool().query<Post>(
      `select * from posts
       where user_id = $1 and created_at >= $4
       order by created_at desc
       limit $2 offset $3`,
      [userId, limit, offset, since]
    );
    return rows.map(mapPost);
  }
  const { rows } = await getPool().query<Post>(
    `select * from posts
     where user_id = $1
     order by created_at desc
     limit $2 offset $3`,
    [userId, limit, offset]
  );
  return rows.map(mapPost);
}

export async function getPostById(id: string): Promise<Post | null> {
  const { rows } = await getPool().query<Post>(
    `select * from posts where id = $1`,
    [id]
  );
  return rows[0] ? mapPost(rows[0]) : null;
}

/** Delete a post, scoped to its owner. Returns true when a row was removed. */
export async function deletePost(id: string, userId: string): Promise<boolean> {
  const { rowCount } = await getPool().query(
    `delete from posts where id = $1 and user_id = $2`,
    [id, userId]
  );
  return (rowCount ?? 0) > 0;
}

/** Replace the social caption inside the post's content JSONB, owner-scoped. */
export async function updatePostCaption(
  id: string,
  userId: string,
  caption: string
): Promise<boolean> {
  const { rowCount } = await getPool().query(
    `update posts
     set content = jsonb_set(content, '{social_caption}', to_jsonb($3::text))
     where id = $1 and user_id = $2`,
    [id, userId, caption]
  );
  return (rowCount ?? 0) > 0;
}

/** Store the cross-platform repurpose pack inside the post's content JSONB, owner-scoped. */
export async function updatePostRepurposed(
  id: string,
  userId: string,
  repurposed: { tweet: string; linkedin: string; story_hook: string; generated_at: string }
): Promise<boolean> {
  const { rowCount } = await getPool().query(
    `update posts
     set content = jsonb_set(content, '{repurposed}', $3::jsonb)
     where id = $1 and user_id = $2`,
    [id, userId, JSON.stringify(repurposed)]
  );
  return (rowCount ?? 0) > 0;
}

/** Enable or rotate a post's public share link, owner-scoped. Returns the token. */
export async function setPostShareToken(
  id: string,
  userId: string,
  token: string
): Promise<boolean> {
  const { rowCount } = await getPool().query(
    `update posts set share_token = $3 where id = $1 and user_id = $2`,
    [id, userId, token]
  );
  return (rowCount ?? 0) > 0;
}

/** Disable a post's public share link, owner-scoped. */
export async function clearPostShareToken(id: string, userId: string): Promise<boolean> {
  const { rowCount } = await getPool().query(
    `update posts set share_token = null where id = $1 and user_id = $2`,
    [id, userId]
  );
  return (rowCount ?? 0) > 0;
}

/** Public lookup for the read-only share page — no owner check by design. */
export async function getPostByShareToken(token: string): Promise<Post | null> {
  const { rows } = await getPool().query<Post>(
    `select * from posts where share_token = $1`,
    [token]
  );
  return rows[0] ? mapPost(rows[0]) : null;
}

/** Posts created per day over the trailing window — for the overview activity chart. */
export async function getDailyPostCounts(
  userId: string,
  days = 14
): Promise<{ day: string; count: number }[]> {
  const { rows } = await getPool().query<{ day: string; count: string }>(
    `select to_char(d.day, 'YYYY-MM-DD') as day, count(p.id) as count
     from generate_series(
       date_trunc('day', now()) - ($2 - 1) * interval '1 day',
       date_trunc('day', now()),
       interval '1 day'
     ) as d(day)
     left join posts p
       on p.user_id = $1
      and p.created_at >= d.day
      and p.created_at < d.day + interval '1 day'
     group by d.day
     order by d.day`,
    [userId, days]
  );
  return rows.map((r) => ({ day: r.day, count: Number(r.count) }));
}

/** Lifetime stats for the dashboard overview. */
export async function getUserPostStats(
  userId: string
): Promise<{ total_posts: number; total_slides: number }> {
  const { rows } = await getPool().query<{ total_posts: string; total_slides: string | null }>(
    `select count(*) as total_posts, coalesce(sum(num_slides), 0) as total_slides
     from posts where user_id = $1`,
    [userId]
  );
  return {
    total_posts: Number(rows[0]?.total_posts ?? 0),
    total_slides: Number(rows[0]?.total_slides ?? 0),
  };
}

// ── Scheduled posts (Instagram, Creator plan) ──────────────────────────────────

function mapScheduled(row: ScheduledPost): ScheduledPost {
  return {
    ...row,
    image_urls:
      typeof row.image_urls === "string" ? JSON.parse(row.image_urls) : row.image_urls,
  };
}

export async function createScheduledPost(data: {
  user_id: string;
  post_id: string;
  caption: string;
  image_urls: string[];
  scheduled_for: Date;
}): Promise<ScheduledPost> {
  const { rows } = await getPool().query<ScheduledPost>(
    `insert into scheduled_posts (user_id, post_id, caption, image_urls, scheduled_for)
     values ($1, $2, $3, $4, $5)
     returning *`,
    [data.user_id, data.post_id, data.caption, JSON.stringify(data.image_urls), data.scheduled_for]
  );
  return mapScheduled(rows[0]);
}

/** List a user's scheduled posts, newest first, with topic + thumbnail joined in. */
export async function getScheduledPostsByUser(
  userId: string,
  limit = 50
): Promise<ScheduledPost[]> {
  const { rows } = await getPool().query<ScheduledPost>(
    `select sp.*, p.topic, p.slides->0->>'image_url' as thumb
     from scheduled_posts sp
     join posts p on p.id = sp.post_id
     where sp.user_id = $1
     order by sp.scheduled_for desc
     limit $2`,
    [userId, limit]
  );
  return rows.map(mapScheduled);
}

/** Cancel a queued schedule, owner-scoped. Only queued entries can be canceled. */
export async function cancelScheduledPost(id: string, userId: string): Promise<boolean> {
  const { rowCount } = await getPool().query(
    `update scheduled_posts set status = 'canceled'
     where id = $1 and user_id = $2 and status = 'queued'`,
    [id, userId]
  );
  return (rowCount ?? 0) > 0;
}

/** Queued entries whose time has come (optionally for one user only). */
export async function getDueScheduledPosts(
  userId?: string,
  limit = 10
): Promise<ScheduledPost[]> {
  if (userId) {
    const { rows } = await getPool().query<ScheduledPost>(
      `select * from scheduled_posts
       where status = 'queued' and scheduled_for <= now() and user_id = $2
       order by scheduled_for asc limit $1`,
      [limit, userId]
    );
    return rows.map(mapScheduled);
  }
  const { rows } = await getPool().query<ScheduledPost>(
    `select * from scheduled_posts
     where status = 'queued' and scheduled_for <= now()
     order by scheduled_for asc limit $1`,
    [limit]
  );
  return rows.map(mapScheduled);
}

/**
 * Atomically claim a due entry for publishing — the status check inside the
 * UPDATE means two concurrent runners can never publish the same entry twice.
 */
export async function claimScheduledPost(id: string): Promise<ScheduledPost | null> {
  const { rows } = await getPool().query<ScheduledPost>(
    `update scheduled_posts set status = 'publishing'
     where id = $1 and status = 'queued'
     returning *`,
    [id]
  );
  return rows[0] ? mapScheduled(rows[0]) : null;
}

export async function markScheduledPostPublished(id: string, mediaId: string): Promise<void> {
  await getPool().query(
    `update scheduled_posts
     set status = 'published', media_id = $2, published_at = now(), error = null
     where id = $1`,
    [id, mediaId]
  );
}

export async function markScheduledPostFailed(id: string, error: string): Promise<void> {
  await getPool().query(
    `update scheduled_posts set status = 'failed', error = $2 where id = $1`,
    [id, error.slice(0, 500)]
  );
}

export async function countQueuedScheduled(userId: string): Promise<number> {
  const { rows } = await getPool().query<{ n: string }>(
    `select count(*) as n from scheduled_posts where user_id = $1 and status = 'queued'`,
    [userId]
  );
  return Number(rows[0]?.n ?? 0);
}

// ── Subscription queries ───────────────────────────────────────────────────────

export async function upsertSubscription(
  sub: Omit<Subscription, "created_at" | "updated_at">
): Promise<void> {
  await getPool().query(
    `insert into subscriptions (
       id, user_id, stripe_customer_id, stripe_price_id, status,
       current_period_start, current_period_end, cancel_at_period_end
     ) values ($1, $2, $3, $4, $5, $6, $7, $8)
     on conflict (id) do update set
       user_id = excluded.user_id,
       stripe_customer_id = excluded.stripe_customer_id,
       stripe_price_id = excluded.stripe_price_id,
       status = excluded.status,
       current_period_start = excluded.current_period_start,
       current_period_end = excluded.current_period_end,
       cancel_at_period_end = excluded.cancel_at_period_end`,
    [
      sub.id,
      sub.user_id,
      sub.stripe_customer_id,
      sub.stripe_price_id,
      sub.status,
      sub.current_period_start,
      sub.current_period_end,
      sub.cancel_at_period_end,
    ]
  );
}

export async function getSubscriptionByUser(
  userId: string
): Promise<Subscription | null> {
  const { rows } = await getPool().query<Subscription>(
    `select * from subscriptions
     where user_id = $1 and status = 'active'
     order by created_at desc
     limit 1`,
    [userId]
  );
  return rows[0] ?? null;
}

function mapPost(row: Post): Post {
  return {
    ...row,
    structure: typeof row.structure === "string" ? JSON.parse(row.structure) : row.structure,
    content: typeof row.content === "string" ? JSON.parse(row.content) : row.content,
    slides: typeof row.slides === "string" ? JSON.parse(row.slides) : row.slides,
  };
}
