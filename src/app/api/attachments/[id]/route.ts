import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api-utils";
import { deleteStoredFile } from "@/lib/storage";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const attachment = await prisma.attachment.delete({ where: { id } }).catch(() => null);
  if (!attachment) return jsonError("Attachment not found", 404);
  await deleteStoredFile(attachment.storageKey);
  return NextResponse.json({ ok: true });
}
