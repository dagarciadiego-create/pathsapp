import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { indicatorInputSchema } from "@/lib/validation";
import { parseJson, zodError } from "@/lib/api-utils";

export async function GET() {
  const indicators = await prisma.indicator.findMany({
    include: { goal: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(indicators);
}

export async function POST(request: Request) {
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = indicatorInputSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const { goalId, ...rest } = parsed.data;
  const indicator = await prisma.indicator.create({
    data: { ...rest, goalId: goalId || null },
  });

  return NextResponse.json(indicator, { status: 201 });
}
