"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary for errors thrown in the root layout itself. Renders its
 * own <html>/<body> because the normal layout has failed. Route-level errors are
 * handled by the nicer dashboard/error.tsx boundary instead.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root error boundary:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#08080d", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "1.5rem",
            gap: "1rem",
          }}
        >
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0 }}>Something went wrong</h1>
          <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: 420, margin: 0 }}>
            An unexpected error occurred. Try again — if it keeps happening, refresh the page.
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: "#5530ef",
              color: "#fff",
              border: "none",
              padding: "0.7rem 1.4rem",
              borderRadius: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
