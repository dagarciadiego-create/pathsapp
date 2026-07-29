import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { positionHolderUpdateSchema } from "@/lib/validation";
import { isRecordNotFoundError, jsonError, parseJson, zodError } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

// Plain corrections to a holder record (fix a date, add a note, or set
// endDate to record a departure with no successor yet) — no auto-close
// side effects, unlike POST /api/positions/[id]/holders.
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = positionHolderUpdateSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const { startDate, endDate, ...rest } = parsed.data;
  const holder = await prisma.positionHolder
    .update({
      where: { id },
      data: {
        ...rest,
        ...(startDate !== undefined ? { startDate: new Date(startDate) } : {}),
        ...(endDate !== undefined ? { endDate: endDate ? new Date(endDate) : null } : {}),
      },
    })
    .catch((err) => {
      if (isRecordNotFoundError(err)) return null;
      throw err;
    });

  if (!holder) return jsonError("Position holder not found", 404);
  return NextResponse.json(holder);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const deleted = await prisma.positionHolder.delete({ where: { id } }).catch((err) => {
    if (isRecordNotFoundError(err)) return null;
    throw err;
  });
  if (!deleted) return jsonError("Position holder not found", 404);
  return NextResponse.json({ ok: true });
}
