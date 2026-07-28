import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { goalInputSchema } from "@/lib/validation";
import { parseJson, zodError } from "@/lib/api-utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind");
  const status = searchParams.get("status");

  const goals = await prisma.advocacyGoal.findMany({
    where: {
      ...(kind ? { kind } : {}),
      ...(status ? { status } : {}),
    },
    include: {
      subtasks: true,
      _count: { select: { contacts: true, indicators: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(goals);
}

export async function POST(request: Request) {
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = goalInputSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const { targetDate, ...rest } = parsed.data;
  const goal = await prisma.advocacyGoal.create({
    data: {
      ...rest,
      targetDate: targetDate ? new Date(targetDate) : null,
    },
  });

  return NextResponse.json(goal, { status: 201 });
}
