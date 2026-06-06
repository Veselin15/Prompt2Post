import { getPool } from "@/lib/pg";
import type { Plan, Post, User, Subscription, SlideData, PostStructure, CreativeContent } from "@/types";

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

export async function incrementUserPostCount(userId: string): Promise<void> {
  await getPool().query(
    `update users set posts_this_month = posts_this_month + 1 where id = $1`,
    [userId]
  );
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
  offset = 0
): Promise<Post[]> {
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
