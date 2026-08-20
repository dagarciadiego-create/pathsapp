import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api-utils";
import {
  ALLOWED_ATTACHMENT_MIME_TYPES,
  MAX_ATTACHMENT_SIZE,
  saveUploadedFile,
} from "@/lib/storage";
import { requireTeamApi } from "@/lib/team-api";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const { id: subtaskId } = await params;

  // The subtask has no team of its own — it inherits one from its
  // parent, so ownership is checked through the relation.
  const subtask = await prisma.subtask.findFirst({
    where: { id: subtaskId, OR: [{ goal: { team } }, { contact: { team } }] },
    select: { id: true },
  });
  if (!subtask) return jsonError("Subtask not found", 404);

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return jsonError("No file provided", 400);
  }
  if (file.size === 0) {
    return jsonError("Empty file", 400);
  }
  if (file.size > MAX_ATTACHMENT_SIZE) {
    return jsonError("File too large (max 10 MB)", 413);
  }
  if (!ALLOWED_ATTACHMENT_MIME_TYPES.has(file.type)) {
    return jsonError("Unsupported file type", 415);
  }

  const { storageKey, size } = await saveUploadedFile(file);

  const attachment = await prisma.attachment.create({
    data: {
      subtaskId,
      filename: file.name.slice(0, 255),
      mimeType: file.type,
      size,
      storageKey,
    },
  });

  return NextResponse.json(attachment, { status: 201 });
}
