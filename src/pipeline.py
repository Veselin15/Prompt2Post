"""
pipeline.py – Orchestrates the full Prompt → Post flow.

Stages:
  1. Plan   : LLM picks tone, style, slide count  (planner.py)
  2. Write  : LLM creates creative content for every slide  (writer.py)
  3. Fetch  : Each slide's image_prompt → Pollinations.ai  (image_fetcher.py)
  4. Compose: headline + body overlaid on each image  (compositor.py)
  5. Save   : Finished slides + plan.json + content.json → output/
"""

from __future__ import annotations

import json
import random
import time
import zipfile
from datetime import datetime
from pathlib import Path
from typing import Callable, Dict, Generator, List, Optional, Tuple

from . import config
from . import compositor
from . import image_fetcher
from . import planner
from . import writer

# ── Types ──────────────────────────────────────────────────────────────────────

SlideResult = Tuple[Path, str, str]   # (image_path, headline, body)
ProgressFn  = Callable[[float, str], None]


class PipelineResult:
    """Holds everything produced by a single generation run."""
    __slots__ = ("session_dir", "slides", "content", "structure", "zip_path")

    def __init__(self):
        self.session_dir: Optional[Path] = None
        self.slides: List[SlideResult] = []
        self.content: Optional[writer.CreativeContent] = None
        self.structure: Optional[planner.PostStructure] = None
        self.zip_path: Optional[Path] = None


# ── Helpers ────────────────────────────────────────────────────────────────────

def _session_dir() -> Path:
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    d = config.OUTPUT_DIR / ts
    d.mkdir(parents=True, exist_ok=True)
    return d


def _noop(_f: float, _m: str) -> None:
    pass


def _make_zip(session: Path, slides: List[SlideResult]) -> Path:
    zip_path = session / "slides.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for path, _h, _b in slides:
            zf.write(path, path.name)
    return zip_path


# ── Core pipeline ──────────────────────────────────────────────────────────────

def stream(
    topic: str,
    tone: str | None = None,
    style: str | None = None,
    num_slides: int | None = None,
    on_progress: ProgressFn | None = None,
) -> Generator[SlideResult, None, PipelineResult]:
    """
    Generator that yields (image_path, headline, body) per slide.

    Return value (via StopIteration.value) is a PipelineResult with the
    full content, structure, paths, and ZIP.
    """
    progress = on_progress or _noop
    result = PipelineResult()
    session = _session_dir()
    result.session_dir = session

    # ── Stage 1: Structure ─────────────────────────────────────────────────
    progress(0.03, "Analysing your topic…")
    structure = planner.create_structure(
        topic, tone=tone, style=style, num_slides=num_slides,
    )
    result.structure = structure

    (session / "structure.json").write_text(
        json.dumps(structure, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    # ── Stage 2: Creative writing ──────────────────────────────────────────
    progress(0.10, "Writing creative content…")
    content = writer.write_content(
        topic=topic,
        tone=structure["tone"],
        style=structure["style"],
        post_type=structure["post_type"],
        num_slides=structure["num_slides"],
    )
    result.content = content

    (session / "content.json").write_text(
        json.dumps(content, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    n = len(content["slides"])
    vis_style = structure.get("style", "cinematic")
    base_seed = random.randint(1, 100_000)

    for i, slide in enumerate(content["slides"]):
        num = i + 1
        frac = 0.20 + 0.75 * (i / n)

        # ── Stage 3: Fetch image ───────────────────────────────────────────
        progress(frac, f"Generating image {num}/{n}…")
        if i > 0:
            time.sleep(2)  # pace requests for Pollinations rate limits
        raw_img = image_fetcher.fetch_image(
            prompt=slide["image_prompt"],
            style=vis_style,
            seed=base_seed + i,
        )

        # ── Stage 4: Compose ───────────────────────────────────────────────
        progress(frac + 0.03, f"Compositing slide {num}…")
        final_img = compositor.compose_slide(
            image=raw_img,
            headline=slide["headline"],
            body=slide.get("body", ""),
            position=slide.get("text_position", "bottom"),
            text_size=slide.get("text_size", "medium"),
            slide_number=num,
            total_slides=n,
        )

        # ── Stage 5: Save ─────────────────────────────────────────────────
        out = session / f"slide_{num:02d}.jpg"
        final_img.save(out, "JPEG", quality=95, optimize=True)

        slide_result = (out, slide["headline"], slide.get("body", ""))
        result.slides.append(slide_result)
        yield slide_result

    result.zip_path = _make_zip(session, result.slides)
    progress(1.0, "Done!")
    return result


def run(
    topic: str,
    tone: str | None = None,
    style: str | None = None,
    num_slides: int | None = None,
    on_progress: ProgressFn | None = None,
) -> PipelineResult:
    """Blocking wrapper that collects all slides and returns PipelineResult."""
    gen = stream(topic, tone=tone, style=style,
                 num_slides=num_slides, on_progress=on_progress)
    try:
        while True:
            next(gen)
    except StopIteration as exc:
        return exc.value
