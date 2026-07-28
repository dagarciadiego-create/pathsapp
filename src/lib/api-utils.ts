import { NextResponse } from "next/server";
import type { z } from "zod";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
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
