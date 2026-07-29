import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { goalDuplicateSchema } from "@/lib/validation";
import { jsonError, parseJson, zodError } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

// Clones a goal as a reusable template, for recurring campaigns (an annual
// awareness day, a yearly budget-season letter round...). Copies the action
// checklist, likely stakeholders and indicator definitions, but resets
// everything tied to a specific past run: dates, statuses and stance
// history reset, attachments/deadlines/commitments aren't carried over.
export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = goalDuplicateSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const original = await prisma.advocacyGoal.findUnique({
    where: { id },
    include: { subtasks: true, goalContacts: true, indicators: true },
  });
  if (!original) return jsonError("Goal not found", 404);

  const created = await prisma.advocacyGoal.create({
    data: {
      name: parsed.data.name,
      kind: original.kind,
      responsible: original.responsible,
      category: original.category,
      description: original.description,
      targetDate: null,
      status: "NOT_STARTED",
      effortScore: original.effortScore,
      impactScore: original.impactScore,
      subtasks: {
        create: original.subtasks.map((s) => ({
          name: s.name,
          actionType: s.actionType,
          isPlanned: s.isPlanned,
          dueDate: null,
          status: "PENDING",
          responsible: s.responsible,
          notes: s.notes,
          contactId: s.contactId,
        })),
      },
      goalContacts: {
        create: original.goalContacts.map((gc) => ({
          contactId: gc.contactId,
          relation: gc.relation,
          notes: gc.notes,
        })),
      },
      indicators: {
        create: original.indicators.map((i) => ({
          name: i.name,
          targetValue: i.targetValue,
          currentValue: 0,
          unit: i.unit,
          notes: i.notes,
        })),
      },
    },
  });

  return NextResponse.json(created, { status: 201 });
}
