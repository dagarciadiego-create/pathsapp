import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { goalContactLinkSchema } from "@/lib/validation";
import { isUniqueConstraintError, jsonError, parseJson, zodError } from "@/lib/api-utils";
import { requireTeamApi } from "@/lib/team-api";

type Params = { params: Promise<{ id: string }> };

// Link a directory contact to a goal. The request body either references
// an existing contact by id, or creates a brand new directory contact and
// links it in the same step.
export async function POST(request: Request, { params }: Params) {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const { id: goalId } = await params;
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = goalContactLinkSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const goal = await prisma.advocacyGoal.findFirst({ where: { id: goalId, team } });
  if (!goal) return jsonError("Goal not found", 404);

  const { contactId, contact, relation, notes } = parsed.data;

  if (contactId) {
    const existing = await prisma.contact.findFirst({ where: { id: contactId, team } });
    if (!existing) return jsonError("Contact not found", 404);
  }

  const goalContact = await prisma.goalContact
    .create({
      data: {
        goal: { connect: { id: goalId } },
        relation,
        notes,
        contact: contactId
          ? { connect: { id: contactId } }
          : { create: { ...contact!, team } },
      },
      include: { contact: true },
    })
    .catch((err) => {
      if (isUniqueConstraintError(err)) return null;
      throw err;
    });

  if (!goalContact) {
    return jsonError("This contact is already linked to this goal", 409);
  }

  return NextResponse.json(goalContact, { status: 201 });
}
