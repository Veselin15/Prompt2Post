"""
writer.py – AI creative content writer.

Given a topic and a structural plan, the writer produces rich, engaging text
for every slide: interesting facts, vivid storytelling, punchy hooks, or
educational nuggets. This is the "brain" that makes posts worth reading.

The writer runs as a second LLM call *after* the planner decides the structure
(tone, style, slide count) so the creative energy is focused entirely on content.
"""

from __future__ import annotations

import json
import re
from typing import List, TypedDict

from . import config

# ── Schema ─────────────────────────────────────────────────────────────────────

class SlideContent(TypedDict):
    slide_number: int
    headline: str          # bold primary text (short, punchy)
    body: str              # supporting detail: fact, tip, story beat, or quote
    image_prompt: str      # vivid scene description for the image generator
    text_position: str     # "top" | "center" | "bottom"
    text_size: str         # "small" | "medium" | "large"


class CreativeContent(TypedDict):
    topic: str
    tone: str
    style: str
    post_type: str
    hook: str              # compelling opening line / thesis
    hashtags: List[str]
    social_caption: str    # ready-to-paste caption for Instagram / LinkedIn
    slides: List[SlideContent]


# ── System prompt ──────────────────────────────────────────────────────────────

_WRITER_SYSTEM = """You are a world-class creative copywriter, storyteller, and content researcher.
You receive a TOPIC and a STRUCTURE (tone, style, number of slides). Your job is to
write **brilliant, engaging content** for every slide — NOT generic filler.

YOUR CONTENT MUST:
1. Research-feel — include real or plausible interesting FACTS, statistics, dates, or little-known trivia
2. Be genuinely creative — use metaphors, vivid language, wordplay, or dramatic tension
3. Tell a STORY across slides — each slide should flow into the next
4. Vary the rhythm — mix short punchy headlines with richer body text
5. End with impact — the last slide should be a memorable closer / call to action

RESPOND WITH VALID JSON ONLY — no markdown fences, no commentary outside the JSON.

JSON Schema:
{
  "topic": "<echoed topic>",
  "tone": "<echoed tone>",
  "style": "<echoed style>",
  "post_type": "<echoed post_type>",
  "hook": "<one compelling sentence that makes people stop scrolling>",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5"],
  "social_caption": "<2-3 sentence caption for posting, include 1-2 emojis, end with CTA>",
  "slides": [
    {
      "slide_number": 1,
      "headline": "<bold primary text, 3-8 words, appears large on image>",
      "body": "<1-2 sentences of supporting content — a fact, tip, story beat, or insight>",
      "image_prompt": "<vivid Flux image prompt: style keyword + subject + lighting + mood + color palette + composition. NO text/letters in image>",
      "text_position": "<top|center|bottom>",
      "text_size": "<small|medium|large>"
    }
  ]
}

CONTENT STRATEGIES BY TONE:
- inspirational: Open with a surprising fact → build tension → deliver the payoff quote
- educational: Hook with "Did you know…" → numbered tips with specifics → summary takeaway
- funny: Setup → escalation → punchline structure across slides
- dramatic: Cold open → rising action → climax → resolution
- professional: Problem statement → data/evidence → solution → CTA
- promotional: Pain point → transformation → social proof → offer → urgency

HEADLINE vs BODY RULES:
- Headline: goes ON the image (large text overlay). Must be SHORT (3-8 words), punchy, readable at a glance
- Body: appears BELOW the image in the caption area. Can be longer, more detailed, include facts/stats
- Together they should make the viewer FEEL something and LEARN something

IMAGE PROMPT RULES:
- Start with the style keyword (e.g. "cinematic photography of…", "neon illustration of…")
- Describe a vivid SCENE that complements the slide's message
- Include: lighting, mood, color palette, composition, camera angle
- NEVER include text, letters, words, or watermarks in the image prompt
- Make each slide's image visually distinct but thematically coherent
- Think like a film director: what would the perfect frame look like?
"""

_WRITER_USER = """TOPIC: {topic}

STRUCTURE:
- Tone: {tone}
- Visual style: {style}
- Post type: {post_type}
- Number of slides: {num_slides}

Now write brilliant, creative content for all {num_slides} slides. Make it genuinely interesting — include real facts, vivid storytelling, or surprising insights about this topic."""


# ── Helpers ────────────────────────────────────────────────────────────────────

def _extract_json(text: str) -> dict:
    text = re.sub(r"```[a-z]*\n?", "", text).strip()
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError("No JSON object found in writer response.")
    return json.loads(match.group())


def _validate_content(data: dict) -> CreativeContent:
    for key in ("hook", "hashtags", "social_caption", "slides"):
        if key not in data:
            raise ValueError(f"Writer output missing '{key}'")

    for slide in data["slides"]:
        for field in ("slide_number", "headline", "body", "image_prompt", "text_position", "text_size"):
            if field not in slide:
                raise ValueError(f"Slide missing '{field}': {slide}")

    return data  # type: ignore[return-value]


# ── LLM backends ──────────────────────────────────────────────────────────────

def _write_via_groq(topic: str, tone: str, style: str, post_type: str, num_slides: int) -> dict:
    import httpx
    from groq import Groq

    client = Groq(
        api_key=config.GROQ_API_KEY,
        http_client=httpx.Client(verify=config.ssl_verify()),
    )

    user_msg = _WRITER_USER.format(
        topic=topic, tone=tone, style=style,
        post_type=post_type, num_slides=num_slides,
    )

    response = client.chat.completions.create(
        model=config.GROQ_MODEL,
        messages=[
            {"role": "system", "content": _WRITER_SYSTEM},
            {"role": "user", "content": user_msg},
        ],
        response_format={"type": "json_object"},
        temperature=0.9,
        max_tokens=4096,
    )
    return _extract_json(response.choices[0].message.content)


def _write_via_gemini(topic: str, tone: str, style: str, post_type: str, num_slides: int) -> dict:
    from google import genai

    client = genai.Client(api_key=config.GEMINI_API_KEY)
    user_msg = _WRITER_USER.format(
        topic=topic, tone=tone, style=style,
        post_type=post_type, num_slides=num_slides,
    )
    prompt = f"{_WRITER_SYSTEM}\n\n{user_msg}"
    response = client.models.generate_content(model=config.GEMINI_MODEL, contents=prompt)
    return _extract_json(response.text)


# ── Public API ─────────────────────────────────────────────────────────────────

def write_content(
    topic: str,
    tone: str,
    style: str,
    post_type: str,
    num_slides: int,
    max_retries: int = 3,
) -> CreativeContent:
    """
    Generate rich creative content for every slide.
    """
    backend = config.active_llm()
    fetch = _write_via_groq if backend == "groq" else _write_via_gemini

    last_error: Exception | None = None
    for attempt in range(1, max_retries + 1):
        try:
            raw = fetch(topic, tone, style, post_type, num_slides)
            return _validate_content(raw)
        except (ValueError, KeyError, json.JSONDecodeError) as exc:
            last_error = exc
            if attempt < max_retries:
                continue
        except Exception as exc:
            err_name = type(exc).__name__
            if err_name in ("ConnectError", "APIConnectionError", "ConnectionError"):
                hint = (
                    "SSL/certificate error connecting to the LLM API. "
                    "Add `SSL_VERIFY=false` to your `.env` file and restart the app."
                )
                if not config.SSL_VERIFY:
                    hint = "Could not reach the LLM API. Check your internet connection."
                raise RuntimeError(hint) from exc
            raise

    raise RuntimeError(
        f"Writer failed after {max_retries} attempts.\nLast error: {last_error}"
    )
