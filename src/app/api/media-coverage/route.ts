import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mediaCoverageInputSchema } from "@/lib/validation";
import { jsonError, parseJson, zodError } from "@/lib/api-utils";

export async function GET() {
  const items = await prisma.mediaCoverage.findMany({
    include: { goal: { select: { id: true, name: true } } },
    orderBy: { publishedDate: "desc" },
  });

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = mediaCoverageInputSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const { goalId, publishedDate, ...rest } = parsed.data;

  if (goalId) {
    const goal = await prisma.advocacyGoal.findUnique({ where: { id: goalId } });
    if (!goal) return jsonError("Goal not found", 404);
  }

  const item = await prisma.mediaCoverage.create({
    data: {
      ...rest,
      goalId: goalId || null,
      publishedDate: new Date(publishedDate),
    },
  });

  return NextResponse.json(item, { status: 201 });
}
