import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Prompt2Post – AI content studio for Instagram creators",
    short_name: "Prompt2Post",
    description:
      "Type one topic and get a scroll-stopping Instagram carousel — AI plans, writes, designs, and schedules it.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#6750f8",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
