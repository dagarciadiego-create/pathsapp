import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { petitionInputSchema } from "@/lib/validation";
import { parseJson, zodError } from "@/lib/api-utils";

export async function GET() {
  const petitions = await prisma.petition.findMany({
    include: {
      versions: { orderBy: { createdAt: "desc" } },
      evidence: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { title: "asc" },
  });

  return NextResponse.json(petitions);
}

export async function POST(request: Request) {
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = petitionInputSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const petition = await prisma.petition.create({ data: parsed.data });
  return NextResponse.json(petition, { status: 201 });
}
