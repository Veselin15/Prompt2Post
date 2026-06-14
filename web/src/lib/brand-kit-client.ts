import type { BrandKit } from "@/types";

export interface BrandKitPayload {
  tone: string;
  style: string;
  format: string;
  template: string;
  accent: string;
  handle: string;
  textAmount: string;
  fontTheme: string;
  headlineCase: string;
  textAlign: string;
  language: string;
}

export async function saveBrandKit(payload: BrandKitPayload): Promise<BrandKit> {
  const res = await fetch("/api/brand-kit", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Could not save your Brand Kit");
  const data = (await res.json()) as { brandKit: BrandKit };
  return data.brandKit;
}

export async function clearBrandKit(): Promise<void> {
  const res = await fetch("/api/brand-kit", { method: "DELETE" });
  if (!res.ok) throw new Error("Could not clear your Brand Kit");
}
