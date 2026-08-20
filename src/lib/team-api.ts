import { cookies } from "next/headers";
import { TEAM_COOKIE, isTeam, type Team } from "./teams";
import { jsonError } from "./api-utils";

// Route-handler counterpart of requireTeam: returns the team, or a 401 to
// return straight to the caller. Every handler scopes its queries by this
// so one team can't read or write another team's records.
export async function requireTeamApi(): Promise<
  { team: Team; error: null } | { team: null; error: Response }
> {
  const store = await cookies();
  const value = store.get(TEAM_COOKIE)?.value;
  if (!isTeam(value)) {
    return { team: null, error: jsonError("No team selected", 401) };
  }
  return { team: value, error: null };
}
