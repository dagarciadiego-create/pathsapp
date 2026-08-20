import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { spokespersonInputSchema } from "@/lib/validation";
import { parseJson, zodError } from "@/lib/api-utils";
import { requireTeamApi } from "@/lib/team-api";

export async function GET() {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const spokespeople = await prisma.spokesperson.findMany({ where: { team }, orderBy: { name: "asc" } });
  return NextResponse.json(spokespeople);
}

export async function POST(request: Request) {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = spokespersonInputSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const spokesperson = await prisma.spokesperson.create({ data: { ...parsed.data, team } });
  return NextResponse.json(spokesperson, { status: 201 });
}
