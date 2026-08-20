import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { petitionVersionInputSchema } from "@/lib/validation";
import { jsonError, parseJson, zodError } from "@/lib/api-utils";
import { requireTeamApi } from "@/lib/team-api";

type Params = { params: Promise<{ id: string }> };

// Adds a new version rather than editing an existing one, so the
// evolution of a petition's wording stays visible instead of being
// silently overwritten.
export async function POST(request: Request, { params }: Params) {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const { id: petitionId } = await params;
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = petitionVersionInputSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const petition = await prisma.petition.findFirst({ where: { id: petitionId, team } });
  if (!petition) return jsonError("Petition not found", 404);

  const version = await prisma.petitionVersion.create({
    data: { ...parsed.data, petitionId },
  });

  return NextResponse.json(version, { status: 201 });
}
