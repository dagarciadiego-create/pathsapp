import { NextResponse } from "next/server";
import type { z } from "zod";
import { Prisma } from "@/generated/prisma/client";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// Narrow "was this the expected not-found/conflict error" checks, meant to
// be used in a `.catch()` on an update/delete/create-by-id call: return
// null for the specific Prisma error code a 404/409 response should cover,
// and re-throw anything else (a dropped connection, an unrelated
// constraint violation) so it surfaces as a real 500 instead of being
// silently relabeled.
export function isRecordNotFoundError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}

export function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export function zodError(error: z.ZodError) {
  return NextResponse.json(
    { error: "Validation error", issues: error.issues },
    { status: 400 }
  );
}

export async function parseJson(request: Request) {
  try {
    return { data: await request.json(), error: null };
  } catch {
    return { data: null, error: jsonError("Invalid JSON body", 400) };
  }
}
