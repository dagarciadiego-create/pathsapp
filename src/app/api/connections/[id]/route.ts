import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isRecordNotFoundError, jsonError } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const deleted = await prisma.contactConnection.delete({ where: { id } }).catch((err) => {
    if (isRecordNotFoundError(err)) return null;
    throw err;
  });
  if (!deleted) return jsonError("Connection not found", 404);
  return NextResponse.json({ ok: true });
}
