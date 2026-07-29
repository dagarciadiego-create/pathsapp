import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { strategicDateUpdateSchema } from "@/lib/validation";
import { isRecordNotFoundError, jsonError, parseJson, zodError } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = strategicDateUpdateSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const { date, ...rest } = parsed.data;
  const strategicDate = await prisma.strategicDate
    .update({
      where: { id },
      data: { ...rest, ...(date !== undefined ? { date: new Date(date) } : {}) },
    })
    .catch((err) => {
      if (isRecordNotFoundError(err)) return null;
      throw err;
    });

  if (!strategicDate) return jsonError("Strategic date not found", 404);
  return NextResponse.json(strategicDate);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const deleted = await prisma.strategicDate.delete({ where: { id } }).catch((err) => {
    if (isRecordNotFoundError(err)) return null;
    throw err;
  });
  if (!deleted) return jsonError("Strategic date not found", 404);
  return NextResponse.json({ ok: true });
}
