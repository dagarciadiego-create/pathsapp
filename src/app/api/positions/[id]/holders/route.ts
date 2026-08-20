import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { positionHolderAssignSchema } from "@/lib/validation";
import { jsonError, parseJson, zodError } from "@/lib/api-utils";
import { requireTeamApi } from "@/lib/team-api";

type Params = { params: Promise<{ id: string }> };

// Assigning a new holder is a succession event, not a plain create: the
// previously open holder (endDate null, if any) is closed out at the new
// holder's start date so the position's history never has a gap or an
// overlap. Corrections to an existing holder record go through
// PATCH /api/position-holders/[id] instead, which has no such side effect.
export async function POST(request: Request, { params }: Params) {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const { id: positionId } = await params;
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = positionHolderAssignSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const position = await prisma.position.findFirst({ where: { id: positionId, team } });
  if (!position) return jsonError("Position not found", 404);

  const contact = await prisma.contact.findFirst({ where: { id: parsed.data.contactId, team } });
  if (!contact) return jsonError("Contact not found", 404);

  const startDate = new Date(parsed.data.startDate);

  const holder = await prisma.$transaction(async (tx) => {
    const openHolder = await tx.positionHolder.findFirst({
      where: { positionId, endDate: null },
    });
    if (openHolder) {
      await tx.positionHolder.update({
        where: { id: openHolder.id },
        data: { endDate: startDate },
      });
    }
    return tx.positionHolder.create({
      data: {
        positionId,
        contactId: parsed.data.contactId,
        startDate,
        notes: parsed.data.notes,
      },
      include: { contact: true },
    });
  });

  return NextResponse.json(holder, { status: 201 });
}
