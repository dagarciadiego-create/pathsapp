import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { petitionUpdateSchema } from "@/lib/validation";
import { isRecordNotFoundError, jsonError, parseJson, zodError } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = petitionUpdateSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const petition = await prisma.petition
    .update({ where: { id }, data: parsed.data })
    .catch((err) => {
      if (isRecordNotFoundError(err)) return null;
      throw err;
    });

  if (!petition) return jsonError("Petition not found", 404);
  return NextResponse.json(petition);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const deleted = await prisma.petition.delete({ where: { id } }).catch((err) => {
    if (isRecordNotFoundError(err)) return null;
    throw err;
  });
  if (!deleted) return jsonError("Petition not found", 404);
  return NextResponse.json({ ok: true });
}
