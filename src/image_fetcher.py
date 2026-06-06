"""
image_fetcher.py – Download AI-generated images from Pollinations.ai.

Endpoint:
  GET https://gen.pollinations.ai/image/{encoded_prompt}
      ?model=flux&width=W&height=H&nologo=true&seed=S&key=API_KEY

Images are fetched at FETCH_WIDTH × FETCH_HEIGHT (cheaper) and upscaled
locally to IMAGE_WIDTH × IMAGE_HEIGHT for the final output.
"""

from __future__ import annotations

import io
import json
import math
import random
import time
from urllib.parse import quote

import requests
from PIL import Image, ImageDraw, ImageFilter

from . import config

_POLLINATIONS_URL = "https://gen.pollinations.ai/image/{prompt}"
_MODEL_FALLBACKS = ["flux", "klein", "zimage"]
_STYLE_SUFFIX: dict[str, str] = {
    "cinematic": ", cinematic photography, film grain, dramatic lighting",
    "vibrant":   ", vibrant colors, high saturation, punchy contrast",
    "minimalist": ", minimalist design, clean composition, lots of white space",
    "neon":      ", neon glow, cyberpunk aesthetic, dark background",
    "vintage":   ", vintage film look, muted tones, retro grain",
    "dreamy":    ", dreamy soft light, bokeh, pastel palette",
    "flat":      ", flat design illustration, vector art, bold outlines",
    "bold":      ", bold graphic design, strong contrast, powerful composition",
}


def _build_url(prompt: str, style: str, seed: int, model: str,
               width: int, height: int, use_key: bool = True) -> str:
    suffix = _STYLE_SUFFIX.get(style, "")
    full_prompt = f"{prompt}{suffix}"
    encoded = quote(full_prompt, safe="")
    url = (
        f"{_POLLINATIONS_URL.format(prompt=encoded)}"
        f"?model={model}"
        f"&width={width}"
        f"&height={height}"
        f"&nologo=true"
        f"&seed={seed}"
    )
    if use_key and config.POLLINATIONS_API_KEY:
        url += f"&key={quote(config.POLLINATIONS_API_KEY, safe='')}"
    return url


_STYLE_PALETTES: dict[str, list[tuple]] = {
    "cinematic": [(20, 24, 48), (60, 80, 120), (180, 140, 90)],
    "vibrant":   [(255, 60, 90), (60, 180, 255), (255, 200, 40)],
    "minimalist": [(240, 240, 245), (200, 200, 210), (160, 160, 175)],
    "neon":      [(10, 5, 30), (0, 255, 200), (255, 0, 180)],
    "vintage":   [(60, 45, 35), (140, 110, 80), (200, 170, 130)],
    "dreamy":    [(255, 220, 240), (180, 200, 255), (255, 180, 200)],
    "flat":      [(52, 152, 219), (46, 204, 113), (241, 196, 15)],
    "bold":      [(15, 15, 15), (230, 50, 50), (255, 255, 255)],
}


def _generate_fallback(prompt: str, style: str, seed: int) -> Image.Image:
    """Create a styled gradient placeholder when the API is unavailable."""
    rng = random.Random(seed)
    w, h = config.IMAGE_WIDTH, config.IMAGE_HEIGHT
    palette = _STYLE_PALETTES.get(style, _STYLE_PALETTES["cinematic"])
    c1, c2, c3 = palette[0], palette[1], palette[2]

    img = Image.new("RGB", (w, h))
    px = img.load()
    angle = rng.uniform(0, math.pi)
    cx, cy = w * rng.uniform(0.3, 0.7), h * rng.uniform(0.3, 0.7)

    for y in range(h):
        for x in range(w):
            t = (x * math.cos(angle) + y * math.sin(angle)) / (w + h)
            t = (t + 1) / 2
            if t < 0.5:
                r = t * 2
                color = tuple(int(c1[i] * (1 - r) + c2[i] * r) for i in range(3))
            else:
                r = (t - 0.5) * 2
                color = tuple(int(c2[i] * (1 - r) + c3[i] * r) for i in range(3))
            dist = math.hypot(x - cx, y - cy) / math.hypot(w, h)
            fade = max(0.4, 1 - dist * 0.8)
            px[x, y] = tuple(int(c * fade) for c in color)

    img = img.filter(ImageFilter.GaussianBlur(radius=3))
    draw = ImageDraw.Draw(img)
    draw.ellipse(
        [cx - w * 0.15, cy - h * 0.15, cx + w * 0.15, cy + h * 0.15],
        fill=tuple(min(255, c + 40) for c in c2),
    )
    img = img.filter(ImageFilter.GaussianBlur(radius=8))
    return img


def _request_image(url: str) -> requests.Response:
    return requests.get(
        url,
        timeout=config.POLLINATIONS_TIMEOUT,
        verify=config.ssl_verify(),
    )


def _upscale_if_needed(img: Image.Image) -> Image.Image:
    target = (config.IMAGE_WIDTH, config.IMAGE_HEIGHT)
    if img.size == target:
        return img
    try:
        resample = Image.Resampling.LANCZOS
    except AttributeError:
        resample = Image.LANCZOS
    return img.resize(target, resample)


def _friendly_error(status_code: int, body: str) -> str:
    if status_code == 401:
        return (
            "Pollinations authentication required. Get a free API key at "
            "https://enter.pollinations.ai and add `POLLINATIONS_API_KEY` to `.env`."
        )
    if status_code == 402:
        try:
            data = json.loads(body)
            msg = data.get("error", {}).get("message", "")
            if "Insufficient balance" in msg or "balance" in msg.lower():
                return (
                    "Pollinations pollen balance too low for this image size. "
                    "The app will retry at a smaller size automatically. "
                    "Top up free daily pollen at https://enter.pollinations.ai "
                    "or set `FETCH_WIDTH=512` in `.env`."
                )
        except (json.JSONDecodeError, AttributeError):
            pass
        return (
            "Pollinations Payment Required (402). Check your pollen balance at "
            "https://enter.pollinations.ai or use a smaller `FETCH_WIDTH` in `.env`."
        )
    if status_code == 429:
        return "Pollinations rate limit hit. Wait a minute and try again."
    snippet = body[:200].strip() if body else f"HTTP {status_code}"
    return f"Pollinations error ({status_code}): {snippet}"


def fetch_image(
    prompt: str,
    style: str = "cinematic",
    seed: int | None = None,
    max_retries: int = 2,
) -> Image.Image:
    """
    Fetch a single image from Pollinations.ai and return a PIL Image.

    Tries model fallbacks and steps down image size on 402 (low balance).
    """
    if seed is None:
        seed = random.randint(1, 999_999)

    models = [config.POLLINATIONS_MODEL]
    for m in _MODEL_FALLBACKS:
        if m not in models:
            models.append(m)

    last_error: Exception | None = None

    width, height = config.FETCH_WIDTH, config.FETCH_HEIGHT

    for model in models:
        # Try with API key first, then anonymous (free tier) on 402/401
        for use_key in (True, False):
            url = _build_url(prompt, style, seed, model, width, height, use_key=use_key)

            for attempt in range(1, max_retries + 1):
                try:
                    response = _request_image(url)

                    if response.status_code in (401, 402):
                        last_error = requests.HTTPError(
                            _friendly_error(response.status_code, response.text),
                            response=response,
                        )
                        if use_key:
                            break  # retry without key
                        break  # try next model

                    if response.status_code != 200:
                        raise requests.HTTPError(
                            _friendly_error(response.status_code, response.text),
                            response=response,
                        )

                    content_type = response.headers.get("Content-Type", "")
                    if "image" not in content_type:
                        raise ValueError(
                            f"Unexpected Content-Type: {content_type}"
                        )

                    img = Image.open(io.BytesIO(response.content)).convert("RGB")
                    return _upscale_if_needed(img)

                except (requests.RequestException, OSError, ValueError) as exc:
                    last_error = exc
                    if isinstance(exc, requests.HTTPError):
                        status = exc.response.status_code if exc.response is not None else 0
                        if status in (401, 402, 403):
                            if use_key:
                                break
                            break
                    if attempt < max_retries:
                        time.sleep(2 ** attempt)

    # API exhausted — styled local placeholder so the post still completes
    import warnings
    warnings.warn(
        "Pollinations unavailable (low pollen balance). Using a styled placeholder "
        "image. Top up free credits at https://enter.pollinations.ai",
        UserWarning,
        stacklevel=2,
    )
    return _generate_fallback(prompt, style, seed)
