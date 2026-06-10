/**
 * Tiny dependency-free confetti burst for celebratory moments
 * (post generated, post published). Client-only.
 */
const COLORS = ["#8176fc", "#c084fc", "#f0abfc", "#fbbf24", "#34d399", "#60a5fa"];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vr: number;
}

export function fireConfetti(): void {
  if (typeof document === "undefined") return;
  // Respect reduced-motion preference.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  const cx = canvas.width / 2;
  const cy = canvas.height * 0.35;
  const particles: Particle[] = Array.from({ length: 110 }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 5 + Math.random() * 9;
    return {
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      size: 4 + Math.random() * 5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
    };
  });

  const start = performance.now();
  const DURATION = 1600;

  function frame(now: number) {
    const t = now - start;
    if (t > DURATION || !ctx) {
      canvas.remove();
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const fade = 1 - t / DURATION;
    for (const p of particles) {
      p.vy += 0.22; // gravity
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vr;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
