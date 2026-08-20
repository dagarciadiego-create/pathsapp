import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api-utils";
import { requireTeamApi } from "@/lib/team-api";
import { deleteStoredFile } from "@/lib/storage";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const { id } = await params;

  // This record has no team of its own — it inherits one from its
  // parent, so ownership is checked through the relation.
  const owned = await prisma.attachment.findFirst({
    where: { id, subtask: { OR: [{ goal: { team } }, { contact: { team } }] } },
    select: { id: true },
  });
  if (!owned) return jsonError("Attachment not found", 404);

  const attachment = await prisma.attachment.delete({ where: { id } }).catch(() => null);
  if (!attachment) return jsonError("Attachment not found", 404);
  await deleteStoredFile(attachment.storageKey);
  return NextResponse.json({ ok: true });
}
