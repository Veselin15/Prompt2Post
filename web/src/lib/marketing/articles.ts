/**
 * Content for the "/blog/{slug}" pages.
 *
 * Articles are plain data rendered by a shared template, so each post stays
 * statically generated and gets Article + Breadcrumb JSON-LD for free. Every
 * article targets one primary search query (noted per entry).
 */

export type ArticleSection = {
  heading?: string;
  paragraphs?: string[];
  /** Optional bullet or numbered list rendered after the paragraphs. */
  list?: string[];
  ordered?: boolean;
};

export type Article = {
  slug: string;
  title: string;
  description: string;
  /** ISO date used for JSON-LD and the visible byline. */
  datePublished: string;
  readMinutes: number;
  keywords: string[];
  intro: string[];
  sections: ArticleSection[];
  takeaway: string;
};

export const ARTICLES: Article[] = [
  // Primary query: "instagram carousel size" / "instagram carousel dimensions"
  {
    slug: "instagram-carousel-size-guide",
    title: "Instagram carousel size & dimensions: the 2026 guide",
    description:
      "The exact Instagram carousel dimensions for 2026 — square, portrait, story and landscape — plus safe zones, aspect-ratio rules, and which format gets the most reach.",
    datePublished: "2026-07-01",
    readMinutes: 6,
    keywords: [
      "instagram carousel size",
      "instagram carousel dimensions",
      "instagram post size 2026",
      "instagram aspect ratio",
    ],
    intro: [
      "Get the size wrong and Instagram crops your carousel for you — usually through the middle of your headline. Here are the exact dimensions that work in 2026, which format earns the most feed real estate, and the safe zones that keep your text readable.",
    ],
    sections: [
      {
        heading: "The four carousel sizes Instagram supports",
        paragraphs: [
          "Instagram accepts one aspect ratio per carousel — every slide is forced to match the first one you upload. These are the four ratios and the pixel dimensions to export at:",
        ],
        list: [
          "Portrait (4:5) — 1080 × 1350 px. The tallest feed format and the default choice: it occupies about 20% more screen than a square.",
          "Square (1:1) — 1080 × 1080 px. The classic. Safe everywhere, ideal when your grid aesthetic matters.",
          "Landscape (1.91:1) — 1080 × 566 px. Wide and cinematic, but small in the feed — use only when the visual demands it.",
          "Story / Reels (9:16) — 1080 × 1920 px. For Stories and Reels covers, not feed carousels.",
        ],
      },
      {
        heading: "Which size gets the most reach?",
        paragraphs: [
          "Portrait 4:5 is the pragmatic winner for carousels. More vertical space means your post stays on screen longer as users scroll, and longer on-screen time correlates with more stops, reads, and swipes. Instagram has also been nudging the whole feed toward taller formats for years.",
          "Square remains the right call when your carousel will be viewed as part of a grid (profile visits matter for creators being evaluated by brands) or when you're repurposing the same asset to platforms that prefer 1:1.",
        ],
      },
      {
        heading: "Safe zones: where text can actually live",
        paragraphs: [
          "Dimensions are only half the story. Instagram overlays UI on your image — the account name at the top, the caption, like and share buttons at the bottom — and profile grid view crops everything to a centered square-ish window.",
        ],
        list: [
          "Keep headlines and key text within the middle ~80% of the canvas, both vertically and horizontally.",
          "Leave at least 120 px clear at the top and 250 px at the bottom on 4:5 exports if you care about text never touching UI.",
          "Check the first slide in grid crop: on a 1080 × 1350 portrait, the grid shows roughly the middle 1080 × 1080.",
        ],
      },
      {
        heading: "Technical specs that trip people up",
        list: [
          "Up to 20 slides per carousel (raised from 10 in 2024).",
          "JPG or PNG; Instagram re-compresses everything, so export at high quality (80–90) rather than maximum file size.",
          "All slides share the first slide's aspect ratio — mixing portrait and square in one carousel isn't possible.",
          "Minimum width is 320 px, but always upload at 1080 px wide; Instagram downscales far better than it upscales.",
        ],
      },
      {
        heading: "Skip the manual export math",
        paragraphs: [
          "If you'd rather not manage aspect ratios, safe zones, and export settings per post, Prompt2Post handles the whole pipeline: it picks the best format for your topic (or you choose), composites pixel-perfect vector text inside the safe zones, and exports print-quality slides ready to upload.",
        ],
      },
    ],
    takeaway:
      "Export at 1080 × 1350 (4:5 portrait) for maximum feed presence, keep text in the middle 80% of the canvas, and remember every slide inherits the first slide's aspect ratio.",
  },

  // Primary query: "how to make an instagram carousel"
  {
    slug: "how-to-make-instagram-carousel",
    title: "How to make an Instagram carousel people actually finish",
    description:
      "A step-by-step guide to making Instagram carousels — structure, hooks, slide copy, design, and captions — plus the retention tricks that make people swipe to the end.",
    datePublished: "2026-06-24",
    readMinutes: 8,
    keywords: [
      "how to make an instagram carousel",
      "instagram carousel tutorial",
      "carousel post instagram",
      "instagram carousel tips",
    ],
    intro: [
      "Carousels are Instagram's highest-engagement organic format — they get a second chance in the feed (Instagram re-serves slide two to people who didn't swipe) and they collect saves like no other post type. But most carousels lose 80% of viewers by slide three. This guide covers the full process, from structure to caption, with the retention mechanics that keep thumbs swiping.",
    ],
    sections: [
      {
        heading: "Step 1: One post, one promise",
        paragraphs: [
          "The single biggest carousel mistake is covering too much. A carousel is not a blog post — it's one specific promise, delivered in slides. “5 mistakes killing your squat” works; “everything about strength training” dies by slide two.",
          "Write the promise as your working title first. Every slide either advances that promise or gets cut.",
        ],
      },
      {
        heading: "Step 2: Structure before copy",
        paragraphs: [
          "Great carousels are planned like tiny presentations. The reliable skeleton:",
        ],
        list: [
          "Slide 1 — the hook: the promise, stated as boldly as honesty allows. Big type, minimal decoration.",
          "Slide 2 — the stakes: why this matters or what it costs to ignore. This is the slide that earns the rest of the swipes.",
          "Slides 3 to N−1 — one idea per slide: a single point, tip, step, or example each. If a slide needs two sentences of body text, it's two slides.",
          "Final slide — recap + call to action: summarize in three bullets, then tell people exactly what to do (save, share, comment, follow).",
        ],
        ordered: true,
      },
      {
        heading: "Step 3: Write for swiping, not reading",
        list: [
          "Keep headlines under ~8 words and body text under ~30 per slide.",
          "Use open loops: end slides with tension (“…but the third mistake is the one everyone makes”).",
          "Numbers beat adjectives: “saves 6 hours a week” outperforms “saves tons of time”.",
          "Front-load the value — don't save your best point for slide 9, that's where the recap goes.",
        ],
      },
      {
        heading: "Step 4: Design for the feed, not the canvas",
        paragraphs: [
          "Design principles that survive contact with a 6-inch screen: high contrast between text and background, one type hierarchy used consistently (headline / body / accent), and a palette of at most three colors. Export at 1080 × 1350 (4:5) — see our full size guide for safe zones.",
          "Consistency compounds: when every carousel shares your palette and type system, followers recognize your posts before reading a word.",
        ],
      },
      {
        heading: "Step 5: The caption and hashtags still matter",
        paragraphs: [
          "The caption's job is context and conversation: restate the promise in one line, add a detail that isn't in the slides, and end with a question or CTA. Then 3–8 specific hashtags — niche tags outperform giant generic ones.",
        ],
      },
      {
        heading: "Or: type the topic and skip to review",
        paragraphs: [
          "Everything above — structure, hooks, one-idea-per-slide copy, design system, caption, hashtags — is exactly the pipeline Prompt2Post automates. You type the topic, review the finished carousel, tweak any slide, and export. The free plan includes three posts a month.",
        ],
      },
    ],
    takeaway:
      "One promise per carousel, one idea per slide, a hook worth the swipe, and a recap slide with a clear CTA — that's the entire craft, and it's automatable.",
  },

  // Primary query: "instagram carousel ideas"
  {
    slug: "instagram-carousel-ideas",
    title: "45 Instagram carousel ideas that work in any niche",
    description:
      "45 proven Instagram carousel ideas organized by goal — education, authority, engagement, and sales — with examples you can adapt to any niche today.",
    datePublished: "2026-06-17",
    readMinutes: 7,
    keywords: [
      "instagram carousel ideas",
      "carousel post ideas",
      "instagram content ideas",
      "what to post on instagram",
    ],
    intro: [
      "The blank-canvas problem kills more posting streaks than any algorithm change. Here are 45 carousel formats that consistently perform, grouped by what they earn you — saves, authority, comments, or sales. Steal freely; each one adapts to any niche.",
    ],
    sections: [
      {
        heading: "Education carousels (earn saves)",
        paragraphs: [
          "Saves are Instagram's strongest reach signal, and reference content is what gets saved:",
        ],
        list: [
          "X mistakes beginners make in [topic]",
          "The step-by-step guide to [outcome]",
          "X myths about [topic], busted",
          "Do this, not that: [common practice]",
          "The only [tool/formula/checklist] you need for [task]",
          "X terms every [audience] should know",
          "How [impressive result] actually works",
          "The beginner's roadmap to [skill]",
          "X free tools for [task]",
          "Cheat sheet: [complex topic] on one screen",
          "What I wish I knew before [milestone]",
          "[Topic] explained like you're five",
        ],
      },
      {
        heading: "Authority carousels (earn trust)",
        list: [
          "Case study: how [client/we] achieved [result]",
          "Before and after: [transformation] step by step",
          "My exact process for [deliverable]",
          "X lessons from [number] years in [field]",
          "The framework I use with every client",
          "Unpopular opinion: [contrarian take] — and the data",
          "I analyzed [number] of [things]. Here's what works.",
          "Behind the scenes of [impressive project]",
          "The [industry] trends that will matter next year",
          "Questions clients always ask me, answered",
          "How to spot a bad [provider in your industry]",
        ],
      },
      {
        heading: "Engagement carousels (earn comments & shares)",
        list: [
          "Hot takes: X opinions about [topic] — agree or disagree?",
          "Which one are you? [X types of people in your niche]",
          "Rate my [setup/routine/stack] — then show me yours",
          "X signs you're a [audience identity]",
          "Things nobody tells you about [experience]",
          "POV: your first year as a [role]",
          "Red flags in [common situation]",
          "The [niche] starter pack",
          "Tag someone who needs to hear this: [advice]",
          "X quotes that changed how I think about [topic]",
          "Would you rather: [dilemma A] or [dilemma B]?",
        ],
      },
      {
        heading: "Sales carousels (earn customers)",
        list: [
          "The problem with [status quo] — and what to do instead",
          "X reasons [product category] fails (and how ours doesn't)",
          "What you get: inside [product/service]",
          "FAQ: everything people ask before buying",
          "[Price objection]? Here's the math",
          "Results our customers got in [timeframe]",
          "How to know you're ready for [offer]",
          "DIY vs done-for-you: the honest comparison",
          "What happens after you sign up, step by step",
          "Last call: [offer] closes [date] — here's what you'll miss",
          "The one-slide sales page (promise, proof, price, CTA)",
        ],
      },
      {
        heading: "Turning ideas into posts, faster",
        paragraphs: [
          "An idea list solves the blank page; production is the other half. Prompt2Post's Idea Studio generates six post ideas tuned to your specific niche, and each is one click from a finished carousel — structure, copy, images, caption, and hashtags included.",
        ],
      },
    ],
    takeaway:
      "Rotate the four goals — educate, prove, engage, sell — and you'll never post into the void. Aim for roughly 3 education posts for every sales post.",
  },

  // Primary query: "how many hashtags instagram"
  {
    slug: "instagram-hashtags-2026",
    title: "Instagram hashtags in 2026: how many, which ones, and where",
    description:
      "What actually works with Instagram hashtags in 2026 — the right number per post, niche vs broad tags, caption vs comment placement, and what changed with SEO-style search.",
    datePublished: "2026-06-10",
    readMinutes: 5,
    keywords: [
      "instagram hashtags 2026",
      "how many hashtags instagram",
      "instagram hashtag strategy",
      "instagram seo",
    ],
    intro: [
      "Hashtags aren't dead — they've been demoted. In 2026, Instagram reads your caption text, on-image text, and even audio to categorize content, and hashtags are one signal among many. Here's what still works, what's wasted effort, and how to think about Instagram search now.",
    ],
    sections: [
      {
        heading: "How many hashtags should you use?",
        paragraphs: [
          "Instagram's own guidance settled the old 30-tag debate: 3 to 5 hashtags per post. Testing across creator accounts consistently shows diminishing — and past a dozen, negative — returns beyond that.",
          "The reason: hashtags now work like topic labels, not distribution channels. Five precise labels categorize your post cleanly; thirty vague ones muddy the signal.",
        ],
      },
      {
        heading: "Niche tags beat giant tags",
        list: [
          "Skip #fitness (500M+ posts — your post drowns in seconds). Use #fitnessforbusymoms or #kettlebelltraining.",
          "The sweet spot is tags with roughly 10k–500k posts: active enough to have an audience, small enough to surface you.",
          "Use one branded tag (yours), 2–3 niche topic tags, and optionally one broader category tag.",
        ],
      },
      {
        heading: "Caption or first comment?",
        paragraphs: [
          "It no longer measurably matters for reach — Instagram reads both. Put them in the caption for simplicity; put them in the first comment if you prefer clean captions. Spend the saved energy on the caption's first line instead, which is what shows in previews and carries real SEO weight.",
        ],
      },
      {
        heading: "The bigger shift: Instagram is a search engine now",
        paragraphs: [
          "Instagram search increasingly matches keywords in captions, alt text, on-image text, and profile bios — not just hashtags. That means the words on your carousel slides are searchable content.",
        ],
        list: [
          "Say the actual keyword in your caption's first sentence (“Instagram carousel sizes for 2026:” beats “You NEED to see this 🤯”).",
          "Put searchable phrases in your on-image headlines — text on slides is indexed.",
          "Write keyword-rich alt text when you post manually.",
        ],
      },
      {
        heading: "Automate the boring half",
        paragraphs: [
          "Every Prompt2Post carousel ships with a caption and a hashtag set matched to your topic, tone, and niche — following exactly these rules — so the optimization happens without the homework.",
        ],
      },
    ],
    takeaway:
      "Use 3–5 specific hashtags, put real keywords in your caption's first line and on-image text, and treat Instagram like the search engine it has become.",
  },

  // Primary query: "ai instagram content" / "batch instagram content"
  {
    slug: "plan-month-of-instagram-content",
    title: "How to plan a month of Instagram content in one afternoon",
    description:
      "A practical batching workflow for Instagram: pick pillars, generate 12+ carousel ideas, produce them with AI, and schedule the month — in about three hours.",
    datePublished: "2026-07-06",
    readMinutes: 6,
    keywords: [
      "instagram content plan",
      "batch instagram content",
      "ai instagram posts",
      "instagram content calendar",
    ],
    intro: [
      "Posting consistently beats posting brilliantly-but-rarely — the accounts that grow are simply there every time the audience opens the app. The way working creators achieve that isn't daily discipline; it's batching. Here's a realistic afternoon workflow that produces a month of carousels.",
    ],
    sections: [
      {
        heading: "Hour 1: Pillars and ideas",
        paragraphs: [
          "Pick three content pillars — recurring themes your audience expects from you. A fitness coach might choose training mistakes, nutrition simplified, and client stories. Pillars kill the blank page: you're never asking “what do I post?”, only “which pillar is next?”",
          "Then generate ideas per pillar. Aim for 12–16 ideas for a 3-posts-per-week month. If brainstorming stalls, steal from our 45 carousel ideas list or use an idea generator: Prompt2Post's Idea Studio takes one line about your niche and returns six ready-to-generate concepts.",
        ],
      },
      {
        heading: "Hour 2: Produce in a single batch",
        paragraphs: [
          "Production is where batching pays off, because context-switching is the real cost of daily posting. Doing all 12 posts in one sitting keeps you in one mode.",
          "With an AI studio the loop per post is: type the topic, review the generated carousel, fix any slide that misses (rewrite the copy or regenerate the image — not the whole post), approve. A post takes minutes, and the Brand Kit keeps all twelve visually consistent — same palette, fonts, and tone across the month.",
        ],
      },
      {
        heading: "Hour 3: Captions, schedule, done",
        list: [
          "Review captions and hashtags (generated with each post) and personalize the first line — it's the part previews show.",
          "Slot posts into a calendar: consistency of cadence matters more than the specific days you pick.",
          "Export everything — ZIP per post with slides and caption — or schedule directly if your plan supports it.",
          "Leave 2–3 calendar gaps for reactive content: trends, wins, and timely takes keep a batched month from feeling canned.",
        ],
        ordered: true,
      },
      {
        heading: "Why this compounds",
        paragraphs: [
          "A month of consistent carousels does more than fill a grid. Saves and shares accumulate, Instagram's ranking system learns who your content serves, and your best-performing pillar reveals itself in the data — telling you what next month's batch should double down on.",
          "The afternoon workflow turns Instagram from a daily obligation into a monthly production sprint. Most creators who switch never go back.",
        ],
      },
    ],
    takeaway:
      "Three pillars, 12 ideas, one production batch, one scheduling pass. With AI handling structure, copy, and design, a month of content genuinely fits in an afternoon.",
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
