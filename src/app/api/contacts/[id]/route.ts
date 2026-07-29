import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactUpdateSchema } from "@/lib/validation";
import { isRecordNotFoundError, jsonError, parseJson, zodError } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      goalLinks: {
        include: { goal: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
      interactions: {
        include: { attachments: true },
        orderBy: { createdAt: "desc" },
      },
      commitments: {
        include: { goal: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!contact) return jsonError("Contact not found", 404);
  return NextResponse.json(contact);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = contactUpdateSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const contact = await prisma.contact
    .update({ where: { id }, data: parsed.data })
    .catch((err) => {
      if (isRecordNotFoundError(err)) return null;
      throw err;
    });

  if (!contact) return jsonError("Contact not found", 404);
  return NextResponse.json(contact);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const deleted = await prisma.contact.delete({ where: { id } }).catch((err) => {
    if (isRecordNotFoundError(err)) return null;
    throw err;
  });
  if (!deleted) return jsonError("Contact not found", 404);
  return NextResponse.json({ ok: true });
}
