"""
main.py – CLI entry point for Prompt2Post v2.

Usage:
    python main.py "Gym motivation for beginners"
    python main.py "Coffee shop promo" --tone promotional --style vibrant
    python main.py "Octopus facts" --slides 5 --open
    python main.py --ui
"""

from __future__ import annotations

import argparse
import os
import sys

from rich.console import Console
from rich.panel import Panel
from rich.progress import (
    BarColumn, Progress, SpinnerColumn,
    TaskProgressColumn, TextColumn, TimeElapsedColumn,
)
from rich.table import Table

console = Console()


def _banner() -> None:
    console.print(Panel.fit(
        "[bold magenta]Prompt2Post[/bold magenta]\n"
        "[dim]Type any idea — AI writes the content, creates the visuals, builds your post[/dim]",
        border_style="magenta", padding=(0, 4),
    ))


def _open_folder(path: str) -> None:
    if sys.platform == "win32":
        os.startfile(path)
    elif sys.platform == "darwin":
        os.system(f'open "{path}"')
    else:
        os.system(f'xdg-open "{path}"')


def cli_main(topic: str, tone=None, style=None, num_slides=None, auto_open=False) -> None:
    from src import config, pipeline

    _banner()

    try:
        backend = config.active_llm()
    except EnvironmentError as exc:
        console.print(f"[bold red]Config error:[/bold red] {exc}")
        sys.exit(1)

    console.print(f"[dim]LLM backend → [bold]{backend}[/bold][/dim]\n")

    with Progress(
        SpinnerColumn(), TextColumn("[progress.description]{task.description}"),
        BarColumn(), TaskProgressColumn(), TimeElapsedColumn(),
        console=console, transient=False,
    ) as prog:
        task = prog.add_task("Starting…", total=100)

        def on_progress(frac, msg):
            prog.update(task, completed=int(frac * 100), description=msg)

        result = pipeline.run(
            topic, tone=tone, style=style,
            num_slides=num_slides, on_progress=on_progress,
        )

    # Summary
    console.print()
    content = result.content or {}
    struct  = result.structure or {}

    t = Table(title="Post Plan", border_style="blue", show_header=False, padding=(0, 2))
    t.add_column("Key",   style="bold cyan",  no_wrap=True)
    t.add_column("Value", style="white")
    t.add_row("Tone",       struct.get("tone", "—"))
    t.add_row("Style",      struct.get("style", "—"))
    t.add_row("Post Type",  struct.get("post_type", "—"))
    t.add_row("Slides",     str(len(result.slides)))
    t.add_row("Color Mood", struct.get("color_mood", "—"))
    t.add_row("Hashtags",   "  ".join(content.get("hashtags", [])))
    console.print(t)

    console.print()
    if content.get("hook"):
        console.print(Panel(
            f"[italic]{content['hook']}[/italic]",
            title="[bold]Hook[/bold]", border_style="yellow", padding=(0, 2),
        ))

    console.print()
    slide_lines = []
    for path, headline, body in result.slides:
        entry = f"[bold]{headline}[/bold]"
        if body:
            entry += f"\n  [dim]{body}[/dim]"
        slide_lines.append(entry)
    console.print(Panel(
        "\n\n".join(slide_lines),
        title="[bold]Slides[/bold]", border_style="green", padding=(0, 2),
    ))

    if result.session_dir:
        console.print(f"\n[dim]Output:[/dim] [underline cyan]{result.session_dir}[/underline cyan]")
    if result.zip_path:
        console.print(f"[dim]ZIP:[/dim]    [underline cyan]{result.zip_path}[/underline cyan]")
    if auto_open and result.session_dir:
        _open_folder(str(result.session_dir))


def main() -> None:
    parser = argparse.ArgumentParser(prog="prompt2post")
    parser.add_argument("topic", nargs="?")
    parser.add_argument("--tone", help="Force tone (inspirational, educational, funny, etc.)")
    parser.add_argument("--style", help="Force visual style (cinematic, neon, vintage, etc.)")
    parser.add_argument("--slides", type=int, help="Force slide count (1-10)")
    parser.add_argument("--open", action="store_true", help="Open output folder")
    parser.add_argument("--ui", action="store_true", help="Launch web UI")
    parser.add_argument("--share", action="store_true")
    parser.add_argument("--port", type=int, default=7860)
    args = parser.parse_args()

    if args.ui:
        import app as gradio_app
        _banner()
        gradio_app._build_demo().launch(
            server_name="127.0.0.1", server_port=args.port,
            share=args.share, show_error=True,
        )
        return

    if not args.topic:
        parser.print_help()
        console.print("\n[yellow]Tip:[/yellow] Run [bold]python main.py --ui[/bold] for the web interface.")
        sys.exit(0)

    cli_main(args.topic, tone=args.tone, style=args.style,
             num_slides=args.slides, auto_open=args.open)


if __name__ == "__main__":
    main()
