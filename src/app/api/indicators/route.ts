import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { indicatorInputSchema } from "@/lib/validation";
import { jsonError, parseJson, zodError } from "@/lib/api-utils";
import { requireTeamApi } from "@/lib/team-api";

export async function GET() {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const indicators = await prisma.indicator.findMany({
    where: { team },
    include: { goal: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(indicators);
}

export async function POST(request: Request) {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = indicatorInputSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const { goalId, ...rest } = parsed.data;

  if (goalId) {
    const goal = await prisma.advocacyGoal.findFirst({ where: { id: goalId, team } });
    if (!goal) return jsonError("Goal not found", 404);
  }

  const indicator = await prisma.indicator.create({
    data: { ...rest, team, goalId: goalId || null },
  });

  return NextResponse.json(indicator, { status: 201 });
}
