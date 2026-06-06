"""
planner.py – Lightweight structure planner.

Stage 1 of the pipeline: decides tone, style, slide count, and post type.
The heavy creative work (headlines, bodies, image prompts) is handled by
writer.py in a separate LLM call so each model call has a focused job.
"""

from __future__ import annotations

import json
import re
from typing import TypedDict

from . import config


# ── Schema ─────────────────────────────────────────────────────────────────────

class PostStructure(TypedDict):
    tone: str
    style: str
    post_type: str    # "single" | "carousel" | "story"
    num_slides: int
    color_mood: str   # e.g. "warm sunset tones", "dark moody blues"


# ── System prompt ──────────────────────────────────────────────────────────────

_SYSTEM_PROMPT = """You are a social media strategist. Given a topic and optional user preferences,
decide the STRUCTURE of the post.  Do NOT write the slide content — only the structure.

RESPOND WITH VALID JSON ONLY.

{
  "tone": "<funny|professional|inspirational|dramatic|educational|promotional>",
  "style": "<minimalist|vibrant|cinematic|flat|neon|vintage|dreamy|bold>",
  "post_type": "<single|carousel|story>",
  "num_slides": <integer 1-10>,
  "color_mood": "<brief description of the visual color palette / atmosphere>"
}

RULES:
- Motivational quote / hero image → single, 1 slide
- How-to / tip list / listicle → carousel, 3-6 slides
- Story / narrative / promo → carousel or story, 4-10 slides
- If the user explicitly requested a tone or style, respect that
- color_mood should guide the visual cohesion (e.g. "dark neon blues and purples", "warm golden hour")
"""

_USER_TEMPLATE = """Topic: {topic}
{preferences}"""


# ── Helpers ────────────────────────────────────────────────────────────────────

def _extract_json(text: str) -> dict:
    text = re.sub(r"```[a-z]*\n?", "", text).strip()
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError("No JSON object found in planner response.")
    return json.loads(match.group())


def _validate_structure(data: dict) -> PostStructure:
    for key in ("tone", "style", "post_type", "num_slides"):
        if key not in data:
            raise ValueError(f"Structure missing '{key}'")
    data["num_slides"] = max(1, min(10, int(data["num_slides"])))
    data.setdefault("color_mood", "cinematic natural tones")
    return data  # type: ignore[return-value]


# ── LLM backends ──────────────────────────────────────────────────────────────

def _plan_via_groq(topic: str, preferences: str) -> dict:
    import httpx
    from groq import Groq

    client = Groq(
        api_key=config.GROQ_API_KEY,
        http_client=httpx.Client(verify=config.ssl_verify()),
    )
    response = client.chat.completions.create(
        model=config.GROQ_MODEL,
        messages=[
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": _USER_TEMPLATE.format(topic=topic, preferences=preferences)},
        ],
        response_format={"type": "json_object"},
        temperature=0.7,
        max_tokens=512,
    )
    return _extract_json(response.choices[0].message.content)


def _plan_via_gemini(topic: str, preferences: str) -> dict:
    from google import genai

    client = genai.Client(api_key=config.GEMINI_API_KEY)
    prompt = f"{_SYSTEM_PROMPT}\n\n{_USER_TEMPLATE.format(topic=topic, preferences=preferences)}"
    response = client.models.generate_content(model=config.GEMINI_MODEL, contents=prompt)
    return _extract_json(response.text)


# ── Public API ─────────────────────────────────────────────────────────────────

def create_structure(
    topic: str,
    tone: str | None = None,
    style: str | None = None,
    num_slides: int | None = None,
    max_retries: int = 3,
) -> PostStructure:
    """
    Analyze the topic and return a lightweight structure.
    User-provided overrides (tone, style, num_slides) take priority.
    """
    pref_parts = []
    if tone:
        pref_parts.append(f"Tone: {tone}")
    if style:
        pref_parts.append(f"Style: {style}")
    if num_slides:
        pref_parts.append(f"Number of slides: {num_slides}")
    preferences = "\n".join(pref_parts) if pref_parts else "No specific preferences."

    backend = config.active_llm()
    fetch = _plan_via_groq if backend == "groq" else _plan_via_gemini

    last_error: Exception | None = None
    for attempt in range(1, max_retries + 1):
        try:
            raw = fetch(topic, preferences)
            structure = _validate_structure(raw)

            if tone:
                structure["tone"] = tone
            if style:
                structure["style"] = style
            if num_slides:
                structure["num_slides"] = max(1, min(10, num_slides))
            return structure

        except (ValueError, KeyError, json.JSONDecodeError) as exc:
            last_error = exc
            if attempt < max_retries:
                continue
        except Exception as exc:
            err_name = type(exc).__name__
            if err_name in ("ConnectError", "APIConnectionError", "ConnectionError"):
                hint = (
                    "SSL/certificate error connecting to the LLM API. "
                    "Add `SSL_VERIFY=false` to your `.env` file and restart."
                )
                if not config.SSL_VERIFY:
                    hint = "Could not reach the LLM API. Check your internet connection."
                raise RuntimeError(hint) from exc
            raise

    raise RuntimeError(
        f"Planner failed after {max_retries} attempts.\nLast error: {last_error}"
    )
