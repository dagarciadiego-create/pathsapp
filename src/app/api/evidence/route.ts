import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { evidenceInputSchema } from "@/lib/validation";
import { jsonError, parseJson, zodError } from "@/lib/api-utils";

export async function POST(request: Request) {
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = evidenceInputSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const { petitionId, ...rest } = parsed.data;

  if (petitionId) {
    const petition = await prisma.petition.findUnique({ where: { id: petitionId } });
    if (!petition) return jsonError("Petition not found", 404);
  }

  const evidence = await prisma.evidence.create({
    data: { ...rest, petitionId: petitionId || null },
  });

  return NextResponse.json(evidence, { status: 201 });
}
