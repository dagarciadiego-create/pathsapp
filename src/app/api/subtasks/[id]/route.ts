import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subtaskUpdateSchema } from "@/lib/validation";
import { isRecordNotFoundError, jsonError, parseJson, zodError } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = subtaskUpdateSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const { dueDate, ...rest } = parsed.data;
  const subtask = await prisma.subtask
    .update({
      where: { id },
      data: {
        ...rest,
        ...(dueDate !== undefined
          ? { dueDate: dueDate ? new Date(dueDate) : null }
          : {}),
      },
    })
    .catch((err) => {
      if (isRecordNotFoundError(err)) return null;
      throw err;
    });

  if (!subtask) return jsonError("Subtask not found", 404);
  return NextResponse.json(subtask);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const deleted = await prisma.subtask.delete({ where: { id } }).catch((err) => {
    if (isRecordNotFoundError(err)) return null;
    throw err;
  });
  if (!deleted) return jsonError("Subtask not found", 404);
  return NextResponse.json({ ok: true });
}
