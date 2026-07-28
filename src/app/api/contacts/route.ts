import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactInputSchema } from "@/lib/validation";
import { parseJson, zodError } from "@/lib/api-utils";

export async function GET() {
  const contacts = await prisma.contact.findMany({
    include: { goalLinks: { include: { goal: { select: { id: true, name: true } } } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(contacts);
}

export async function POST(request: Request) {
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = contactInputSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const contact = await prisma.contact.create({ data: parsed.data });
  return NextResponse.json(contact, { status: 201 });
}
