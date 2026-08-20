import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { positionInputSchema } from "@/lib/validation";
import { parseJson, zodError } from "@/lib/api-utils";
import { requireTeamApi } from "@/lib/team-api";

export async function GET() {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const positions = await prisma.position.findMany({
    where: { team },
    include: {
      holders: { include: { contact: true }, orderBy: { startDate: "desc" } },
    },
    orderBy: { title: "asc" },
  });

  return NextResponse.json(positions);
}

export async function POST(request: Request) {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = positionInputSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const position = await prisma.position.create({ data: { ...parsed.data, team } });
  return NextResponse.json(position, { status: 201 });
}
