import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { spokespersonUpdateSchema } from "@/lib/validation";
import { isRecordNotFoundError, jsonError, parseJson, zodError } from "@/lib/api-utils";
import { requireTeamApi } from "@/lib/team-api";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const { id } = await params;
  const { data, error } = await parseJson(request);
  if (error) return error;

  const parsed = spokespersonUpdateSchema.safeParse(data);
  if (!parsed.success) return zodError(parsed.error);

  const spokesperson = await prisma.spokesperson
    .update({ where: { id, team }, data: parsed.data })
    .catch((err) => {
      if (isRecordNotFoundError(err)) return null;
      throw err;
    });

  if (!spokesperson) return jsonError("Spokesperson not found", 404);
  return NextResponse.json(spokesperson);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const { id } = await params;
  const deleted = await prisma.spokesperson
    .delete({ where: { id, team } }).catch((err) => {
    if (isRecordNotFoundError(err)) return null;
    throw err;
  });
  if (!deleted) return jsonError("Spokesperson not found", 404);
  return NextResponse.json({ ok: true });
}
