import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { interactionInputSchema } from "@/lib/validation";
import { jsonError, parseJson, zodError } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

// Log an interaction (letter, call, meeting, encounter...) from the
// contact's side. Unlike POST /api/goals/[id]/subtasks, the goal link here
// is optional — a relationship-building interaction doesn't always have a
// specific goal behind it yet.
export async function POST(request: Request, { params }: Params) {
  const { id: contactId } = await params;
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = interactionInputSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const contact = await prisma.contact.findUnique({ where: { id: contactId } });
  if (!contact) return jsonError("Contact not found", 404);

  const { goalId, dueDate, ...rest } = parsed.data;

  if (goalId) {
    const goal = await prisma.advocacyGoal.findUnique({ where: { id: goalId } });
    if (!goal) return jsonError("Goal not found", 404);
  }

  const interaction = await prisma.subtask.create({
    data: {
      ...rest,
      contactId,
      goalId: goalId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
    include: { attachments: true },
  });

  return NextResponse.json(interaction, { status: 201 });
}
