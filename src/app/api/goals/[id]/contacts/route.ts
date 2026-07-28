import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactInputSchema } from "@/lib/validation";
import { jsonError, parseJson, zodError } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id: goalId } = await params;
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = contactInputSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const goal = await prisma.advocacyGoal.findUnique({ where: { id: goalId } });
  if (!goal) return jsonError("Goal not found", 404);

  const contact = await prisma.contact.create({
    data: { ...parsed.data, goalId },
  });

  return NextResponse.json(contact, { status: 201 });
}
