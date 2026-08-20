import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mediaCoverageInputSchema } from "@/lib/validation";
import { jsonError, parseJson, zodError } from "@/lib/api-utils";
import { requireTeamApi } from "@/lib/team-api";

export async function GET() {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const items = await prisma.mediaCoverage.findMany({
    where: { team },
    include: { goal: { select: { id: true, name: true } } },
    orderBy: { publishedDate: "desc" },
  });

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = mediaCoverageInputSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const { goalId, publishedDate, ...rest } = parsed.data;

  if (goalId) {
    const goal = await prisma.advocacyGoal.findFirst({ where: { id: goalId, team } });
    if (!goal) return jsonError("Goal not found", 404);
  }

  const item = await prisma.mediaCoverage.create({
    data: {
      ...rest,
      team,
      goalId: goalId || null,
      publishedDate: new Date(publishedDate),
    },
  });

  return NextResponse.json(item, { status: 201 });
}
