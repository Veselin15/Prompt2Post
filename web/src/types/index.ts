export type Plan = "free" | "pro" | "creator";

export interface User {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  plan: Plan;
  posts_this_month: number;
  posts_reset_at: string;
  created_at: string;
}

export interface SlideData {
  slide_number: number;
  headline: string;
  body: string;
  image_prompt: string;
  text_position: "top" | "center" | "bottom";
  text_size: "small" | "medium" | "large";
  image_url?: string;   // Supabase Storage URL after generation
}

export interface PostStructure {
  tone: string;
  style: string;
  post_type: "single" | "carousel" | "story";
  num_slides: number;
  color_mood: string;
}

export interface CreativeContent {
  topic: string;
  tone: string;
  style: string;
  post_type: string;
  hook: string;
  hashtags: string[];
  social_caption: string;
  slides: SlideData[];
}

export interface Post {
  id: string;
  user_id: string;
  topic: string;
  tone: string | null;
  style: string | null;
  post_type: string | null;
  num_slides: number;
  structure: PostStructure;
  content: CreativeContent;
  slides: SlideData[];
  zip_url: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_price_id: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

// ── Streaming event types ──────────────────────────────────────────────────────

export type GenerateEventType =
  | "status"
  | "structure"
  | "content"
  | "slide"
  | "done"
  | "error";

export interface GenerateEvent {
  type: GenerateEventType;
  message?: string;
  progress?: number;
  structure?: PostStructure;
  content?: Omit<CreativeContent, "slides">;
  slide?: SlideData & { index: number; total: number };
  post?: Post;
  error?: string;
}

// ── Plan limits ────────────────────────────────────────────────────────────────

export const PLAN_LIMITS: Record<Plan, {
  posts_per_month: number;
  max_slides: number;
  zip_download: boolean;
  priority: boolean;
  label: string;
  price_monthly: number;
}> = {
  free: {
    posts_per_month: 10,
    max_slides: 3,
    zip_download: false,
    priority: false,
    label: "Free",
    price_monthly: 0,
  },
  pro: {
    posts_per_month: 100,
    max_slides: 10,
    zip_download: true,
    priority: false,
    label: "Pro",
    price_monthly: 9,
  },
  creator: {
    posts_per_month: Infinity,
    max_slides: 10,
    zip_download: true,
    priority: true,
    label: "Creator",
    price_monthly: 29,
  },
};
