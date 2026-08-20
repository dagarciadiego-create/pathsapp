import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { goalInputSchema } from "@/lib/validation";
import { parseJson, zodError } from "@/lib/api-utils";
import { requireTeamApi } from "@/lib/team-api";

export async function GET(request: Request) {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind");
  const status = searchParams.get("status");

  const goals = await prisma.advocacyGoal.findMany({
    where: {
      team,
      ...(kind ? { kind } : {}),
      ...(status ? { status } : {}),
    },
    include: {
      subtasks: { select: { status: true } },
      _count: { select: { goalContacts: true, indicators: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(goals);
}

export async function POST(request: Request) {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = goalInputSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const { targetDate, ...rest } = parsed.data;
  const goal = await prisma.advocacyGoal.create({
    data: {
      ...rest,
      team,
      targetDate: targetDate ? new Date(targetDate) : null,
      achievedAt: rest.status === "ACHIEVED" ? new Date() : null,
    },
  });

  return NextResponse.json(goal, { status: 201 });
}
