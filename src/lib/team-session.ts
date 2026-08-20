import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TEAM_COOKIE, isTeam, type Team } from "./teams";

// The workshop "session" is just the chosen team name in a cookie. There
// are no passwords and the cookie isn't signed: the goal is to keep ten
// groups in a room from stepping on each other's data, not to defend
// against a participant who deliberately edits their own cookie.
export async function getTeam(): Promise<Team | null> {
  const store = await cookies();
  const value = store.get(TEAM_COOKIE)?.value;
  return isTeam(value) ? value : null;
}

// For pages: bounce to the team picker when there's no valid team.
export async function requireTeam(locale: string): Promise<Team> {
  const team = await getTeam();
  if (!team) redirect(`/${locale}/login`);
  return team;
}
