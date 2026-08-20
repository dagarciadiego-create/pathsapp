import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deadlineInputSchema } from "@/lib/validation";
import { jsonError, parseJson, zodError } from "@/lib/api-utils";
import { requireTeamApi } from "@/lib/team-api";

export async function GET() {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const deadlines = await prisma.deadline.findMany({
    where: { team },
    include: { goal: { select: { id: true, name: true } } },
    orderBy: { dueDate: "asc" },
  });
  return NextResponse.json(deadlines);
}

export async function POST(request: Request) {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = deadlineInputSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const { goalId, dueDate, ...rest } = parsed.data;

  if (goalId) {
    const goal = await prisma.advocacyGoal.findFirst({ where: { id: goalId, team } });
    if (!goal) return jsonError("Goal not found", 404);
  }

  const deadline = await prisma.deadline.create({
    data: { ...rest, team, goalId: goalId || null, dueDate: new Date(dueDate) },
    include: { goal: { select: { id: true, name: true } } },
  });

  return NextResponse.json(deadline, { status: 201 });
}
