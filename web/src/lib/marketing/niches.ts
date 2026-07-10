/**
 * Data for the programmatic "/for/{niche}" landing pages.
 *
 * Each entry becomes a statically generated page targeting the long-tail
 * query "instagram carousel maker for {audience}". Keep copy unique per
 * niche — thin near-duplicate pages hurt more than they help.
 */

export type Niche = {
  slug: string;
  /** Short audience label used in headings and links, e.g. "fitness coaches". */
  audience: string;
  /** <title> — keep under ~60 chars where possible. */
  title: string;
  /** Meta description — keep under ~155 chars. */
  description: string;
  h1: string;
  intro: string[];
  painPoints: { title: string; text: string }[];
  /** Example topics a user in this niche would type into the generator. */
  topics: string[];
  faq: { question: string; answer: string }[];
};

export const NICHES: Niche[] = [
  {
    slug: "fitness-coaches",
    audience: "fitness coaches",
    title: "AI Instagram Carousel Maker for Fitness Coaches",
    description:
      "Turn workout tips and client wins into polished Instagram carousels in minutes. Prompt2Post writes, designs, and captions fitness content for you — free to start.",
    h1: "Instagram carousels for fitness coaches, without the design homework",
    intro: [
      "Your clients need programming, form checks, and accountability — not you spending Sunday night fighting with a design tool. Prompt2Post turns one line like “5 mistakes killing your squat” into a finished, on-brand carousel: structure, copy, visuals, caption, and hashtags.",
      "Educational carousels are the highest-saving format in fitness. Saves and shares are exactly what the algorithm rewards — and exactly what a carousel of quick, actionable tips earns you.",
    ],
    painPoints: [
      {
        title: "Content ideas dry up fast",
        text: "Idea Studio turns “online coach for busy dads over 40” into six ready-to-generate post ideas — each one click from a finished carousel.",
      },
      {
        title: "Design tools eat your evenings",
        text: "No templates to resize, no fonts to pick. The AI plans the layout, generates the imagery, and composites crisp headline text automatically.",
      },
      {
        title: "Inconsistent posting loses clients",
        text: "Batch a week of carousels in one sitting, export as ZIP with captions ready, and stay visible while you're actually coaching.",
      },
    ],
    topics: [
      "5 mistakes killing your gym progress",
      "Protein myths every beginner believes",
      "The 20-minute workout for busy parents",
      "Why the scale lies about fat loss",
      "Mobility routine for desk workers",
      "How to stay fit while traveling",
    ],
    faq: [
      {
        question: "Can Prompt2Post match my gym's branding?",
        answer:
          "Yes. Save your colors, fonts, tone, and @handle as a Brand Kit and every carousel starts on-brand automatically — including captions written in your voice.",
      },
      {
        question: "What fitness topics work best as carousels?",
        answer:
          "Myth-busting, common mistakes, quick routines, and nutrition tips perform best — they're save-worthy, which is the strongest signal for Instagram reach.",
      },
      {
        question: "Do I need any design experience?",
        answer:
          "None. You type a topic; Prompt2Post plans the slides, writes the copy, generates the images, and composites the text. You can still edit any slide afterwards.",
      },
    ],
  },
  {
    slug: "real-estate-agents",
    audience: "real estate agents",
    title: "AI Instagram Carousel Maker for Real Estate Agents",
    description:
      "Create listing highlights, buyer tips, and market updates as scroll-stopping Instagram carousels. AI writes and designs them for you — start free.",
    h1: "Win listings with carousels, not just yard signs",
    intro: [
      "Buyers scroll Instagram before they ever call an agent. A steady stream of local-expert content — market updates, buyer checklists, neighborhood guides — is how you become the agent they already trust.",
      "Prompt2Post turns “what first-time buyers get wrong about mortgages” into a polished carousel with professional visuals, clear copy, a caption, and hashtags — in the time it takes to pour a coffee.",
    ],
    painPoints: [
      {
        title: "No time between showings",
        text: "One topic in, a finished carousel out. Batch your week's content between appointments instead of losing an evening to a design app.",
      },
      {
        title: "Hard to look premium",
        text: "AI-generated photography-grade visuals with pixel-perfect typography make every post look like your brokerage has an in-house designer.",
      },
      {
        title: "Running out of post ideas",
        text: "Idea Studio generates six locally-relevant content ideas from a single line about your market and audience.",
      },
    ],
    topics: [
      "7 questions to ask before buying your first home",
      "Staging tricks that add $20k to your sale",
      "Renting vs buying in 2026: the honest math",
      "Red flags to spot at an open house",
      "How interest rates actually affect your budget",
      "The closing process, explained in 8 slides",
    ],
    faq: [
      {
        question: "Can I use my brokerage's colors and fonts?",
        answer:
          "Yes — save them once as a Brand Kit and every carousel is generated on-brand, with your @handle as a watermark on paid plans.",
      },
      {
        question: "What real estate content performs best on Instagram?",
        answer:
          "Educational carousels — buyer checklists, process explainers, market myth-busting — consistently outperform listing photos alone, because followers save and share them.",
      },
      {
        question: "Can I create posts in other languages?",
        answer:
          "Yes, Prompt2Post writes posts in 13 languages — useful for serving multilingual markets from the same workflow.",
      },
    ],
  },
  {
    slug: "travel-creators",
    audience: "travel creators",
    title: "AI Instagram Carousel Maker for Travel Creators",
    description:
      "Turn itineraries, hidden gems, and travel hacks into stunning Instagram carousels. AI plans, writes, and designs each slide — free to start.",
    h1: "Turn every trip into a week of carousel content",
    intro: [
      "Travel carousels — “10 hidden gems in Lisbon”, “how I flew business for economy prices” — are save magnets. People bookmark them for future trips, and saves are the strongest reach signal on Instagram.",
      "Prompt2Post plans the slide structure, writes fact-rich copy for each stop or tip, and generates gorgeous imagery to match — so your posting schedule survives even when you're mid-adventure with hotel Wi-Fi.",
    ],
    painPoints: [
      {
        title: "Editing on the road is painful",
        text: "Skip the laptop-in-a-hostel design session. Type the topic, get a finished carousel, export a ZIP with the caption ready to paste.",
      },
      {
        title: "Guides take hours to lay out",
        text: "The AI structures itineraries and listicles slide-by-slide automatically — cover hook, one gem per slide, CTA at the end.",
      },
      {
        title: "Growth stalls between trips",
        text: "Idea Studio brainstorms evergreen angles from past trips — budget hacks, packing lists, mistakes to avoid — so the content never stops.",
      },
    ],
    topics: [
      "Hidden gems in Lisbon locals actually go to",
      "How to travel Japan on $60 a day",
      "Carry-on packing list that never fails",
      "10 travel scams and how to dodge them",
      "The perfect 3-day Rome itinerary",
      "Flight booking tricks airlines hate",
    ],
    faq: [
      {
        question: "Can the AI write destination guides accurately?",
        answer:
          "Prompt2Post writes fact-rich copy from a two-stage engine that plans the structure before writing. You can edit any slide in Slide Studio before exporting.",
      },
      {
        question: "What carousel format works best for travel content?",
        answer:
          "Portrait (4:5) maximizes screen space in the feed and is auto-selected when it fits your topic; you can also pick square, story, or wide.",
      },
      {
        question: "Can I repurpose a carousel for other platforms?",
        answer:
          "One click turns a carousel into an X post, a LinkedIn post, and a Story hook — plus a PDF for LinkedIn document posts.",
      },
    ],
  },
  {
    slug: "food-bloggers",
    audience: "food bloggers",
    title: "AI Instagram Carousel Maker for Food Bloggers",
    description:
      "Turn recipes, kitchen hacks, and food guides into mouth-watering Instagram carousels. AI writes and designs every slide — start free today.",
    h1: "Recipe carousels people actually save and cook",
    intro: [
      "A recipe carousel is the perfect save: ingredients on one slide, steps on the next, tips at the end. Prompt2Post structures it automatically — you type “3-ingredient protein breakfast” and get a finished, appetizing carousel with captions and hashtags.",
      "The AI generates rich food photography-style visuals and composites clean, readable text on top, so every recipe looks like it came out of a professional test kitchen.",
    ],
    painPoints: [
      {
        title: "Photographing every step is exhausting",
        text: "AI-generated visuals mean you can publish a polished recipe post even for dishes you haven't shot yet.",
      },
      {
        title: "Recipes are hard to fit on slides",
        text: "The planning stage splits ingredients, steps, and tips across slides with the right hierarchy — no cramming, no tiny text.",
      },
      {
        title: "Feed consistency takes discipline",
        text: "Batch a week of food content in one session, keep it on-palette with your Brand Kit, and export everything with captions included.",
      },
    ],
    topics: [
      "3-ingredient protein breakfast ideas",
      "Meal prep Sunday: 5 lunches in 1 hour",
      "Air fryer mistakes ruining your food",
      "The only pasta sauce formula you need",
      "Budget dinners under $3 a serving",
      "Baking substitutions that actually work",
    ],
    faq: [
      {
        question: "Can I edit the recipe copy the AI writes?",
        answer:
          "Yes — Slide Studio lets you rewrite any slide with AI or edit the text yourself, and regenerate a single image, without spending another post credit.",
      },
      {
        question: "Will the posts match my blog's branding?",
        answer:
          "Save your colors, fonts, and tone as a Brand Kit once, and every carousel — captions included — is generated in your visual identity.",
      },
      {
        question: "What food content grows fastest on Instagram?",
        answer:
          "Quick recipes, ingredient swaps, and “mistakes” posts earn the most saves — and saves are the top signal Instagram uses to widen your reach.",
      },
    ],
  },
  {
    slug: "finance-creators",
    audience: "finance creators",
    title: "AI Instagram Carousel Maker for Finance Creators",
    description:
      "Turn money tips, investing explainers, and budgeting frameworks into crisp Instagram carousels. AI writes and designs them — start free.",
    h1: "Make money topics simple, visual, and shareable",
    intro: [
      "Personal finance is one of Instagram's biggest education niches — and carousels are its native format. “How to save your first $10k” works because each slide delivers one clear idea in order.",
      "Prompt2Post's two-stage engine plans the framework first — hook, steps, recap, CTA — then writes precise, fact-rich copy for each slide. Clean visuals and sharp typography make dense topics feel effortless.",
    ],
    painPoints: [
      {
        title: "Complex topics overwhelm followers",
        text: "The AI breaks explainers into one-idea-per-slide structures that people actually finish — and finishing rate is what the algorithm measures.",
      },
      {
        title: "Design undermines credibility",
        text: "Pixel-perfect vector typography and a consistent palette make your page look institutional-grade, not homemade.",
      },
      {
        title: "Daily posting burns you out",
        text: "Generate a week of carousels in an evening. Idea Studio keeps the pipeline full with fresh angles for your niche.",
      },
    ],
    topics: [
      "How to save your first $10k",
      "Index funds explained in 8 slides",
      "The 50/30/20 budget, fixed for 2026",
      "5 money habits keeping you broke",
      "Credit score myths, busted",
      "Compound interest: the visual guide",
    ],
    faq: [
      {
        question: "Can I review the copy before publishing?",
        answer:
          "Always — you get the full carousel to review, and Slide Studio lets you rewrite or hand-edit any slide before you export.",
      },
      {
        question: "Does it write captions and hashtags too?",
        answer:
          "Yes, every post ships with a ready-to-paste caption and hashtag set matched to your topic and tone.",
      },
      {
        question: "Can I keep a consistent look across all my posts?",
        answer:
          "That's what the Brand Kit is for — your colors, fonts, tone, and language applied to every new post automatically.",
      },
    ],
  },
  {
    slug: "coaches-consultants",
    audience: "coaches & consultants",
    title: "AI Instagram Carousel Maker for Coaches & Consultants",
    description:
      "Turn your expertise into client-winning Instagram carousels. AI plans, writes, and designs authority content for coaches and consultants — start free.",
    h1: "Turn expertise into authority content that books calls",
    intro: [
      "Your next client is scrolling Instagram deciding who sounds credible. Carousels that teach — frameworks, mistakes, before/afters — are the fastest way to look like the obvious choice.",
      "Prompt2Post takes “why your morning routine fails by Thursday” and produces a structured, on-brand carousel with confident copy and a caption that invites the DM. You stay in your zone of genius; it handles the production.",
    ],
    painPoints: [
      {
        title: "Marketing time steals client time",
        text: "A finished carousel in minutes, not an afternoon. Batch a month of authority content in a single planning session.",
      },
      {
        title: "Your content looks like everyone's",
        text: "A Brand Kit keeps every post in your tone, colors, and fonts — recognizably yours in the feed before anyone reads a word.",
      },
      {
        title: "Blank-page syndrome",
        text: "Describe your niche once and Idea Studio returns six post ideas engineered around what your audience is trying to solve.",
      },
    ],
    topics: [
      "The 4-question framework I use with every client",
      "Why most goal-setting fails by February",
      "5 signs you're undercharging",
      "How to say no without losing the client",
      "Morning routines that actually survive Thursday",
      "The onboarding email sequence that reduces churn",
    ],
    faq: [
      {
        question: "Will the AI capture my coaching methodology?",
        answer:
          "You control the topic and can rewrite any slide with AI or by hand, so frameworks come out the way you teach them — the AI handles structure and polish.",
      },
      {
        question: "Can I repurpose carousels for LinkedIn?",
        answer:
          "Yes — one click produces a LinkedIn post and a PDF sized for LinkedIn document posts, plus an X thread and Story hook.",
      },
      {
        question: "How is this different from hiring a VA or designer?",
        answer:
          "It's faster and drastically cheaper: plans start free, and even the Pro plan costs less than a single hour of design work.",
      },
    ],
  },
  {
    slug: "ecommerce-brands",
    audience: "e-commerce brands",
    title: "AI Instagram Carousel Maker for E-commerce Brands",
    description:
      "Create product education, launch teasers, and social proof carousels with AI. On-brand Instagram content for your store in minutes — start free.",
    h1: "Product content that sells without shouting",
    intro: [
      "Feeds full of “BUY NOW” get scrolled past. Carousels that educate — how to use it, how to choose, what makes it different — earn saves, shares, and carts. That's the content Prompt2Post produces from a single line.",
      "Lock your brand palette and tone in a Brand Kit and every post — from launch teaser to care guide — comes out looking like your brand book, captions and hashtags included.",
    ],
    painPoints: [
      {
        title: "Agencies are slow and expensive",
        text: "Generate launch, education, and social-proof content in-house in minutes, at a fraction of a single agency deliverable's cost.",
      },
      {
        title: "Content calendar gaps",
        text: "Batch a month of posts in an afternoon. Idea Studio suggests angles for every product and season so the calendar never runs dry.",
      },
      {
        title: "Inconsistent brand look",
        text: "Brand Kit enforcement means every carousel uses your colors, fonts, and voice — whoever on the team generates it.",
      },
    ],
    topics: [
      "5 ways to style one white shirt",
      "How to choose your first mechanical keyboard",
      "The skincare order everyone gets wrong",
      "What makes ceramic-coated pans different",
      "Gift guide: under $50 finds they'll actually use",
      "Behind the scenes: how our candles are poured",
    ],
    faq: [
      {
        question: "Can multiple team members use one brand identity?",
        answer:
          "Yes — the Brand Kit stores your colors, fonts, tone, and language so every generated post is consistent regardless of who creates it.",
      },
      {
        question: "What e-commerce content works best as carousels?",
        answer:
          "Education outperforms promotion: how-to-choose guides, styling ideas, and myth-busting earn saves and shares that pure product shots rarely do.",
      },
      {
        question: "Can I export content for other channels?",
        answer:
          "Every carousel exports as ZIP or PDF, and Repurpose converts it into X posts, LinkedIn posts, and Story hooks in one click.",
      },
    ],
  },
  {
    slug: "photographers",
    audience: "photographers",
    title: "AI Instagram Carousel Maker for Photographers",
    description:
      "Turn photography tips, pricing guides, and behind-the-scenes stories into polished Instagram carousels. AI writes and designs them — start free.",
    h1: "Teach the craft, book the clients",
    intro: [
      "Your photos prove you can shoot — but educational carousels prove you're the expert worth hiring. Posing guides, “what to wear” checklists, and gear explainers reach clients your portfolio alone never touches.",
      "Prompt2Post writes and designs those posts for you. Type “what to wear for your engagement shoot” and get a clean, elegant carousel that matches your studio's aesthetic — with a caption that books the inquiry.",
    ],
    painPoints: [
      {
        title: "Editing leaves no time for marketing",
        text: "A finished educational carousel in minutes — batch a month of them between shoots and stay top-of-mind all season.",
      },
      {
        title: "Text design isn't your medium",
        text: "The AI composites crisp vector typography over rich visuals, so your tip posts look as considered as your portfolio.",
      },
      {
        title: "Clients don't know what they need",
        text: "Educational posts — sessions explained, prep checklists, pricing transparency — pre-answer objections and warm up inquiries.",
      },
    ],
    topics: [
      "What to wear for your engagement shoot",
      "5 poses that flatter absolutely everyone",
      "Golden hour: why photographers obsess over it",
      "How to prep your kids for family photos",
      "Phone vs professional: what you're really paying for",
      "The wedding photo checklist couples forget",
    ],
    faq: [
      {
        question: "Can the carousels match my editing style and palette?",
        answer:
          "Save your palette, fonts, and tone as a Brand Kit — every carousel comes out matching the aesthetic your portfolio sets.",
      },
      {
        question: "Should photographers post carousels or just photos?",
        answer:
          "Both — portfolio posts show the work, but educational carousels get saved and shared, which is how new clients who've never heard of you find your page.",
      },
      {
        question: "Can I use my own images in posts?",
        answer:
          "The generator creates AI visuals with your text composited on top; you can regenerate any slide's image until the look fits your feed.",
      },
    ],
  },
  {
    slug: "marketing-agencies",
    audience: "marketing agencies",
    title: "AI Instagram Carousel Maker for Marketing Agencies",
    description:
      "Produce on-brand Instagram carousels for every client in minutes. AI planning, copywriting, and design that scales your content team — start free.",
    h1: "Ship client content 10x faster, on-brand every time",
    intro: [
      "Carousel production is the bottleneck of every social retainer: ideation, copy, design, revisions — hours per post, multiplied by every client. Prompt2Post collapses that pipeline into a text box.",
      "The two-stage engine plans structure before writing, generates photoreal visuals, and composites clean typography — deliverable-grade output your account managers can produce without a designer in the loop.",
    ],
    painPoints: [
      {
        title: "Junior output needs senior polish",
        text: "The AI's planning stage handles hierarchy, pacing, and hooks — so first drafts land at the quality your seniors usually have to inject.",
      },
      {
        title: "Every client has a different voice",
        text: "Brand Kits store each identity — tone, colors, fonts, language — so switching clients is one click, not a style-guide re-read.",
      },
      {
        title: "Scope creep on revisions",
        text: "Slide Studio regenerates a single slide's copy or image in seconds, without redoing the post or burning another credit.",
      },
    ],
    topics: [
      "Why organic reach isn't dead (your format is)",
      "5 signs it's time to rebrand",
      "What a good marketing report actually shows",
      "SEO vs paid ads: where the first $1k goes",
      "The psychology of color in branding",
      "Email list vs social following: which to build first",
    ],
    faq: [
      {
        question: "Can we manage multiple client brands?",
        answer:
          "Brand Kits store tone, colors, fonts, and language per identity, so your team generates on-brand content for any client in one click.",
      },
      {
        question: "How does pricing work for agency volume?",
        answer:
          "The Creator plan includes unlimited posts with priority parallel generation — flat monthly cost regardless of how many carousels you ship.",
      },
      {
        question: "Can clients review posts before they go live?",
        answer:
          "Every post has a shareable link — send it to the client for review, and edit any slide based on feedback without regenerating the whole post.",
      },
    ],
  },
  {
    slug: "beauty-creators",
    audience: "beauty & skincare creators",
    title: "AI Instagram Carousel Maker for Beauty & Skincare Creators",
    description:
      "Turn routines, ingredient explainers, and myth-busting into gorgeous Instagram carousels. AI writes and designs beauty content — start free.",
    h1: "Beauty content as polished as the products",
    intro: [
      "Skincare and beauty audiences live in carousels: routine orders, ingredient breakdowns, dupes, myths. They're the posts that get saved to “Skincare” folders and shared to group chats — the exact engagement Instagram rewards.",
      "Prompt2Post turns “skincare myths, busted” into an elegant, editorial-grade carousel — soft visuals, clean type, a caption in your voice, and hashtags tuned to the niche.",
    ],
    painPoints: [
      {
        title: "Trends move faster than production",
        text: "React to a trending ingredient the same day: type the topic and export a finished carousel in minutes, not after a weekend of design.",
      },
      {
        title: "Aesthetic consistency is everything",
        text: "Your Brand Kit locks the palette, fonts, and tone so the feed stays cohesive post after post — the thing beauty followers notice first.",
      },
      {
        title: "Explaining ingredients is hard",
        text: "The AI's planning stage breaks INCI-jargon into one-idea-per-slide explainers your audience actually finishes and saves.",
      },
    ],
    topics: [
      "Skincare myths dermatologists want gone",
      "The correct order to apply your routine",
      "Retinol for beginners: the gentle start",
      "Drugstore dupes that beat the luxury original",
      "Why your sunscreen isn't working",
      "5 makeup mistakes adding years to your look",
    ],
    faq: [
      {
        question: "Can I keep my signature feed aesthetic?",
        answer:
          "Yes — the Brand Kit stores your palette, fonts, and tone, and every generated carousel follows it, keeping the grid cohesive.",
      },
      {
        question: "What beauty content gets the most engagement?",
        answer:
          "Routine orders, ingredient explainers, and myth-busting earn the most saves — they're reference content people return to, which compounds reach.",
      },
      {
        question: "Can I fix one slide without redoing the post?",
        answer:
          "Slide Studio rewrites copy or regenerates a single image per slide, free of extra credits, so small tweaks stay small.",
      },
    ],
  },
];

export function getNiche(slug: string): Niche | undefined {
  return NICHES.find((n) => n.slug === slug);
}
