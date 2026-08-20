import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { petitionInputSchema } from "@/lib/validation";
import { parseJson, zodError } from "@/lib/api-utils";
import { requireTeamApi } from "@/lib/team-api";

export async function GET() {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const petitions = await prisma.petition.findMany({
    where: { team },
    include: {
      versions: { orderBy: { createdAt: "desc" } },
      evidence: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { title: "asc" },
  });

  return NextResponse.json(petitions);
}

export async function POST(request: Request) {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = petitionInputSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const petition = await prisma.petition.create({ data: { ...parsed.data, team } });
  return NextResponse.json(petition, { status: 201 });
}
