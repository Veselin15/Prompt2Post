# Prompt2Post – Web App

A full-stack Next.js application that transforms any topic into stunning social-media carousels using AI-generated copy and images.

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

Default credentials (local only):

- User: `prompt2post`
- Password: `prompt2post`
- Database: `prompt2post`

## Architecture

```
POST /api/generate  (SSE stream)
  │
  ├─ 1. Check plan limits (PostgreSQL)
  ├─ 2. planStructure()    → Groq: tone, style, num_slides
  ├─ 3. writeContent()     → Groq: headlines, body, image prompts
  ├─ 4. For each slide:
  │     ├─ fetchImageBuffer()   → Pollinations.ai
  │     ├─ composeSlide()       → Sharp text overlay
  │     └─ uploadSlideImage()   → storage/posts/{id}/
  ├─ 5. uploadZip()        → storage/posts/{id}/slides.zip
  └─ 6. createPost()       → PostgreSQL
```

Generated images are served at `/api/files/posts/{postId}/slide_01.jpg`.

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
