import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jointLetterCosignerInputSchema } from "@/lib/validation";
import { jsonError, parseJson, zodError } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id: jointLetterId } = await params;
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = jointLetterCosignerInputSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const jointLetter = await prisma.jointLetter.findUnique({ where: { id: jointLetterId } });
  if (!jointLetter) return jsonError("Joint letter not found", 404);

  const cosigner = await prisma.jointLetterCosigner.create({
    data: { ...parsed.data, jointLetterId },
  });

  return NextResponse.json(cosigner, { status: 201 });
}
