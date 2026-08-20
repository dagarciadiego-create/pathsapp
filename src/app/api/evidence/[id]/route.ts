import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { evidenceUpdateSchema } from "@/lib/validation";
import { isRecordNotFoundError, jsonError, parseJson, zodError } from "@/lib/api-utils";
import { requireTeamApi } from "@/lib/team-api";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const { id } = await params;
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = evidenceUpdateSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const { petitionId, ...rest } = parsed.data;

  if (petitionId) {
    const petition = await prisma.petition.findFirst({ where: { id: petitionId, team } });
    if (!petition) return jsonError("Petition not found", 404);
  }

  const evidence = await prisma.evidence
    .update({
      where: { id, team },
      data: { ...rest, ...(petitionId !== undefined ? { petitionId: petitionId || null } : {}) },
    })
    .catch((err) => {
      if (isRecordNotFoundError(err)) return null;
      throw err;
    });

  if (!evidence) return jsonError("Evidence not found", 404);
  return NextResponse.json(evidence);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const { id } = await params;
  const deleted = await prisma.evidence.delete({ where: { id, team } }).catch((err) => {
    if (isRecordNotFoundError(err)) return null;
    throw err;
  });
  if (!deleted) return jsonError("Evidence not found", 404);
  return NextResponse.json({ ok: true });
}
