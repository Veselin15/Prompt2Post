import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { getPostById } from "@/lib/db";
import { readSlideImage } from "@/lib/image/storage";

export const runtime = "nodejs";

/**
 * Assemble the post's composited slides into a single PDF — one page per
 * slide, page size = image size. LinkedIn renders PDFs as swipeable
 * document-post carousels, so this is the native LinkedIn export.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const post = await getPostById(id);
  if (!post || post.user_id !== userId) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const pdf = await PDFDocument.create();
  pdf.setTitle(post.topic);
  pdf.setProducer("Prompt2Post");

  let pages = 0;
  for (let n = 1; n <= post.num_slides; n++) {
    const buffer = await readSlideImage(id, n);
    if (!buffer) continue;
    const image = await pdf.embedJpg(buffer);
    const page = pdf.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    pages++;
  }

  if (pages === 0) {
    return NextResponse.json(
      { error: "No slide images found for this post" },
      { status: 404 }
    );
  }

  const bytes = await pdf.save();
  const filename =
    post.topic.replace(/[^\p{L}\p{N} _-]/gu, "").trim().slice(0, 60).replace(/\s+/g, "_") ||
    "carousel";

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
