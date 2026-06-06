# 🚀 Prompt2Post

> Turn any idea into a stunning social-media post — powered entirely by free AI.

Prompt2Post is a **Universal Post Generator** that dynamically analyses your topic
and produces a complete, ready-to-share image carousel or single post.
No subscriptions, no paid APIs — just type your idea and get results.

---

## ✨ Key Features

| Feature | Details |
|---|---|
| **Dynamic Tone Detection** | The LLM decides if your post should be funny, inspirational, professional, dramatic, or promotional |
| **Smart Slide Count** | 1 image for quotes, 3–5 for tip lists, up to 10 for story carousels |
| **Flexible Text Overlay** | Text is placed at top / center / bottom depending on image composition |
| **Multiple Styles** | minimalist, cinematic, vibrant, neon, vintage, dreamy, bold, flat |
| **$0 Stack** | Groq (free LLM) + Pollinations.ai (free image gen) + local Python |
| **Dual Interface** | Rich CLI for power users, Gradio web UI for everyone else |

---

## 🛠️ Setup (5 minutes)

### 1. Clone & install

```bash
git clone https://github.com/Veselin15/Prompt2Post.git
cd Prompt2Post
pip install -r requirements.txt
```

### 2. Configure your free API key

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
GROQ_API_KEY=gsk_your_key_here
POLLINATIONS_API_KEY=pk_your_key_here
```

| Key | Where to get it (free) |
|---|---|
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) |
| `POLLINATIONS_API_KEY` | [enter.pollinations.ai](https://enter.pollinations.ai) — use the `flux` model (free) |

> **No Groq account?** Set `GEMINI_API_KEY` instead ([aistudio.google.com](https://aistudio.google.com/app/apikey)).
>
> **SSL errors on Windows?** Add `SSL_VERIFY=false` to `.env`.

---

## 🚀 Usage

### Web UI (recommended)

```bash
python app.py
# or
python main.py --ui
```

Opens at `http://127.0.0.1:7860`.  
Use `--share` to generate a public Gradio link.

### CLI

```bash
python main.py "Gym motivation for beginners"
python main.py "Coffee shop weekend promo" --open   # auto-opens output folder
python main.py "Cyberpunk short story – neon rain"
```

---

## 🗂️ Project Structure

```
Prompt2Post/
├── main.py              ← CLI entry point (python main.py "your topic")
├── app.py               ← Gradio web UI (python app.py)
├── requirements.txt
├── .env.example         ← copy to .env and add your keys
├── output/              ← generated posts land here (gitignored)
└── src/
    ├── config.py        ← env loading, paths, constants
    ├── planner.py       ← LLM → structured PostPlan (JSON)
    ├── image_fetcher.py ← Pollinations.ai image download
    ├── compositor.py    ← PIL text overlay with gradient bands
    └── pipeline.py      ← orchestrates plan → fetch → compose → save
```

---

## ⚙️ How it works

```
User Topic
    │
    ▼
┌─────────────┐   JSON    ┌──────────────────────────────────────────┐
│  Planner    │ ────────► │  PostPlan                                │
│  (Groq LLM) │           │  tone, style, post_type, slides[]        │
└─────────────┘           └──────────────────────────────────────────┘
                                           │
                              for each slide:
                                           │
                          ┌────────────────▼────────────────┐
                          │  image_fetcher                   │
                          │  Pollinations.ai  (flux model)   │
                          └────────────────┬────────────────┘
                                           │  raw PIL Image
                          ┌────────────────▼────────────────┐
                          │  compositor                      │
                          │  gradient band + text overlay    │
                          └────────────────┬────────────────┘
                                           │  final JPEG
                          ┌────────────────▼────────────────┐
                          │  output/YYYYMMDD_HHMMSS/         │
                          │  slide_01.jpg … slide_N.jpg      │
                          │  plan.json                       │
                          └──────────────────────────────────┘
```

---

## 🎨 Example Topics

- `"Gym motivation for beginners"` → 5-slide inspirational carousel
- `"Coffee shop weekend promo"` → 3-slide promotional post
- `"Cyberpunk short story – neon rain"` → 8-slide cinematic story
- `"5 productivity hacks for remote workers"` → 5-slide educational carousel
- `"Sunset beach travel inspiration"` → single dreamy hero image

---

## 🔧 Configuration

All settings live in `.env`:

| Variable | Default | Description |
|---|---|---|
| `GROQ_API_KEY` | — | **Required.** Your Groq API key |
| `POLLINATIONS_API_KEY` | — | **Required.** Free Pollinations key for images |
| `POLLINATIONS_MODEL` | `flux` | Image model (`flux` is free with registration) |
| `GEMINI_API_KEY` | — | Optional Gemini fallback key |
| `SSL_VERIFY` | `true` | Set `false` if you get certificate errors |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Groq model to use |
| `OUTPUT_DIR` | `output` | Where to save generated images |
| `IMAGE_WIDTH` | `1080` | Output image width (px) |
| `IMAGE_HEIGHT` | `1080` | Output image height (px) |

---

## 📄 License

MIT — free to use, modify, and distribute.
