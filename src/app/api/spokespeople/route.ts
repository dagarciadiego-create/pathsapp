import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { spokespersonInputSchema } from "@/lib/validation";
import { parseJson, zodError } from "@/lib/api-utils";

export async function GET() {
  const spokespeople = await prisma.spokesperson.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(spokespeople);
}

export async function POST(request: Request) {
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = spokespersonInputSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const spokesperson = await prisma.spokesperson.create({ data: parsed.data });
  return NextResponse.json(spokesperson, { status: 201 });
}
