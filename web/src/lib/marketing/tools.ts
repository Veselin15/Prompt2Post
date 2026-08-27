/**
 * Keyword landing pages ("tool pages").
 *
 * The homepage sells the brand; these pages answer a specific search query.
 * Someone typing "instagram carousel ai creator" into Google is looking for a
 * tool, not a company — so each page leads with the exact phrase in the H1,
 * explains the tool in that searcher's language, and links straight into /try.
 *
 * They live at the site root (/ai-instagram-carousel-generator) rather than
 * under /tools/*, because the shorter URL matches the query more closely and
 * accumulates link equity directly on the domain.
 *
 * Every field here is real product behaviour. Nothing on these pages describes
 * a capability the app doesn't have — thin or overstated keyword pages are
 * what Google's spam policies target, and they also convert badly.
 */

export type ToolStep = { title: string; text: string };
export type ToolPoint = { title: string; text: string };

export type ToolPage = {
  slug: string;
  /** <title> — keep the primary keyword at the front. */
  title: string;
  description: string;
  /** Visible H1. Contains the primary keyword verbatim. */
  h1: string;
  /** Short line under the H1. */
  tagline: string;
  /** Two or three paragraphs of genuinely useful intro copy. */
  intro: string[];
  /** Phrases people use for the same thing — rendered as a visible chip row. */
  alsoKnownAs: string[];
  /** Rendered as a numbered list and emitted as HowTo structured data. */
  steps: ToolStep[];
  /** What makes this tool different from the generic alternative. */
  points: ToolPoint[];
  /** "Who it's for" bullets. */
  audience: string[];
  faq: { question: string; answer: string }[];
};

export const TOOLS: ToolPage[] = [
  {
    slug: "ai-instagram-carousel-generator",
    title: "AI Instagram Carousel Generator — free, no design skills",
    description:
      "Free AI Instagram carousel generator: type one topic and get a finished multi-slide carousel with written copy, AI images, caption and hashtags in about a minute. No design skills, no sign-up to try.",
    h1: "AI Instagram carousel generator",
    tagline:
      "Type one topic. Get a finished, on-brand carousel — copy, images, caption and hashtags — in about a minute.",
    intro: [
      "Prompt2Post is an AI Instagram carousel generator: you give it a topic in plain English, and it produces a complete multi-slide carousel — the hook slide, the body slides, the call to action, the artwork behind every slide, and the caption and hashtags that go with the post.",
      "Most AI tools write everything in one pass, which is why their carousels read like a listicle stretched across ten squares. Prompt2Post works in two stages. First it develops a creative brief — the angle, the tone, the slide count, the colour palette, the narrative arc from hook to payoff. Only then does it write the copy, slide by slide, against that plan.",
      "The artwork is generated the same way a designer would brief it: each image is composed for the words that will sit on top of it. The headline itself is never drawn by the image model — it's composited as real vector type, which is why the letters are sharp instead of melted.",
    ],
    alsoKnownAs: [
      "Instagram carousel AI creator",
      "AI carousel generator",
      "Instagram carousel generator AI",
      "AI post generator for Instagram",
      "carousel creator AI",
    ],
    steps: [
      {
        title: "Type your topic",
        text: "One line is enough — \"5 mistakes killing your gym progress\" or \"how compound interest actually works\". If you're out of ideas, Idea Studio generates six for your niche.",
      },
      {
        title: "The AI plans the carousel",
        text: "It picks the format, slide count, tone and palette, and lays out a narrative arc: a hook that stops the scroll, body slides that pay it off, and a closing call to action.",
      },
      {
        title: "Copy and images are generated",
        text: "Fact-rich copy is written for every slide, FLUX paints a background matched to each slide's message, and your headline is composited on top as crisp vector type.",
      },
      {
        title: "Refine, then export",
        text: "Rewrite any slide with AI, edit the words yourself, or regenerate a single image — none of it costs another post credit. Then download the carousel as a ZIP or PDF with the caption and hashtags.",
      },
    ],
    points: [
      {
        title: "It writes like an art director, not a chatbot",
        text: "The two-stage engine plans before it writes, so slide 4 knows what slide 1 promised. That's the difference between a carousel people finish and one they swipe past.",
      },
      {
        title: "Text stays sharp",
        text: "Headlines are vector type composited over the artwork, not pixels hallucinated by an image model. Export at full resolution and every letter is still clean.",
      },
      {
        title: "On-brand by default",
        text: "Save your tone, colours, fonts and language once as a Brand Kit, and every carousel you generate afterwards starts on-brand — captions and hashtags included.",
      },
      {
        title: "Thirteen languages",
        text: "Generate the same carousel for a different audience without rewriting it yourself. Copy, caption and hashtags all follow the language you pick.",
      },
    ],
    audience: [
      "Creators who post carousels but lose hours in Canva",
      "Coaches and consultants turning expertise into saveable posts",
      "Small brands with no in-house designer",
      "Agencies batching client content a week at a time",
    ],
    faq: [
      {
        question: "Is this AI Instagram carousel generator free?",
        answer:
          "Yes. You can generate a real carousel on the /try page with no account and no card. A free account adds 3 posts every month, and paid plans start at €9/month when you need more.",
      },
      {
        question: "How long does it take to generate a carousel?",
        answer:
          "About a minute from topic to finished carousel, including the AI-generated artwork for every slide.",
      },
      {
        question: "Can I edit what the AI generates?",
        answer:
          "Yes. Slide Studio lets you rewrite any slide with AI, edit the copy by hand, or regenerate a single image — none of which spends another post credit.",
      },
      {
        question: "Do I own the carousels I create?",
        answer:
          "Yes. The carousels you generate are yours to post, on Instagram or anywhere else.",
      },
      {
        question: "Can it match my brand colours and fonts?",
        answer:
          "Yes. A Brand Kit stores your tone, colours, fonts and language, and every new carousel starts from it automatically.",
      },
    ],
  },
  {
    slug: "instagram-carousel-maker",
    title: "Instagram Carousel Maker — AI writes and designs it for you",
    description:
      "An Instagram carousel maker that writes the copy too. Type a topic and get every slide designed, captioned and hashtagged — no templates to fill in, no Canva, no design skills.",
    h1: "Instagram carousel maker",
    tagline:
      "Every other carousel maker hands you a blank template. This one hands you a finished post.",
    intro: [
      "A normal Instagram carousel maker gives you a template and a blank text box. You still have to decide the angle, write the hook, find the images, size everything correctly, and write the caption. The design tool solved the easiest part of the job.",
      "Prompt2Post starts a step earlier. You type the topic; it decides the structure, writes the words for each slide, generates the artwork, sets the type, and writes the caption and hashtags. What you get back isn't a template — it's a finished carousel you can post or refine.",
      "Slide dimensions are handled for you. Square, portrait, story or wide: the AI picks the aspect ratio that suits the topic, and exports at full Instagram resolution so nothing gets cropped or softened on upload.",
    ],
    alsoKnownAs: [
      "carousel maker for Instagram",
      "Instagram carousel creator",
      "AI carousel maker",
      "carousel post maker",
      "Instagram slide maker",
    ],
    steps: [
      {
        title: "Describe the post",
        text: "One sentence about what you want the carousel to say. You can also steer the audience, the goal, and whether you want emoji.",
      },
      {
        title: "Pick a look — or don't",
        text: "Choose a palette and format, or leave it on auto and let the AI art-direct it based on the topic.",
      },
      {
        title: "Let it build every slide",
        text: "Copy, artwork and typography are produced for each slide together, so the words and the image were designed for each other.",
      },
      {
        title: "Download and post",
        text: "Export a ZIP of full-resolution slides, or a PDF for LinkedIn document posts. Caption and hashtags come with it.",
      },
    ],
    points: [
      {
        title: "No blank canvas",
        text: "You never start from an empty template. The first thing you see is a complete draft, which is a much easier thing to improve than nothing.",
      },
      {
        title: "Correct dimensions, automatically",
        text: "1080×1350 portrait, 1080×1080 square, 1080×1920 story or wide — chosen for the topic and exported at full resolution.",
      },
      {
        title: "Caption and hashtags included",
        text: "The caption is written to match the carousel, not bolted on afterwards, and the hashtags are picked for the actual subject.",
      },
      {
        title: "Repurpose in one click",
        text: "Turn the same carousel into an X post, a LinkedIn post and a Story hook without rewriting any of it.",
      },
    ],
    audience: [
      "Anyone who finds Canva slow for repeat posts",
      "Creators posting several carousels a week",
      "Teams who need consistent output without a designer",
      "People who can write but can't design (and vice versa)",
    ],
    faq: [
      {
        question: "Do I need design skills to use this carousel maker?",
        answer:
          "No. There is no canvas to lay out and no template to fill in — you describe the post in a sentence and the AI produces the design.",
      },
      {
        question: "What size are the slides?",
        answer:
          "Full Instagram resolution in whichever format fits: 1080×1350 portrait, 1080×1080 square, 1080×1920 story, or wide. The AI picks unless you choose one yourself.",
      },
      {
        question: "Can I download the slides?",
        answer:
          "Yes — as a ZIP of individual images, or as a PDF, with the caption and hashtags alongside.",
      },
      {
        question: "How is this different from Canva?",
        answer:
          "Canva is a design tool: it gives you a template and you supply the idea, the words and the images. Prompt2Post supplies all three and gives you a finished carousel to edit.",
      },
    ],
  },
  {
    slug: "free-instagram-carousel-generator",
    title: "Free Instagram Carousel Generator — no sign-up needed",
    description:
      "Generate a real Instagram carousel free, with no account and no credit card. Type a topic, get written slides with AI artwork, a caption and hashtags in about a minute.",
    h1: "Free Instagram carousel generator",
    tagline:
      "Generate a real carousel right now — no account, no credit card, no watermark on the slides themselves.",
    intro: [
      "Most \"free\" carousel tools mean a trial that ends at the export button. This one doesn't: on the /try page you can generate a genuine, complete carousel without creating an account or entering a card, and see the actual output quality before deciding anything.",
      "A free account then gives you 3 posts every month, permanently. Free-plan carousels are up to 3 slides and close with a small branded Prompt2Post outro slide; the slides you wrote and designed are untouched, with no watermark stamped across the artwork.",
      "If you outgrow it, Pro is €9/month for 100 posts, up to 10 slides, all four formats, your own accent colour and handle, and no Prompt2Post slide. But the free tier is a real tier, not a countdown.",
    ],
    alsoKnownAs: [
      "free AI carousel generator",
      "free Instagram carousel maker",
      "carousel generator no sign-up",
      "free Instagram post generator",
    ],
    steps: [
      {
        title: "Open the free generator",
        text: "Go to the try page. There's no account step and nothing to install.",
      },
      {
        title: "Type any topic",
        text: "Whatever you'd actually want to post about this week. One line is enough.",
      },
      {
        title: "Watch it build the carousel",
        text: "It plans the structure, writes each slide, generates the artwork and composites the headlines — about a minute end to end.",
      },
      {
        title: "Keep going free",
        text: "Create a free account for 3 posts a month, Slide Studio edits, Idea Studio, captions and hashtags.",
      },
    ],
    points: [
      {
        title: "Free means free",
        text: "3 posts every month on the free plan, renewing monthly. No trial timer and no card on file.",
      },
      {
        title: "No watermark across your slides",
        text: "Free carousels end with a small branded outro slide. Your own slides stay clean.",
      },
      {
        title: "Editing is free too",
        text: "Rewriting a slide, regenerating an image or fixing the copy never costs a post credit — on any plan, including free.",
      },
      {
        title: "Real exports",
        text: "Download what you generate. HD images, caption and hashtags included on the free plan.",
      },
    ],
    audience: [
      "People testing whether AI carousels are good enough yet",
      "Creators posting a few times a month",
      "Students and side projects with no budget",
      "Anyone who wants to see output before signing up",
    ],
    faq: [
      {
        question: "Is it really free with no credit card?",
        answer:
          "Yes. The try page generates a real carousel with no account and no card. A free account adds 3 posts every month, also with no card.",
      },
      {
        question: "What's the catch on the free plan?",
        answer:
          "Free carousels are up to 3 slides and end with a small branded Prompt2Post outro slide. Your own slides carry no watermark.",
      },
      {
        question: "How many free posts do I get?",
        answer:
          "Three every month, and the allowance renews monthly rather than running out once.",
      },
      {
        question: "Do free carousels include captions and hashtags?",
        answer: "Yes — captions and hashtags are part of the free plan.",
      },
    ],
  },
  {
    slug: "ai-instagram-post-generator",
    title: "AI Instagram Post Generator — copy, images and captions",
    description:
      "An AI Instagram post generator that produces the whole post: written slides, generated artwork, a caption and hashtags. One topic in, a ready-to-publish post out.",
    h1: "AI Instagram post generator",
    tagline:
      "The whole post, not just a caption — slides, artwork, caption and hashtags from one line of input.",
    intro: [
      "Most AI Instagram post generators write you a caption. That's the fastest part of posting. The slow parts are deciding what the post should say, designing the visuals, and making the whole thing look like it came from the same account as last week.",
      "Prompt2Post generates the complete post. It plans the angle, writes the slide copy, generates the artwork, sets the typography, and writes the caption and hashtags to match what the slides actually say.",
      "Because your tone, colours, fonts and language live in a Brand Kit, the tenth post looks like it belongs beside the first — which is the part that actually compounds on Instagram.",
    ],
    alsoKnownAs: [
      "Instagram post generator AI",
      "AI social media post generator",
      "AI Instagram content generator",
      "Instagram content creator AI",
    ],
    steps: [
      {
        title: "Give it a topic or an idea",
        text: "Type one yourself, or let Idea Studio propose six ideas built around your niche.",
      },
      {
        title: "Set the audience and goal",
        text: "Who it's for and what you want it to do — save, follow, click. The copy is steered by both.",
      },
      {
        title: "Generate the post",
        text: "Slides, artwork, typography, caption and hashtags are produced together as one coherent post.",
      },
      {
        title: "Publish or schedule",
        text: "Export a ZIP or PDF today. Direct Instagram publishing and scheduling are on the way.",
      },
    ],
    points: [
      {
        title: "Copy that's steered, not generic",
        text: "Audience, goal and emoji preference are threaded through the whole generation, so the output isn't the same beige paragraph everyone else's tool produces.",
      },
      {
        title: "Captions written for the post",
        text: "The caption is generated after the slides exist, so it references what the carousel actually says.",
      },
      {
        title: "Hashtags that fit the subject",
        text: "Picked for the topic rather than pasted from a generic block of thirty.",
      },
      {
        title: "One idea, many platforms",
        text: "Repurpose the finished post into an X thread starter, a LinkedIn post, or a Story hook in a click.",
      },
    ],
    audience: [
      "Creators who want the whole post, not fragments",
      "Founders posting for their own brand",
      "Social media managers running several accounts",
      "Anyone whose posting habit dies at the design step",
    ],
    faq: [
      {
        question: "Does it generate images as well as text?",
        answer:
          "Yes. Every slide gets AI-generated artwork composed for the words that sit on it, plus vector-sharp headline typography.",
      },
      {
        question: "Can it post to Instagram for me?",
        answer:
          "Not yet. You can export a ZIP or PDF with the caption and hashtags today; direct publishing and scheduling are in development.",
      },
      {
        question: "Will every post look the same?",
        answer:
          "No. The AI develops a fresh creative brief per topic — format, palette, slide count and tone vary — while your Brand Kit keeps the identity consistent.",
      },
      {
        question: "What languages does it write in?",
        answer:
          "Thirteen, covering the slide copy, the caption and the hashtags.",
      },
    ],
  },
  {
    slug: "ai-instagram-caption-generator",
    title: "AI Instagram Caption Generator — captions and hashtags",
    description:
      "An AI Instagram caption generator that writes the caption and the hashtags to match your actual post — and can generate the carousel it belongs to at the same time.",
    h1: "AI Instagram caption generator",
    tagline:
      "Captions written for the post you're actually publishing — hashtags included.",
    intro: [
      "Caption generators usually work blind. You give them a topic, they give you a paragraph, and it doesn't quite match the images you're about to post because it never saw them.",
      "In Prompt2Post the caption is written after the slides exist, against the same creative brief. It opens with a line that earns the tap on \"more\", carries the argument the carousel makes, and closes with a call to action that matches the goal you set.",
      "Hashtags are chosen for the subject rather than pasted from a saved block of thirty — and both the caption and the hashtags follow your Brand Kit's tone and language.",
    ],
    alsoKnownAs: [
      "Instagram caption writer AI",
      "AI caption generator",
      "hashtag generator AI",
      "caption and hashtag generator",
    ],
    steps: [
      {
        title: "Generate or open a post",
        text: "Create a carousel from a topic, or open one you've already made.",
      },
      {
        title: "Set tone and goal",
        text: "Your Brand Kit supplies the voice; the goal you pick decides how the caption closes.",
      },
      {
        title: "Get the caption and hashtags",
        text: "Written against the finished slides, in any of 13 languages.",
      },
      {
        title: "Remix until it fits",
        text: "Not quite right? Regenerate the caption without touching the slides or spending a post credit.",
      },
    ],
    points: [
      {
        title: "Written from the actual post",
        text: "The caption knows what the slides say, so it complements them instead of repeating them.",
      },
      {
        title: "A first line that earns the tap",
        text: "Instagram truncates captions. The opening line is written to survive that cut.",
      },
      {
        title: "Relevant hashtags",
        text: "Chosen for the topic and niche, not a generic block reused on every post.",
      },
      {
        title: "Your voice, kept",
        text: "Brand Kit tone and language apply to captions the same way they apply to slides.",
      },
    ],
    audience: [
      "Creators who freeze at the caption box",
      "Anyone posting in a second language",
      "Accounts that need a consistent voice across many posts",
      "Managers writing captions for other people's brands",
    ],
    faq: [
      {
        question: "Can I generate just a caption?",
        answer:
          "Captions are generated with the post, and can be regenerated on their own at any time without spending a post credit.",
      },
      {
        question: "How many hashtags does it use?",
        answer:
          "A focused set matched to the topic rather than a block of thirty — which is what actually performs in 2026.",
      },
      {
        question: "Can captions be written in another language?",
        answer:
          "Yes, in any of the 13 supported languages, matching the language of the slides.",
      },
    ],
  },
  {
    slug: "instagram-carousel-templates",
    title: "Instagram Carousel Templates — generated, not filled in",
    description:
      "Instead of Instagram carousel templates you fill in by hand, generate the layout, copy and artwork for your exact topic — then edit any slide.",
    h1: "Instagram carousel templates, generated for your topic",
    tagline:
      "A template is a shape you still have to fill. This gives you the shape and the contents.",
    intro: [
      "Carousel templates solve the layout problem and leave you the hard ones: what the hook should say, what the middle slides argue, which images fit, and how to keep it looking like your account. And because everyone downloads the same packs, template-built carousels start to look identical.",
      "Prompt2Post generates the layout for your specific topic instead. Slide count, format, palette and typographic hierarchy are chosen per post, and the copy and artwork are produced to fit that structure.",
      "You still get the control a template gives you: change the palette, force a format, rewrite a slide, or regenerate one image. You just don't start from an empty rectangle.",
    ],
    alsoKnownAs: [
      "carousel templates for Instagram",
      "Instagram slide templates",
      "carousel layout generator",
      "Instagram post templates AI",
    ],
    steps: [
      {
        title: "Say what the post is about",
        text: "The topic decides the structure, not the other way around.",
      },
      {
        title: "The layout is generated",
        text: "Slide count, aspect ratio, palette and type hierarchy are chosen to suit the subject.",
      },
      {
        title: "Copy and artwork fill it",
        text: "Every slide is written and illustrated inside the structure that was just designed for it.",
      },
      {
        title: "Adjust anything",
        text: "Swap the palette, force a format, rewrite a slide, or regenerate a single image.",
      },
    ],
    points: [
      {
        title: "Never the same as everyone else's",
        text: "The layout is generated per topic rather than downloaded from a pack thousands of accounts also use.",
      },
      {
        title: "Structure that suits the content",
        text: "A myth-busting post and a step-by-step guide need different shapes. The brief stage picks the right one.",
      },
      {
        title: "Consistent without being repetitive",
        text: "Your Brand Kit holds the identity steady while the structure varies post to post.",
      },
      {
        title: "Reuse what worked",
        text: "Any post you've made can be used as a template for the next one.",
      },
    ],
    audience: [
      "Creators tired of recognisable template packs",
      "Brands that need variety inside one visual identity",
      "Anyone who's bought templates and still posts nothing",
    ],
    faq: [
      {
        question: "Are there templates I can browse?",
        answer:
          "There's no template gallery — layouts are generated per topic. You can, however, use any carousel you've already made as the template for a new one.",
      },
      {
        question: "Can I control the layout?",
        answer:
          "Yes. Format, palette, slide count and every slide's copy can be set or edited; leave them on auto and the AI decides.",
      },
      {
        question: "Can I reuse a design I like?",
        answer:
          "Yes — \"use as template\" starts a new post from an existing one's design and settings.",
      },
    ],
  },
];

export function getTool(slug: string): ToolPage | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

/** Slugs, for the sitemap and the middleware public-route allowlist. */
export const TOOL_SLUGS = TOOLS.map((t) => t.slug);
