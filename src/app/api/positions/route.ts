import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { positionInputSchema } from "@/lib/validation";
import { parseJson, zodError } from "@/lib/api-utils";

export async function GET() {
  const positions = await prisma.position.findMany({
    include: {
      holders: { include: { contact: true }, orderBy: { startDate: "desc" } },
    },
    orderBy: { title: "asc" },
  });

  return NextResponse.json(positions);
}

export async function POST(request: Request) {
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = positionInputSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const position = await prisma.position.create({ data: parsed.data });
  return NextResponse.json(position, { status: 201 });
}
