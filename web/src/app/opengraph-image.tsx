import { ImageResponse } from "next/og";

// Branded 1200×630 social card shown when the homepage is shared on
// X, LinkedIn, Slack, iMessage, etc. Uses next/og's built-in font so it
// renders reliably inside the standalone Docker build (no fs font reads).
export const alt = "Prompt2Post – The AI content studio for Instagram creators";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "radial-gradient(900px 600px at 80% -10%, rgba(103,80,248,0.45), transparent), linear-gradient(135deg, #0a0a0f 0%, #14101f 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "linear-gradient(135deg, #7c6cff, #6750f8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 38,
              fontWeight: 800,
            }}
          >
            P2
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5 }}>
            Prompt2Post
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 920,
            }}
          >
            One topic in. A whole carousel out.
          </div>
          <div style={{ fontSize: 32, color: "rgba(255,255,255,0.66)", maxWidth: 880 }}>
            The AI content studio that plans, writes, designs, and schedules your
            Instagram posts.
          </div>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {["AI carousels", "On-brand copy", "AI images", "Captions + hashtags"].map(
            (tag) => (
              <div
                key={tag}
                style={{
                  fontSize: 24,
                  color: "rgba(255,255,255,0.75)",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  borderRadius: 999,
                  padding: "10px 22px",
                }}
              >
                {tag}
              </div>
            ),
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
