import { mkdir, writeFile, readFile, rm, readdir, stat } from "fs/promises";
import path from "path";
import JSZip from "jszip";

const STORAGE_ROOT = path.join(process.cwd(), "storage");

function publicUrl(relativePath: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/api/files/${relativePath}`;
}

async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true });
}

function slideFilename(slideNumber: number): string {
  return `slide_${String(slideNumber).padStart(2, "0")}.jpg`;
}

function backgroundFilename(slideNumber: number): string {
  return `bg_${String(slideNumber).padStart(2, "0")}.jpg`;
}

export async function uploadSlideImage(
  postId: string,
  slideNumber: number,
  buffer: Buffer
): Promise<string> {
  const relativePath = `posts/${postId}/${slideFilename(slideNumber)}`;
  const fullPath = path.join(STORAGE_ROOT, relativePath);

  await ensureDir(path.dirname(fullPath));
  await writeFile(fullPath, buffer);

  return publicUrl(relativePath);
}

/**
 * Persist the raw AI background (no text overlay) so a slide's copy can later be
 * re-composited cheaply — without another image-generation call. Stored next to
 * the composited slide as `bg_NN.jpg`.
 */
export async function uploadSlideBackground(
  postId: string,
  slideNumber: number,
  buffer: Buffer
): Promise<void> {
  const fullPath = path.join(STORAGE_ROOT, `posts/${postId}/${backgroundFilename(slideNumber)}`);
  await ensureDir(path.dirname(fullPath));
  await writeFile(fullPath, buffer);
}

/** Read a stored raw background, or null when one was never saved (older posts). */
export async function readSlideBackground(
  postId: string,
  slideNumber: number
): Promise<Buffer | null> {
  try {
    return await readFile(path.join(STORAGE_ROOT, `posts/${postId}/${backgroundFilename(slideNumber)}`));
  } catch {
    return null;
  }
}

/** Read a composited slide image back from disk (used when rebuilding a ZIP). */
export async function readSlideImage(
  postId: string,
  slideNumber: number
): Promise<Buffer | null> {
  try {
    return await readFile(path.join(STORAGE_ROOT, `posts/${postId}/${slideFilename(slideNumber)}`));
  } catch {
    return null;
  }
}

export async function uploadZip(
  postId: string,
  imageBuffers: { name: string; data: Buffer }[]
): Promise<string> {
  const zip = new JSZip();
  for (const { name, data } of imageBuffers) {
    zip.file(name, data);
  }
  const zipBuffer = Buffer.from(
    await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" })
  );

  const relativePath = `posts/${postId}/slides.zip`;
  const fullPath = path.join(STORAGE_ROOT, relativePath);

  await ensureDir(path.dirname(fullPath));
  await writeFile(fullPath, zipBuffer);

  return publicUrl(relativePath);
}

/**
 * Rebuild the downloadable ZIP from the composited slides currently on disk.
 * Best-effort: returns the existing/new URL, skipping any slide that can't be read.
 */
export async function rebuildZip(postId: string, slideCount: number): Promise<string> {
  const buffers: { name: string; data: Buffer }[] = [];
  for (let n = 1; n <= slideCount; n++) {
    const data = await readSlideImage(postId, n);
    if (data) buffers.push({ name: slideFilename(n), data });
  }
  return uploadZip(postId, buffers);
}

/**
 * Delete expired `demo-*` folders left behind by the anonymous try-it endpoint.
 * Those runs are never written to the database, so their images are the only
 * trace of them and nothing references one once the visitor leaves the page.
 * Best-effort — a failure here is logged by the caller, never fatal.
 */
export async function pruneDemoFiles(maxAgeMs = 24 * 60 * 60 * 1000): Promise<number> {
  const root = path.join(STORAGE_ROOT, "posts");
  let removed = 0;
  let entries: string[];
  try {
    entries = await readdir(root);
  } catch {
    return 0; // storage dir doesn't exist yet
  }

  const cutoff = Date.now() - maxAgeMs;
  for (const name of entries) {
    if (!name.startsWith("demo-")) continue;
    const dir = path.join(root, name);
    try {
      const info = await stat(dir);
      if (info.mtimeMs < cutoff) {
        await rm(dir, { recursive: true, force: true });
        removed++;
      }
    } catch {
      // Raced with another prune, or unreadable — skip it.
    }
  }
  return removed;
}

/** Remove every file belonging to a post (called when the post is deleted). */
export async function deletePostFiles(postId: string): Promise<void> {
  const dir = path.join(STORAGE_ROOT, "posts", postId);
  await rm(dir, { recursive: true, force: true });
}
