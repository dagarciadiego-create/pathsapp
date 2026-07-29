import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { commitmentUpdateSchema } from "@/lib/validation";
import { isRecordNotFoundError, jsonError, parseJson, zodError } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = commitmentUpdateSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const { goalId, madeDate, followUpDate, ...rest } = parsed.data;

  if (goalId) {
    const goal = await prisma.advocacyGoal.findUnique({ where: { id: goalId } });
    if (!goal) return jsonError("Goal not found", 404);
  }

  const commitment = await prisma.commitment
    .update({
      where: { id },
      data: {
        ...rest,
        ...(goalId !== undefined ? { goalId: goalId || null } : {}),
        ...(madeDate !== undefined ? { madeDate: new Date(madeDate) } : {}),
        ...(followUpDate !== undefined
          ? { followUpDate: followUpDate ? new Date(followUpDate) : null }
          : {}),
      },
      include: { goal: { select: { id: true, name: true } } },
    })
    .catch((err) => {
      if (isRecordNotFoundError(err)) return null;
      throw err;
    });

  if (!commitment) return jsonError("Commitment not found", 404);
  return NextResponse.json(commitment);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const deleted = await prisma.commitment.delete({ where: { id } }).catch((err) => {
    if (isRecordNotFoundError(err)) return null;
    throw err;
  });
  if (!deleted) return jsonError("Commitment not found", 404);
  return NextResponse.json({ ok: true });
}
