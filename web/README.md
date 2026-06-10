# Prompt2Post – Web App

A full-stack Next.js application that transforms any topic into stunning social-media carousels using AI-generated copy and images — then publishes them to Instagram, immediately or on a schedule. Includes an AI Idea Studio, per-slide AI rewriting, caption remixing, a cross-platform Repurpose pack (X · LinkedIn · Story), PDF export for LinkedIn document posts, public share links for client review, one-click "use as template" reuse, a visual content calendar, a per-user Brand Kit, and copy generation in 13 languages.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js (App Router), React, TypeScript |
| **Styling** | Tailwind CSS v3 |
| **Auth** | Clerk |
| **Database** | PostgreSQL (Docker locally) |
| **File storage** | Local disk (`storage/`) served via `/api/files` |
| **AI – Text** | Groq API (Llama 3.3 70B) |
| **AI – Images** | Pollinations.ai (FLUX) |
| **Image Processing** | Sharp (server-side compositing) |
| **Payments** | Stripe Billing (subscriptions) |
| **Streaming** | Server-Sent Events (SSE) |

## Quick Start (local)

### 1. Install dependencies

```bash
cd web
npm install
```

### 2. Start PostgreSQL with Docker

```bash
npm run db:up
```

This starts Postgres on `localhost:5432` and runs `db/init.sql` on first boot.

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Minimum for local dev:

```env
DATABASE_URL=postgresql://prompt2post:prompt2post@localhost:5432/prompt2post
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
GROQ_API_KEY=gsk_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- **Clerk webhook** — optional locally (users sync on dashboard login)
- **Stripe** — optional until you test billing

### 4. Run the app

```powershell
# Windows (if SSL issues with npm/APIs)
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Docker commands

| Command | Description |
|---|---|
| `npm run db:up` | Start Postgres container |
| `npm run db:down` | Stop Postgres container |
| `npm run db:logs` | Tail Postgres logs |
| `npm run db:migrate` | Re-apply `db/init.sql` to a running container (idempotent — run after pulling schema changes) |

Default credentials (local only):

- User: `prompt2post`
- Password: `prompt2post`
- Database: `prompt2post`

## Architecture

```
POST /api/generate  (SSE stream)
  │
  ├─ 1. Check plan limits (PostgreSQL)
  ├─ 2. planStructure()    → Groq: tone, style, num_slides, format, color_mood
  ├─ 3. writeContent()     → Groq: headlines, body, palette-cohesive image prompts
  ├─ 4. For each slide:
  │     ├─ fetchImageBuffer()      → Pollinations.ai (aspect-correct for chosen format)
  │     ├─ uploadSlideBackground() → storage/posts/{id}/bg_NN.jpg (raw, for re-edits)
  │     ├─ composeSlide()          → Sharp text overlay at format dimensions
  │     └─ uploadSlideImage()      → storage/posts/{id}/slide_NN.jpg
  ├─ 5. uploadZip()        → storage/posts/{id}/slides.zip
  └─ 6. createPost()       → PostgreSQL
```

Generated images are served at `/api/files/posts/{postId}/slide_01.jpg`.

### Universal formats

The planner picks the **aspect ratio** that best fits the topic (or the user
can force one). Every downstream step — image generation, text compositing,
and the in-app preview — adapts to the chosen dimensions:

| Format | Ratio | Best for |
|---|---|---|
| Square | 1:1 | Instagram feed, quotes |
| Portrait | 4:5 | Carousels / listicles (max feed reach) |
| Story | 9:16 | Stories · Reels · TikTok |
| Wide | 16:9 | X · LinkedIn · YouTube |

### On-image text (Instagram-grade)

Text is rendered to **vector paths** from the bundled Poppins fonts
(`public/fonts/`) using `opentype.js`, then composited with Sharp. Vectorising
means output is pixel-identical on every OS with **no system-font / fontconfig
dependency**, and gives accurate measurement for auto-fit + word-wrap.

Four overlay templates (the planner picks one, or the user overrides):

| Template | Look |
|---|---|
| Classic | Gradient scrim + bold headline + accent bar |
| Banner | Solid card, magazine style, supports a short body line |
| Quote | Centered quote with accent quotation mark |
| Minimal | Text + soft shadow only (photography-led) |

Per-post customization: **accent color**, an optional **@handle watermark**,
tone, visual style, slide count, format, and template. Headlines are written
short and punchy (2–5 words) so a post is readable in under two seconds.

### Slide Studio — edit after generation

Generation is no longer one-shot. Every finished slide (in the create flow **and**
in post history) can be refined without spending a monthly post credit:

| Action | Endpoint | What happens |
|---|---|---|
| **Edit text** | `POST /api/posts/{id}/slide` `action=recompose` | Re-renders the headline/body overlay on the **stored raw background** (`bg_NN.jpg`). Instant — no image-generation call. |
| **AI rewrite** | `POST /api/posts/{id}/slide` `action=rewrite` | Groq rewrites the slide's copy (same idea, sharper words, same language), then re-composites on the stored background. |
| **New image** | `POST /api/posts/{id}/slide` `action=reimage` | Fetches a fresh AI background (new seed) and re-composites the same copy over it. |

All variants rewrite only the targeted slide, overwrite the file in place (the
client cache-busts with a `?v=` token), and rebuild the ZIP when one exists.
Posts can also be permanently removed — `DELETE /api/posts/{id}` deletes the row
and its stored files (images, backgrounds, ZIP) — and the social caption can be
swapped via `PATCH /api/posts/{id}`.

### Idea Studio — never start from a blank page

`/dashboard/ideas` asks for a niche (plus optional audience and goal) and Groq
proposes **six content ideas**, each with a hook, a why-it-works angle, and a
suggested tone/format/slide count. "Create this post" deep-links into the Create
form with everything pre-filled. Ideas are free — they never touch the monthly
post quota. (`POST /api/ideas`)

### Caption remix

Once a post is generated, the caption card offers **Remix**: Groq writes three
alternative takes (Punchier · Shorter · Storyteller). Picking one persists it to
the post (`POST /api/remix-caption`, then `PATCH /api/posts/{id}`).

### Repurpose pack — one post, every platform

Every generated post has a **Repurpose everywhere** card: one click asks Groq to
rewrite the post natively for other platforms (`POST /api/posts/{id}/repurpose`):

| Version | Shape |
|---|---|
| **X / Twitter** | 200–275 chars, fact-first, no hashtags |
| **LinkedIn** | 90–150 words, hook + insight paragraphs + question, 3 hashtags |
| **Story hook** | 1–2 punchy overlay lines + a poll/question sticker suggestion |

The pack is stored in the post's `content.repurposed` JSONB, so it persists and
can be regenerated. Free — never touches the monthly quota.

### PDF export — LinkedIn document carousels

`GET /api/posts/{id}/pdf` assembles the composited slides into a single PDF
(one page per slide, built with `pdf-lib`). LinkedIn renders an uploaded PDF as
a swipeable document-post carousel, so this is the native LinkedIn export.
Available next to the ZIP download for Pro/Creator.

### Quick starts — proven formats, one click

The Create page has a **Quick starts** row of curated recipes (Myths busted ·
How-to in 5 steps · Beginner mistakes · Surprising stats · Hot take · Story
time). Each one prefills the topic scaffold, tone, template, format, and slide
count around whatever the user has typed.

### Public share links — review without an account

Any post can be shared via an unguessable public URL (`/p/{token}`): one click
on the post page creates the link (and copies it), and the read-only page shows
the slides, caption, and hashtags with OG tags for rich link previews — ideal
for client approval or showing off a result. The owner can rotate or disable
the link at any time (`POST/DELETE /api/posts/{id}/share`).

### Use as template — clone a winning design

Every post in history has a **Use as template** action that reopens the Create
form with the post's topic and complete design (tone, style, format, template,
accent, fonts, casing, alignment, watermark, slide count) pre-filled — iterate
on what already worked instead of starting over.

### Brand Kit — your style as the default

"Save my style" in the Create form stores the current design (tone, style,
format, template, accent, watermark handle, font, casing, alignment, text
amount, language) as the user's **Brand Kit** (`users.brand_kit`, managed via
`GET/PUT/DELETE /api/brand-kit`). Every new visit to the Create page starts from
it; Idea Studio links layer on top of it.

### Multi-language copy

The Create form has a **Copy language** selector (13 languages). All user-facing
copy — headlines, body, hook, caption, hashtags — is written in the chosen
language, while image prompts stay in English for the image model.

### Instagram publishing & scheduling

Pro and Creator users connect an Instagram Business/Creator account (Meta Graph
API OAuth) and publish singles or carousels directly. **Creator** users can also
**schedule** posts:

| Endpoint | What it does |
|---|---|
| `POST /api/instagram/schedule` | Queue a post for a future time (2 min – 90 days out) |
| `GET /api/instagram/schedule` | The user's schedule queue |
| `DELETE /api/instagram/schedule/{id}` | Cancel a queued entry |
| `GET /api/instagram/schedule/run` | Publish everything that's due |

Due posts are published by the **runner** (`src/lib/scheduler.ts`), which claims
each entry with an atomic `queued → publishing` transition so concurrent runs
never double-post. The runner is triggered two ways:

- **Production:** a cron hit on `/api/instagram/schedule/run` every 5 minutes
  (`vercel.json` is included; set `CRON_SECRET` so the route accepts the cron's
  `Authorization: Bearer` header).
- **Local dev:** opportunistically whenever the owner opens the dashboard
  overview or the Scheduled page.

The queue lives at `/dashboard/scheduled` with a **month-grid content
calendar** (status dots per day, click a day to filter), status chips
(queued/publishing/published/failed/canceled), and one-click cancel.

### Dashboard UX

- **Ctrl+K command palette** — fuzzy-search navigation from anywhere in the
  dashboard (also via the "Quick jump" button in the sidebar).
- **Onboarding checklist** on the overview, computed from real account state
  (first post, Brand Kit, Instagram connection, first schedule).
- **Activity chart** on the overview — posts per day over the last two weeks.
- **History search & filters** — find any post by topic/tone, filter by
  format, flip between newest/oldest.
- Animated count-up stats, aurora background, confetti on generation. 🎉

## Project Structure

```
web/
├── docker-compose.yml      # Local Postgres
├── db/init.sql             # Schema (auto-runs on first Docker start)
├── storage/                # Generated images & ZIPs (gitignored)
├── src/
│   ├── lib/pg.ts           # Postgres connection pool
│   ├── lib/db.ts           # SQL queries
│   ├── lib/image/storage.ts
│   └── app/api/files/      # Serves stored files
```

## Production notes

For production, point `DATABASE_URL` at any managed Postgres (Neon, Railway, RDS, etc.). Replace local file storage with S3/R2 when you deploy — the `storage.ts` module is the only place to swap.
