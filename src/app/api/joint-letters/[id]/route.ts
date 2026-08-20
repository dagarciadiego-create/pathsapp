import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jointLetterUpdateSchema } from "@/lib/validation";
import { isRecordNotFoundError, jsonError, parseJson, zodError } from "@/lib/api-utils";
import { requireTeamApi } from "@/lib/team-api";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const { id } = await params;
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = jointLetterUpdateSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const { goalId, sentDate, ...rest } = parsed.data;

  if (goalId) {
    const goal = await prisma.advocacyGoal.findFirst({ where: { id: goalId, team } });
    if (!goal) return jsonError("Goal not found", 404);
  }

  const jointLetter = await prisma.jointLetter
    .update({
      where: { id, team },
      data: {
        ...rest,
        ...(goalId !== undefined ? { goalId: goalId || null } : {}),
        ...(sentDate !== undefined ? { sentDate: sentDate ? new Date(sentDate) : null } : {}),
      },
    })
    .catch((err) => {
      if (isRecordNotFoundError(err)) return null;
      throw err;
    });

  if (!jointLetter) return jsonError("Joint letter not found", 404);
  return NextResponse.json(jointLetter);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const { id } = await params;
  const deleted = await prisma.jointLetter
    .delete({ where: { id, team } }).catch((err) => {
    if (isRecordNotFoundError(err)) return null;
    throw err;
  });
  if (!deleted) return jsonError("Joint letter not found", 404);
  return NextResponse.json({ ok: true });
}
