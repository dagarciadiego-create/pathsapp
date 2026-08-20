import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jointLetterCosignerUpdateSchema } from "@/lib/validation";
import { isRecordNotFoundError, jsonError, parseJson, zodError } from "@/lib/api-utils";
import { requireTeamApi } from "@/lib/team-api";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const { id } = await params;

  // This record has no team of its own — it inherits one from its
  // parent, so ownership is checked through the relation.
  const owned = await prisma.jointLetterCosigner.findFirst({
    where: { id, jointLetter: { team } },
    select: { id: true },
  });
  if (!owned) return jsonError("Cosigner not found", 404);

  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = jointLetterCosignerUpdateSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const cosigner = await prisma.jointLetterCosigner
    .update({ where: { id }, data: parsed.data })
    .catch((err) => {
      if (isRecordNotFoundError(err)) return null;
      throw err;
    });

  if (!cosigner) return jsonError("Cosigner not found", 404);
  return NextResponse.json(cosigner);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const { id } = await params;

  // This record has no team of its own — it inherits one from its
  // parent, so ownership is checked through the relation.
  const owned = await prisma.jointLetterCosigner.findFirst({
    where: { id, jointLetter: { team } },
    select: { id: true },
  });
  if (!owned) return jsonError("Cosigner not found", 404);

  const deleted = await prisma.jointLetterCosigner.delete({ where: { id } }).catch((err) => {
    if (isRecordNotFoundError(err)) return null;
    throw err;
  });
  if (!deleted) return jsonError("Cosigner not found", 404);
  return NextResponse.json({ ok: true });
}
