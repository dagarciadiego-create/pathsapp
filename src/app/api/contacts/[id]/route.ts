import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactUpdateSchema } from "@/lib/validation";
import { jsonError, parseJson, zodError } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = contactUpdateSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const contact = await prisma.contact
    .update({ where: { id }, data: parsed.data })
    .catch(() => null);

  if (!contact) return jsonError("Contact not found", 404);
  return NextResponse.json(contact);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const deleted = await prisma.contact.delete({ where: { id } }).catch(() => null);
  if (!deleted) return jsonError("Contact not found", 404);
  return NextResponse.json({ ok: true });
}
