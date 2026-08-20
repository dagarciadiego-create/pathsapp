import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api-utils";
import { requireTeamApi } from "@/lib/team-api";
import { INLINE_RENDERABLE_MIME_TYPES, readStoredFile } from "@/lib/storage";

type Params = { params: Promise<{ id: string }> };

function asciiFallback(filename: string) {
  // Content-Disposition's filename= must be ASCII; non-ASCII names are
  // still carried correctly via filename*= (RFC 5987).
  return filename.replace(/[^\x20-\x7E]/g, "_");
}

export async function GET(_request: Request, { params }: Params) {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const { id } = await params;
  // The attachment has no team of its own — it inherits one through
  // its subtask, so ownership is checked through the relation.
  const attachment = await prisma.attachment.findFirst({
    where: { id, subtask: { OR: [{ goal: { team } }, { contact: { team } }] } },
  });
  if (!attachment) return jsonError("Attachment not found", 404);

  const buffer = await readStoredFile(attachment.storageKey).catch(() => null);
  if (!buffer) return jsonError("File missing on disk", 404);

  const disposition = INLINE_RENDERABLE_MIME_TYPES.has(attachment.mimeType) ? "inline" : "attachment";

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": attachment.mimeType,
      "Content-Length": String(attachment.size),
      "Content-Disposition": `${disposition}; filename="${asciiFallback(attachment.filename)}"; filename*=UTF-8''${encodeURIComponent(attachment.filename)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}
