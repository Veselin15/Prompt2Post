"""
app.py – Gradio web UI for Prompt2Post v2.

Run:  python app.py
      python app.py --share
      python app.py --port 7861
"""

from __future__ import annotations

import sys
from pathlib import Path

import gradio as gr

from src import config, pipeline

if not config.SSL_VERIFY:
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# ── CSS ────────────────────────────────────────────────────────────────────────

_CSS = """
/* ── Header ── */
#header {
    text-align: center;
    padding: 28px 16px 12px;
    background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
    border-radius: 16px;
    margin-bottom: 16px;
    color: white;
    position: relative;
    overflow: hidden;
}
#header::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 20% 50%, rgba(102,126,234,0.15), transparent 60%),
                radial-gradient(circle at 80% 50%, rgba(118,75,162,0.15), transparent 60%);
}
#header h1 {
    font-size: 2.6rem;
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.5px;
    position: relative;
}
#header p {
    font-size: 1.05rem;
    opacity: 0.7;
    margin: 6px 0 0;
    position: relative;
}

/* ── Generate button ── */
#gen-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    border: none !important;
    color: white !important;
    font-size: 1.1rem !important;
    font-weight: 700 !important;
    padding: 16px !important;
    border-radius: 12px !important;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
    text-transform: none !important;
}
#gen-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(102,126,234,0.45);
}

/* ── Content preview ── */
#content-preview .prose {
    font-size: 0.92rem;
    line-height: 1.5;
}

/* ── Compact controls ── */
.compact-row { gap: 8px !important; }

/* ── Social caption box ── */
#social-caption textarea {
    font-size: 0.95rem;
    line-height: 1.55;
    background: #f8f7ff;
    border-radius: 10px;
}

/* ── Tabs ── */
.tab-nav button {
    font-weight: 600 !important;
    font-size: 0.95rem !important;
}
"""

_EXAMPLES = [
    "Gym motivation for beginners",
    "Coffee shop weekend promo",
    "Cyberpunk short story – neon rain",
    "5 productivity hacks for remote workers",
    "The history of espresso in 60 seconds",
    "Why octopuses are the smartest sea creatures",
    "Pet adoption awareness campaign",
    "How the pyramids were really built",
]

_TONES  = ["auto (let AI decide)", "inspirational", "educational", "funny", "dramatic", "professional", "promotional"]
_STYLES = ["auto (let AI decide)", "cinematic", "vibrant", "minimalist", "neon", "vintage", "dreamy", "flat", "bold"]


# ── Build UI ───────────────────────────────────────────────────────────────────

def _build_demo() -> gr.Blocks:
    with gr.Blocks(
        title="Prompt2Post",
        css=_CSS,
        theme=gr.themes.Soft(
            primary_hue=gr.themes.colors.purple,
            secondary_hue=gr.themes.colors.blue,
        ),
    ) as demo:

        # ── Header ──
        gr.HTML("""
        <div id="header">
            <h1>Prompt2Post</h1>
            <p>Type any idea — AI writes the content, creates the visuals, and builds your post</p>
        </div>
        """)

        # ── Status bar ──
        llm_ok, llm_msg = config.llm_status()
        img_ok, img_msg = config.pollinations_status()
        parts = []
        if llm_ok:
            parts.append(f"LLM `{llm_msg}`")
        else:
            parts.append(f"LLM: {llm_msg}")
        if img_ok:
            parts.append(f"Images `{img_msg}`")
        else:
            parts.append(f"Images: {img_msg}")
        if not config.SSL_VERIFY:
            parts.append("SSL off")
        gr.Markdown(" | ".join(parts))

        # ──────────────────────────────────────────────────────────────────────
        with gr.Tabs():

            # ═══════════════════ TAB 1: CREATE ════════════════════════════════
            with gr.TabItem("Create", id="create"):
                with gr.Row(equal_height=False):

                    # ── Left: inputs ──────────────────────────────────────────
                    with gr.Column(scale=1, min_width=320):

                        topic_box = gr.Textbox(
                            label="Your Idea",
                            placeholder="e.g. Why octopuses are the smartest sea creatures…",
                            lines=3,
                            max_lines=6,
                        )

                        with gr.Row(elem_classes="compact-row"):
                            tone_dd = gr.Dropdown(
                                choices=_TONES, value=_TONES[0],
                                label="Tone", allow_custom_value=True,
                            )
                            style_dd = gr.Dropdown(
                                choices=_STYLES, value=_STYLES[0],
                                label="Visual Style", allow_custom_value=True,
                            )

                        slides_slider = gr.Slider(
                            minimum=0, maximum=10, step=1, value=0,
                            label="Number of Slides (0 = let AI decide)",
                        )

                        gen_btn = gr.Button(
                            "Generate Post",
                            variant="primary",
                            size="lg",
                            elem_id="gen-btn",
                        )

                        gr.Examples(
                            examples=[[t] for t in _EXAMPLES],
                            inputs=[topic_box],
                            label="Try an example",
                            examples_per_page=8,
                        )

                    # ── Right: results ────────────────────────────────────────
                    with gr.Column(scale=2, min_width=440):

                        gallery = gr.Gallery(
                            label="Generated Slides",
                            columns=2, rows=2,
                            object_fit="cover",
                            height="auto",
                            allow_preview=True,
                        )

                        with gr.Row(elem_classes="compact-row"):
                            download_btn = gr.File(
                                label="Download ZIP",
                                visible=False,
                                interactive=False,
                            )

                        with gr.Accordion("AI-Written Content", open=True):
                            content_md = gr.Markdown(
                                value="*Generate a post to see the AI-written content here.*",
                                elem_id="content-preview",
                            )

                        with gr.Accordion("Social Media Caption", open=False):
                            social_box = gr.Textbox(
                                label="Copy-ready caption",
                                lines=5,
                                interactive=False,
                                show_copy_button=True,
                                elem_id="social-caption",
                            )

            # ═══════════════════ TAB 2: POST DETAILS ══════════════════════════
            with gr.TabItem("Post Details", id="details"):
                with gr.Row():
                    with gr.Column():
                        tone_out  = gr.Textbox(label="Tone",       interactive=False)
                        style_out = gr.Textbox(label="Style",      interactive=False)
                    with gr.Column():
                        type_out  = gr.Textbox(label="Post Type",  interactive=False)
                        mood_out  = gr.Textbox(label="Color Mood", interactive=False)
                tags_out = gr.Textbox(label="Hashtags", interactive=False, lines=2)
                hook_out = gr.Textbox(label="Hook (opening line)", interactive=False, lines=2)

        # ── Event handler ──────────────────────────────────────────────────────

        def _generate(topic, tone, style, num_slides, progress=gr.Progress(track_tqdm=False)):
            topic = (topic or "").strip()
            if not topic:
                raise gr.Error("Please enter a topic first!")

            try:
                config.active_llm()
            except EnvironmentError as exc:
                raise gr.Error(str(exc)) from exc
            ok, msg = config.pollinations_status()
            if not ok:
                raise gr.Error(msg)

            t = tone if tone and "auto" not in tone.lower() else None
            s = style if style and "auto" not in style.lower() else None
            ns = int(num_slides) if num_slides and int(num_slides) > 0 else None

            images = []
            all_headlines = []
            all_bodies = []
            result = None

            try:
                gen = pipeline.stream(
                    topic, tone=t, style=s, num_slides=ns,
                    on_progress=lambda frac, msg: progress(frac, desc=msg),
                )
            except RuntimeError as exc:
                raise gr.Error(str(exc)) from exc

            try:
                while True:
                    try:
                        path, headline, body = next(gen)
                    except RuntimeError as exc:
                        raise gr.Error(str(exc)) from exc
                    images.append(str(path))
                    all_headlines.append(headline)
                    all_bodies.append(body)

                    content_lines = []
                    for j, (h, b) in enumerate(zip(all_headlines, all_bodies)):
                        content_lines.append(f"**Slide {j+1}: {h}**")
                        if b:
                            content_lines.append(f"{b}")
                        content_lines.append("")

                    yield (
                        images,
                        "\n".join(content_lines),
                        gr.update(),  # social
                        gr.update(),  # download
                        gr.update(), gr.update(), gr.update(),
                        gr.update(), gr.update(), gr.update(),
                    )

            except StopIteration as exc:
                result = exc.value

            if result is None:
                return

            content = result.content or {}
            struct  = result.structure or {}

            content_lines = []
            for j, (h, b) in enumerate(zip(all_headlines, all_bodies)):
                content_lines.append(f"**Slide {j+1}: {h}**")
                if b:
                    content_lines.append(f"{b}")
                content_lines.append("")

            social = content.get("social_caption", "")
            tags   = "  ".join(content.get("hashtags", []))
            if tags:
                social += f"\n\n{tags}"

            zip_path = str(result.zip_path) if result.zip_path else None

            yield (
                images,
                "\n".join(content_lines),
                social,
                gr.update(value=zip_path, visible=zip_path is not None),
                struct.get("tone", "—"),
                struct.get("style", "—"),
                f"{struct.get('post_type', '—')} ({len(images)} slides)",
                struct.get("color_mood", "—"),
                tags,
                content.get("hook", "—"),
            )

        gen_btn.click(
            fn=_generate,
            inputs=[topic_box, tone_dd, style_dd, slides_slider],
            outputs=[
                gallery, content_md, social_box, download_btn,
                tone_out, style_out, type_out, mood_out, tags_out, hook_out,
            ],
        )

    return demo


# ── Entry point ────────────────────────────────────────────────────────────────

def _find_free_port(host: str, start: int, max_tries: int = 20) -> int:
    """Return the first available port at or above *start*."""
    import socket
    for port in range(start, start + max_tries):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind((host, port))
                return port
            except OSError:
                continue
    raise OSError(f"No free port found in range {start}–{start + max_tries - 1}")


def main() -> None:
    import argparse
    parser = argparse.ArgumentParser(description="Prompt2Post – Gradio UI")
    parser.add_argument("--share", action="store_true")
    parser.add_argument("--port",  type=int, default=7860,
                        help="Preferred port (default 7860; auto-picks next free port if busy)")
    parser.add_argument("--host",  default="127.0.0.1")
    args = parser.parse_args()

    port = _find_free_port(args.host, args.port)
    if port != args.port:
        print(f"Port {args.port} is busy — using {port} instead.")

    _build_demo().launch(
        server_name=args.host,
        server_port=port,
        share=args.share,
        show_error=True,
    )


if __name__ == "__main__":
    main()
