"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TEAM_COOKIE, isTeam } from "@/lib/teams";
import { routing } from "@/i18n/routing";

const ONE_DAY_SECONDS = 60 * 60 * 24;

function safeLocale(value: FormDataEntryValue | null): string {
  const locale = typeof value === "string" ? value : "";
  return (routing.locales as readonly string[]).includes(locale)
    ? locale
    : routing.defaultLocale;
}

export async function selectTeam(formData: FormData) {
  const team = formData.get("team");
  const locale = safeLocale(formData.get("locale"));

  if (!isTeam(team)) {
    redirect(`/${locale}/login?error=1`);
  }

  const store = await cookies();
  store.set(TEAM_COOKIE, team, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // A workshop runs in a day; no point keeping the choice longer.
    maxAge: ONE_DAY_SECONDS,
  });

  redirect(`/${locale}`);
}
