import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { commitmentInputSchema } from "@/lib/validation";
import { jsonError, parseJson, zodError } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id: contactId } = await params;
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = commitmentInputSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const contact = await prisma.contact.findUnique({ where: { id: contactId } });
  if (!contact) return jsonError("Contact not found", 404);

  const { goalId, madeDate, followUpDate, ...rest } = parsed.data;

  if (goalId) {
    const goal = await prisma.advocacyGoal.findUnique({ where: { id: goalId } });
    if (!goal) return jsonError("Goal not found", 404);
  }

  const commitment = await prisma.commitment.create({
    data: {
      ...rest,
      contactId,
      goalId: goalId || null,
      madeDate: new Date(madeDate),
      followUpDate: followUpDate ? new Date(followUpDate) : null,
    },
    include: { goal: { select: { id: true, name: true } } },
  });

  return NextResponse.json(commitment, { status: 201 });
}
