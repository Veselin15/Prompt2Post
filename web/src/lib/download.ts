/**
 * Browser download helpers. Images are served same-origin from /api/files,
 * so we fetch the bytes and trigger a download with a clean filename.
 */

export async function downloadUrl(url: string, filename: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "post";

export async function downloadSlides(
  slides: { image_url?: string }[],
  topic: string
): Promise<void> {
  const base = slugify(topic);
  for (let i = 0; i < slides.length; i++) {
    const url = slides[i].image_url;
    if (!url) continue;
    await downloadUrl(url, `${base}_slide_${String(i + 1).padStart(2, "0")}.jpg`);
  }
}

export { slugify };
