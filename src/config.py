import os
from pathlib import Path
from typing import List, Optional, Union
from dotenv import load_dotenv

load_dotenv()

# ── SSL ───────────────────────────────────────────────────────────────────────
_SSL_VERIFY_RAW = os.getenv("SSL_VERIFY", "true").strip().lower()
SSL_VERIFY: bool = _SSL_VERIFY_RAW not in ("0", "false", "no", "off")

# ── LLM ───────────────────────────────────────────────────────────────────────
GROQ_API_KEY: Optional[str] = os.getenv("GROQ_API_KEY")
GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")
GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GEMINI_MODEL: str = "gemini-1.5-flash"

# ── Output ────────────────────────────────────────────────────────────────────
OUTPUT_DIR: Path = Path(os.getenv("OUTPUT_DIR", "output"))

# ── Image ─────────────────────────────────────────────────────────────────────
IMAGE_WIDTH: int = int(os.getenv("IMAGE_WIDTH", "1080"))
IMAGE_HEIGHT: int = int(os.getenv("IMAGE_HEIGHT", "1080"))
# API fetch size — smaller = cheaper on Pollinations; upscaled to output size locally
FETCH_WIDTH: int = int(os.getenv("FETCH_WIDTH", "768"))
FETCH_HEIGHT: int = int(os.getenv("FETCH_HEIGHT", "768"))

# ── Pollinations ──────────────────────────────────────────────────────────────
POLLINATIONS_API_KEY: Optional[str] = os.getenv("POLLINATIONS_API_KEY")
POLLINATIONS_MODEL: str = os.getenv("POLLINATIONS_MODEL", "flux")
POLLINATIONS_BASE_URL = "https://gen.pollinations.ai/image"
POLLINATIONS_TIMEOUT = 90  # seconds – image gen can be slow

# ── Font search order (Windows → Linux → macOS) ────────────────────────────────
FONT_CANDIDATES: List[str] = [
    r"C:\Windows\Fonts\arialbd.ttf",   # Windows – Arial Bold
    r"C:\Windows\Fonts\arial.ttf",     # Windows – Arial
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",  # Linux
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/System/Library/Fonts/Helvetica.ttc",  # macOS
    "/Library/Fonts/Arial Bold.ttf",
]


def ssl_verify() -> Union[bool, str]:
    """
    Return the verify argument for httpx / requests.

    Uses the certifi CA bundle by default. Set SSL_VERIFY=false in .env
    if you're behind a corporate proxy that breaks certificate validation.
    """
    if not SSL_VERIFY:
        return False
    try:
        import certifi
        return certifi.where()
    except ImportError:
        return True


def pollinations_status() -> tuple:
    """
    Return (ready: bool, message: str) for image generation setup.
    """
    key = POLLINATIONS_API_KEY
    if key and key not in ("your_pollinations_api_key_here", ""):
        return True, f"pollinations ({POLLINATIONS_MODEL})"
    return False, (
        "Image generation needs a free Pollinations API key. "
        "Register at https://enter.pollinations.ai and set `POLLINATIONS_API_KEY` in `.env`."
    )


def llm_status() -> tuple:
    """
    Return (ready: bool, backend_or_message: str).
    Does not raise — safe for UI startup checks.
    """
    if GROQ_API_KEY and GROQ_API_KEY != "your_groq_api_key_here":
        return True, "groq"
    if GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
        return True, "gemini"
    return False, (
        "No LLM API key found. Copy `.env.example` to `.env` and set "
        "`GROQ_API_KEY` (free at https://console.groq.com), then restart the app."
    )


def active_llm() -> str:
    """Return which LLM backend is available: 'groq', 'gemini', or raise."""
    ready, backend_or_msg = llm_status()
    if ready:
        return backend_or_msg
    raise EnvironmentError(backend_or_msg)
