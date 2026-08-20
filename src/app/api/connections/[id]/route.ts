import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isRecordNotFoundError, jsonError } from "@/lib/api-utils";
import { requireTeamApi } from "@/lib/team-api";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const { id } = await params;

  // This record has no team of its own — it inherits one from its
  // parent, so ownership is checked through the relation.
  const owned = await prisma.contactConnection.findFirst({
    where: { id, contactA: { team } },
    select: { id: true },
  });
  if (!owned) return jsonError("Connection not found", 404);

  const deleted = await prisma.contactConnection.delete({ where: { id } }).catch((err) => {
    if (isRecordNotFoundError(err)) return null;
    throw err;
  });
  if (!deleted) return jsonError("Connection not found", 404);
  return NextResponse.json({ ok: true });
}
