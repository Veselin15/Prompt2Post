export type Plan = "free" | "pro" | "creator";

// ── Post format / aspect ratio ───────────────────────────────────────────────────
// The "universal" dimension: the same topic can be rendered for any surface.

export type PostFormat = "square" | "portrait" | "story" | "wide";

export interface FormatSpec {
  label: string;
  ratio: string; // human label e.g. "4:5"
  width: number;
  height: number;
  hint: string; // where it's used
}

export const POST_FORMATS: Record<PostFormat, FormatSpec> = {
  square: { label: "Square", ratio: "1:1", width: 1080, height: 1080, hint: "1080×1080 · Instagram square" },
  portrait: { label: "Instagram", ratio: "4:5", width: 1080, height: 1350, hint: "1080×1350 · feed & carousel, no crop" },
  story: { label: "Story", ratio: "9:16", width: 1080, height: 1920, hint: "1080×1920 · Stories & Reels" },
  wide: { label: "Wide", ratio: "16:9", width: 1080, height: 608, hint: "LinkedIn · X · YouTube" },
};

export const DEFAULT_FORMAT: PostFormat = "portrait";

export function resolveFormat(value: unknown): PostFormat {
  return value === "square" || value === "portrait" || value === "story" || value === "wide"
    ? value
    : DEFAULT_FORMAT;
}

// ── Overlay template (the on-image text treatment) ───────────────────────────────

export type OverlayTemplate = "classic" | "banner" | "quote" | "minimal";

export interface TemplateSpec {
  label: string;
  hint: string;
}

export const OVERLAY_TEMPLATES: Record<OverlayTemplate, TemplateSpec> = {
  classic: { label: "Classic", hint: "Gradient scrim + bold headline" },
  banner: { label: "Banner", hint: "Solid card, magazine style" },
  quote: { label: "Quote", hint: "Centered quote with accent marks" },
  minimal: { label: "Minimal", hint: "Just text + soft shadow" },
};

export const DEFAULT_TEMPLATE: OverlayTemplate = "classic";

export function resolveTemplate(value: unknown): OverlayTemplate {
  return value === "classic" || value === "banner" || value === "quote" || value === "minimal"
    ? value
    : DEFAULT_TEMPLATE;
}

// ── Text amount + typographic "look" ─────────────────────────────────────────────

export type TextAmount = "minimal" | "balanced" | "detailed";
export type FontTheme = "modern" | "editorial";
export type HeadlineCase = "normal" | "upper";
export type TextAlign = "center" | "left";

export const TEXT_AMOUNTS: Record<TextAmount, { label: string; hint: string }> = {
  minimal: { label: "Minimal", hint: "Headline only — max impact" },
  balanced: { label: "Balanced", hint: "Headline + one short line" },
  detailed: { label: "Detailed", hint: "Headline + fuller supporting text" },
};

export const FONT_THEMES: Record<FontTheme, { label: string; hint: string }> = {
  modern: { label: "Modern", hint: "Geometric sans (Poppins)" },
  editorial: { label: "Editorial", hint: "High-contrast serif (DM Serif)" },
};

export const DEFAULT_TEXT_AMOUNT: TextAmount = "balanced";
export const DEFAULT_FONT_THEME: FontTheme = "modern";
export const DEFAULT_HEADLINE_CASE: HeadlineCase = "normal";
export const DEFAULT_TEXT_ALIGN: TextAlign = "center";

export function resolveTextAmount(v: unknown): TextAmount {
  return v === "minimal" || v === "balanced" || v === "detailed" ? v : DEFAULT_TEXT_AMOUNT;
}
export function resolveFontTheme(v: unknown): FontTheme {
  return v === "modern" || v === "editorial" ? v : DEFAULT_FONT_THEME;
}
export function resolveHeadlineCase(v: unknown): HeadlineCase {
  return v === "upper" || v === "normal" ? v : DEFAULT_HEADLINE_CASE;
}
export function resolveTextAlign(v: unknown): TextAlign {
  return v === "left" || v === "center" ? v : DEFAULT_TEXT_ALIGN;
}

// ── Output language ──────────────────────────────────────────────────────────────
// Copy (headlines, body, caption, hashtags) can be written in any of these.
// Image prompts always stay in English for the image model.

export const LANGUAGES: string[] = [
  "English", "Spanish", "Portuguese", "French", "German", "Italian",
  "Dutch", "Polish", "Turkish", "Bulgarian", "Hindi", "Japanese", "Korean",
];

/** "" = auto (English). Anything not in the allowlist falls back to auto. */
export function resolveLanguage(value: unknown): string {
  return typeof value === "string" && LANGUAGES.includes(value) ? value : "";
}

export const DEFAULT_ACCENT = "#8176fc";

/** Accept #rgb / #rrggbb, else fall back to the brand accent. */
export function resolveAccent(value: unknown): string {
  return typeof value === "string" && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim())
    ? value.trim()
    : DEFAULT_ACCENT;
}

// ── Copy-steering controls (audience / goal / emoji) ─────────────────────────────
// These shape WHAT the copy says and HOW it lands — the biggest levers on output
// quality — without touching the visual design. They thread into the creative
// brief and the writer prompt so the post is written FOR a specific reader with a
// specific job to do, instead of a generic feed filler.

/** Suggested audience chips. Free text is also accepted; "" = auto (broad reader). */
export const AUDIENCE_PRESETS: string[] = [
  "Beginners",
  "Professionals",
  "Founders",
  "Students",
  "Marketers",
  "Creators",
];

/** Normalise an audience string: collapse whitespace, cap length. "" = auto. */
export function resolveAudience(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, 60);
}

/** What the post is trying to achieve — steers the closing slide and the caption CTA. */
export type Goal = "" | "engagement" | "education" | "authority" | "sales" | "growth";

export const GOALS: Record<Exclude<Goal, "">, { label: string; hint: string }> = {
  engagement: { label: "Spark engagement", hint: "Comments, shares & saves" },
  education:  { label: "Educate", hint: "Teach something genuinely useful" },
  authority:  { label: "Build authority", hint: "Position you as the expert" },
  sales:      { label: "Drive action", hint: "Move readers toward an offer" },
  growth:     { label: "Grow followers", hint: "Earn the follow for more" },
};

export function resolveGoal(value: unknown): Goal {
  return value === "engagement" || value === "education" || value === "authority" ||
    value === "sales" || value === "growth"
    ? value
    : "";
}

/** How much emoji personality the copy carries. */
export type EmojiLevel = "none" | "minimal" | "expressive";

export const EMOJI_LEVELS: Record<EmojiLevel, { label: string; hint: string }> = {
  none:       { label: "None", hint: "No emojis anywhere — clean & serious" },
  minimal:    { label: "Minimal", hint: "1–2 tasteful emojis in the caption" },
  expressive: { label: "Expressive", hint: "Playful emoji use in the caption" },
};

export const DEFAULT_EMOJI: EmojiLevel = "minimal";

export function resolveEmoji(value: unknown): EmojiLevel {
  return value === "none" || value === "minimal" || value === "expressive"
    ? value
    : DEFAULT_EMOJI;
}

/** Normalise a social handle to "@something" (letters, numbers, dot, underscore). */
export function resolveHandle(value: unknown): string {
  if (typeof value !== "string") return "";
  const cleaned = value.trim().replace(/^@+/, "").replace(/[^a-zA-Z0-9._]/g, "").slice(0, 30);
  return cleaned ? `@${cleaned}` : "";
}

// ── Brand Kit — a user's saved design defaults ───────────────────────────────────
// Applied as the starting state of the Create form so every post starts on-brand.

export interface BrandKit {
  tone?: string;
  style?: string;
  format?: string;       // "auto" | PostFormat
  template?: string;     // "auto" | OverlayTemplate
  accent?: string;
  handle?: string;
  textAmount?: TextAmount;
  fontTheme?: FontTheme;
  headlineCase?: HeadlineCase;
  textAlign?: TextAlign;
  language?: string;
  audience?: string;
  goal?: Goal;
  emoji?: EmojiLevel;
}

export interface User {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  plan: Plan;
  posts_this_month: number;
  posts_reset_at: string;
  created_at: string;
  brand_kit: BrandKit | null;
  // Instagram integration
  instagram_user_id: string | null;
  instagram_access_token: string | null;
  instagram_token_expires_at: string | null;
  instagram_username: string | null;
}

// ── Scheduled Instagram posts (Creator) ──────────────────────────────────────────

export type ScheduledStatus = "queued" | "publishing" | "published" | "failed" | "canceled";

export interface ScheduledPost {
  id: string;
  user_id: string;
  post_id: string;
  caption: string;
  image_urls: string[];
  scheduled_for: string;
  status: ScheduledStatus;
  error: string | null;
  media_id: string | null;
  published_at: string | null;
  created_at: string;
  // Joined from posts for list views
  topic?: string;
  thumb?: string | null;
}

// ── Idea Studio ───────────────────────────────────────────────────────────────────

export interface IdeaSuggestion {
  title: string;
  hook: string;
  angle: string;
  suggested_tone: string;
  suggested_format: PostFormat;
  suggested_slides: number;
}

export interface SlideData {
  slide_number: number;
  headline: string;
  body: string;
  kicker?: string;      // short eyebrow / label above the headline
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
  format: PostFormat;
  template: OverlayTemplate;
  accent_color: string;
  handle: string;
  text_amount: TextAmount;
  font_theme: FontTheme;
  headline_case: HeadlineCase;
  text_align: TextAlign;
  /** Copy-steering context — optional, additive to the JSONB structure column. */
  audience?: string;
  goal?: Goal;
  emoji?: EmojiLevel;
}

/** Cross-platform versions of a post, generated on demand and stored in content JSONB. */
export interface RepurposedContent {
  tweet: string;
  linkedin: string;
  story_hook: string;
  generated_at: string;
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
  repurposed?: RepurposedContent;
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
  /** When set, the post is publicly viewable (read-only) at /p/{share_token}. */
  share_token: string | null;
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
  // Usage
  posts_per_month: number;
  max_slides: number;
  // Downloads
  zip_download: boolean;
  // Queue
  priority: boolean;
  // Meta
  label: string;
  price_monthly: number;
  // Feature gates
  templates: OverlayTemplate[];    // which overlay templates are allowed
  formats: PostFormat[];            // which aspect-ratio formats are allowed
  font_themes: FontTheme[];         // which font themes are allowed
  text_amounts: TextAmount[];       // which text-density options are allowed
  watermark: boolean;               // @handle watermark on images
  custom_accent: boolean;           // full colour-picker (vs preset swatches only)
  history_days: number;             // post history retention (-1 = unlimited)
}> = {
  free: {
    posts_per_month: 3,
    max_slides: 3,
    zip_download: false,
    priority: false,
    label: "Free",
    price_monthly: 0,
    templates: ["classic"],
    formats: ["square", "portrait"],
    font_themes: ["modern"],
    text_amounts: ["minimal", "balanced"],
    watermark: false,
    custom_accent: false,
    history_days: 7,
  },
  pro: {
    posts_per_month: 100,
    max_slides: 10,
    zip_download: true,
    priority: false,
    label: "Pro",
    price_monthly: 9,
    templates: ["classic", "banner", "quote", "minimal"],
    formats: ["square", "portrait", "story", "wide"],
    font_themes: ["modern", "editorial"],
    text_amounts: ["minimal", "balanced", "detailed"],
    watermark: true,
    custom_accent: true,
    history_days: 30,
  },
  creator: {
    posts_per_month: Infinity,
    max_slides: 10,
    zip_download: true,
    priority: true,
    label: "Creator",
    price_monthly: 29,
    templates: ["classic", "banner", "quote", "minimal"],
    formats: ["square", "portrait", "story", "wide"],
    font_themes: ["modern", "editorial"],
    text_amounts: ["minimal", "balanced", "detailed"],
    watermark: true,
    custom_accent: true,
    history_days: -1,
  },
};

/** Convenience type — the shape of one row from PLAN_LIMITS. */
export type PlanLimits = (typeof PLAN_LIMITS)[Plan];
