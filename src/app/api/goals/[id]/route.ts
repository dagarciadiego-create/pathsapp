import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { goalUpdateSchema } from "@/lib/validation";
import { isRecordNotFoundError, jsonError, parseJson, zodError } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const goal = await prisma.advocacyGoal.findUnique({
    where: { id },
    include: {
      goalContacts: {
        include: { contact: true, stanceHistory: { orderBy: { changedAt: "desc" } } },
        orderBy: { createdAt: "asc" },
      },
      subtasks: { include: { attachments: true }, orderBy: { createdAt: "asc" } },
      indicators: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!goal) return jsonError("Goal not found", 404);
  return NextResponse.json(goal);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = goalUpdateSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const existing = await prisma.advocacyGoal.findUnique({ where: { id }, select: { status: true } });
  if (!existing) return jsonError("Goal not found", 404);

  const { targetDate, ...rest } = parsed.data;
  // achievedAt tracks the real moment status last became ACHIEVED, so the
  // outcome-chain narrative doesn't have to fake a date from updatedAt
  // (which changes on any unrelated edit). Reopening a goal clears it.
  const nextStatus = rest.status ?? existing.status;
  const achievedAtUpdate =
    nextStatus === "ACHIEVED" && existing.status !== "ACHIEVED"
      ? { achievedAt: new Date() }
      : nextStatus !== "ACHIEVED" && existing.status === "ACHIEVED"
        ? { achievedAt: null }
        : {};

  const goal = await prisma.advocacyGoal
    .update({
      where: { id },
      data: {
        ...rest,
        ...(targetDate !== undefined
          ? { targetDate: targetDate ? new Date(targetDate) : null }
          : {}),
        ...achievedAtUpdate,
      },
    })
    .catch((err) => {
      if (isRecordNotFoundError(err)) return null;
      throw err;
    });

  if (!goal) return jsonError("Goal not found", 404);
  return NextResponse.json(goal);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const deleted = await prisma.advocacyGoal.delete({ where: { id } }).catch((err) => {
    if (isRecordNotFoundError(err)) return null;
    throw err;
  });
  if (!deleted) return jsonError("Goal not found", 404);
  return NextResponse.json({ ok: true });
}
