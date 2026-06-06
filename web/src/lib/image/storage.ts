import { mkdir, writeFile } from "fs/promises";
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

export async function uploadSlideImage(
  postId: string,
  slideNumber: number,
  buffer: Buffer
): Promise<string> {
  const filename = `slide_${String(slideNumber).padStart(2, "0")}.jpg`;
  const relativePath = `posts/${postId}/${filename}`;
  const fullPath = path.join(STORAGE_ROOT, relativePath);

  await ensureDir(path.dirname(fullPath));
  await writeFile(fullPath, buffer);

  return publicUrl(relativePath);
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
