import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jointLetterCosignerInputSchema } from "@/lib/validation";
import { jsonError, parseJson, zodError } from "@/lib/api-utils";
import { requireTeamApi } from "@/lib/team-api";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const { id: jointLetterId } = await params;
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = jointLetterCosignerInputSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const jointLetter = await prisma.jointLetter.findFirst({ where: { id: jointLetterId, team } });
  if (!jointLetter) return jsonError("Joint letter not found", 404);

  const cosigner = await prisma.jointLetterCosigner.create({
    data: { ...parsed.data, jointLetterId },
  });

  return NextResponse.json(cosigner, { status: 201 });
}
