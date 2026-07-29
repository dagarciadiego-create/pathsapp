import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { goalContactUpdateSchema } from "@/lib/validation";
import { jsonError, parseJson, zodError } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

// Update a goal<->contact link: the relation type / link-specific notes,
// and optionally the underlying directory contact's own fields.
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = goalContactUpdateSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const existing = await prisma.goalContact.findUnique({ where: { id } });
  if (!existing) return jsonError("Link not found", 404);

  const { contact, stance, stanceNote, ...linkFields } = parsed.data;

  const goalContact = await prisma.$transaction(async (tx) => {
    if (contact) {
      await tx.contact.update({ where: { id: existing.contactId }, data: contact });
    }
    // A stance change is appended to the history rather than only
    // overwriting the current value, so movement over time can be charted.
    if (stance) {
      await tx.stanceChange.create({
        data: { goalContactId: id, stance, note: stanceNote },
      });
    }
    return tx.goalContact.update({
      where: { id },
      data: { ...linkFields, ...(stance ? { stance } : {}) },
      include: { contact: true, stanceHistory: { orderBy: { changedAt: "desc" } } },
    });
  });

  return NextResponse.json(goalContact);
}

// Unlink the contact from this goal (the contact itself stays in the
// shared directory for other goals).
export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const deleted = await prisma.goalContact.delete({ where: { id } }).catch(() => null);
  if (!deleted) return jsonError("Link not found", 404);
  return NextResponse.json({ ok: true });
}
