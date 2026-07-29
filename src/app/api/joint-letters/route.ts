import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jointLetterInputSchema } from "@/lib/validation";
import { jsonError, parseJson, zodError } from "@/lib/api-utils";

export async function GET() {
  const jointLetters = await prisma.jointLetter.findMany({
    include: {
      goal: { select: { id: true, name: true } },
      cosigners: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(jointLetters);
}

export async function POST(request: Request) {
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = jointLetterInputSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const { goalId, sentDate, ...rest } = parsed.data;

  if (goalId) {
    const goal = await prisma.advocacyGoal.findUnique({ where: { id: goalId } });
    if (!goal) return jsonError("Goal not found", 404);
  }

  const jointLetter = await prisma.jointLetter.create({
    data: {
      ...rest,
      goalId: goalId || null,
      sentDate: sentDate ? new Date(sentDate) : null,
    },
  });

  return NextResponse.json(jointLetter, { status: 201 });
}
