import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { goalUpdateSchema } from "@/lib/validation";
import { jsonError, parseJson, zodError } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const goal = await prisma.advocacyGoal.findUnique({
    where: { id },
    include: {
      goalContacts: { include: { contact: true }, orderBy: { createdAt: "asc" } },
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

  const { targetDate, ...rest } = parsed.data;
  const goal = await prisma.advocacyGoal
    .update({
      where: { id },
      data: {
        ...rest,
        ...(targetDate !== undefined
          ? { targetDate: targetDate ? new Date(targetDate) : null }
          : {}),
      },
    })
    .catch(() => null);

  if (!goal) return jsonError("Goal not found", 404);
  return NextResponse.json(goal);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const deleted = await prisma.advocacyGoal.delete({ where: { id } }).catch(() => null);
  if (!deleted) return jsonError("Goal not found", 404);
  return NextResponse.json({ ok: true });
}
