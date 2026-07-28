import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { indicatorUpdateSchema } from "@/lib/validation";
import { isRecordNotFoundError, jsonError, parseJson, zodError } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = indicatorUpdateSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const { goalId, ...rest } = parsed.data;

  if (goalId) {
    const goal = await prisma.advocacyGoal.findUnique({ where: { id: goalId } });
    if (!goal) return jsonError("Goal not found", 404);
  }

  const indicator = await prisma.indicator
    .update({
      where: { id },
      data: { ...rest, ...(goalId !== undefined ? { goalId: goalId || null } : {}) },
    })
    .catch((err) => {
      if (isRecordNotFoundError(err)) return null;
      throw err;
    });

  if (!indicator) return jsonError("Indicator not found", 404);
  return NextResponse.json(indicator);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const deleted = await prisma.indicator.delete({ where: { id } }).catch((err) => {
    if (isRecordNotFoundError(err)) return null;
    throw err;
  });
  if (!deleted) return jsonError("Indicator not found", 404);
  return NextResponse.json({ ok: true });
}
