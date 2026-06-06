"""
compositor.py – Render styled text onto images.

Supports two text zones on every slide:
  - headline : bold, large text (3-8 words, the "hook")
  - body     : smaller supporting text (fact / tip / story beat)

Layout engine places them in the requested region (top / center / bottom)
with a smooth gradient backdrop, drop shadow, and optional slide counter.
"""

from __future__ import annotations

from pathlib import Path
from typing import Optional

from PIL import Image, ImageDraw, ImageFont

from . import config

# ── Font loading ───────────────────────────────────────────────────────────────

_SIZE_MAP = {
    "small":  {"headline": 40, "body": 24, "counter": 20},
    "medium": {"headline": 56, "body": 30, "counter": 22},
    "large":  {"headline": 72, "body": 34, "counter": 24},
}
_LOADED: dict = {}


def _load_font(size: int) -> ImageFont.FreeTypeFont:
    if size in _LOADED:
        return _LOADED[size]
    for path in config.FONT_CANDIDATES:
        if Path(path).exists():
            try:
                font = ImageFont.truetype(path, size)
                _LOADED[size] = font
                return font
            except (OSError, AttributeError):
                continue
    font = ImageFont.load_default()
    _LOADED[size] = font
    return font


# ── Text helpers ───────────────────────────────────────────────────────────────

def _wrap(text: str, font, max_w: int) -> list:
    dummy = Image.new("RGB", (1, 1))
    draw = ImageDraw.Draw(dummy)
    words, lines, cur = text.split(), [], ""
    for word in words:
        test = f"{cur} {word}".strip()
        bbox = draw.textbbox((0, 0), test, font=font)
        if bbox[2] - bbox[0] <= max_w:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines or [text]


def _draw_text_block(draw, lines, font, x_center, y_start, line_h,
                     color=(255, 255, 255, 255), shadow=True, shadow_offset=2):
    y = y_start
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        lw = bbox[2] - bbox[0]
        x = x_center - lw // 2
        if shadow:
            draw.text((x + shadow_offset, y + shadow_offset), line,
                      font=font, fill=(0, 0, 0, 200))
        draw.text((x, y), line, font=font, fill=color)
        y += line_h
    return y


# ── Gradient backdrop ──────────────────────────────────────────────────────────

def _gradient_band(w: int, h: int, direction: str,
                   color=(0, 0, 0), max_alpha=180) -> Image.Image:
    band = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    px = band.load()
    for y in range(h):
        r = y / max(h - 1, 1)
        if direction == "down":
            a = int(max_alpha * (1 - r))
        elif direction == "up":
            a = int(max_alpha * r)
        else:
            dist = abs(r - 0.5) * 2
            a = int(max_alpha * (1 - dist))
        for x in range(w):
            px[x, y] = (*color, a)
    return band


# ── Public API ─────────────────────────────────────────────────────────────────

def compose_slide(
    image: Image.Image,
    headline: str,
    body: str = "",
    position: str = "bottom",
    text_size: str = "medium",
    slide_number: Optional[int] = None,
    total_slides: Optional[int] = None,
    text_color: tuple = (255, 255, 255),
    overlay_alpha: int = 180,
) -> Image.Image:
    """
    Render headline + body onto *image* in the chosen region.

    Returns a new RGB image.
    """
    img = image.convert("RGBA")
    w, h = img.size

    sizes = _SIZE_MAP.get(text_size, _SIZE_MAP["medium"])
    h_font = _load_font(sizes["headline"])
    b_font = _load_font(sizes["body"])
    c_font = _load_font(sizes["counter"])

    pad_x = int(w * 0.06)
    pad_y = int(h * 0.02)
    max_text_w = w - pad_x * 2

    h_lines = _wrap(headline, h_font, max_text_w)
    b_lines = _wrap(body, b_font, max_text_w) if body else []

    h_line_h = int(sizes["headline"] * 1.3)
    b_line_h = int(sizes["body"] * 1.4)

    h_block = len(h_lines) * h_line_h
    b_block = len(b_lines) * b_line_h
    gap = int(h * 0.015) if b_lines else 0
    total_text_h = h_block + gap + b_block + pad_y * 2

    band_h = max(total_text_h + pad_y * 4, int(h * 0.25))

    if position == "top":
        band_top, grad = 0, "down"
        text_y = pad_y * 3
    elif position == "center":
        band_top = (h - band_h) // 2
        grad = "center"
        text_y = band_top + (band_h - total_text_h) // 2
    else:
        band_top = h - band_h
        grad = "up"
        text_y = band_top + (band_h - total_text_h) // 2

    gradient = _gradient_band(w, band_h, grad, max_alpha=overlay_alpha)
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    overlay.paste(gradient, (0, band_top))

    comp = Image.alpha_composite(img, overlay)
    draw = ImageDraw.Draw(comp)

    shadow_off = max(2, sizes["headline"] // 28)

    y = _draw_text_block(
        draw, h_lines, h_font, w // 2, text_y, h_line_h,
        color=(*text_color, 255), shadow_offset=shadow_off,
    )

    if b_lines:
        y += gap
        body_color = (*text_color[:3], 220)
        _draw_text_block(
            draw, b_lines, b_font, w // 2, y, b_line_h,
            color=body_color, shadow_offset=max(1, shadow_off - 1),
        )

    if slide_number is not None and total_slides is not None and total_slides > 1:
        counter = f"{slide_number}/{total_slides}"
        cbbox = draw.textbbox((0, 0), counter, font=c_font)
        cw = cbbox[2] - cbbox[0]
        cx = w - cw - int(w * 0.04)
        cy = int(h * 0.03)
        draw.text((cx + 1, cy + 1), counter, font=c_font, fill=(0, 0, 0, 150))
        draw.text((cx, cy), counter, font=c_font, fill=(255, 255, 255, 200))

    return comp.convert("RGB")


# Backwards-compatible alias
def add_text_overlay(image, text, position="bottom", text_size="medium", **kw):
    return compose_slide(image, headline=text, position=position, text_size=text_size, **kw)
