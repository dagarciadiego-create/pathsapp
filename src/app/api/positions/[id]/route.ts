import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { positionUpdateSchema } from "@/lib/validation";
import { isRecordNotFoundError, jsonError, parseJson, zodError } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = positionUpdateSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const position = await prisma.position
    .update({ where: { id }, data: parsed.data })
    .catch((err) => {
      if (isRecordNotFoundError(err)) return null;
      throw err;
    });

  if (!position) return jsonError("Position not found", 404);
  return NextResponse.json(position);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const deleted = await prisma.position.delete({ where: { id } }).catch((err) => {
    if (isRecordNotFoundError(err)) return null;
    throw err;
  });
  if (!deleted) return jsonError("Position not found", 404);
  return NextResponse.json({ ok: true });
}
