import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { goalContactLinkSchema } from "@/lib/validation";
import { jsonError, parseJson, zodError } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

// Link a directory contact to a goal. The request body either references
// an existing contact by id, or creates a brand new directory contact and
// links it in the same step.
export async function POST(request: Request, { params }: Params) {
  const { id: goalId } = await params;
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = goalContactLinkSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const goal = await prisma.advocacyGoal.findUnique({ where: { id: goalId } });
  if (!goal) return jsonError("Goal not found", 404);

  const { contactId, contact, relation, notes } = parsed.data;

  if (contactId) {
    const existing = await prisma.contact.findUnique({ where: { id: contactId } });
    if (!existing) return jsonError("Contact not found", 404);
  }

  const goalContact = await prisma.goalContact
    .create({
      data: {
        goal: { connect: { id: goalId } },
        relation,
        notes,
        contact: contactId ? { connect: { id: contactId } } : { create: contact! },
      },
      include: { contact: true },
    })
    .catch(() => null);

  if (!goalContact) {
    return jsonError("This contact is already linked to this goal", 409);
  }

  return NextResponse.json(goalContact, { status: 201 });
}
