import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { strategicDateInputSchema } from "@/lib/validation";
import { parseJson, zodError } from "@/lib/api-utils";

export async function GET() {
  const strategicDates = await prisma.strategicDate.findMany({ orderBy: { date: "asc" } });
  return NextResponse.json(strategicDates);
}

export async function POST(request: Request) {
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = strategicDateInputSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const { date, ...rest } = parsed.data;
  const strategicDate = await prisma.strategicDate.create({
    data: { ...rest, date: new Date(date) },
  });

  return NextResponse.json(strategicDate, { status: 201 });
}
