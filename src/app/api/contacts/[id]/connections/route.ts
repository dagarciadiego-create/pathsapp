import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactConnectionInputSchema } from "@/lib/validation";
import { jsonError, parseJson, zodError } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id: contactId } = await params;
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = contactConnectionInputSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const { otherContactId, description } = parsed.data;
  if (otherContactId === contactId) {
    return jsonError("A contact cannot be connected to itself", 400);
  }

  const [contact, otherContact] = await Promise.all([
    prisma.contact.findUnique({ where: { id: contactId } }),
    prisma.contact.findUnique({ where: { id: otherContactId } }),
  ]);
  if (!contact || !otherContact) return jsonError("Contact not found", 404);

  const connection = await prisma.contactConnection.create({
    data: { contactAId: contactId, contactBId: otherContactId, description },
    include: { contactA: true, contactB: true },
  });

  return NextResponse.json(connection, { status: 201 });
}
