import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { strategicDateInputSchema } from "@/lib/validation";
import { parseJson, zodError } from "@/lib/api-utils";
import { requireTeamApi } from "@/lib/team-api";

export async function GET() {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const strategicDates = await prisma.strategicDate.findMany({ where: { team }, orderBy: { date: "asc" } });
  return NextResponse.json(strategicDates);
}

export async function POST(request: Request) {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = strategicDateInputSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const { date, ...rest } = parsed.data;
  const strategicDate = await prisma.strategicDate.create({
    data: { ...rest, team, date: new Date(date) },
  });

  return NextResponse.json(strategicDate, { status: 201 });
}
