// Workshop team identities. There are no passwords: participants pick a
// team on the login screen and everything they create is tagged with it,
// so the ten groups in the room can work in parallel on the same
// deployment without seeing or disturbing each other's data.
export const TEAMS = [
  "EQUIPO1",
  "EQUIPO2",
  "EQUIPO3",
  "EQUIPO4",
  "EQUIPO5",
  "EQUIPO6",
  "EQUIPO7",
  "EQUIPO8",
  "EQUIPO9",
  "EQUIPO10",
] as const;

export type Team = (typeof TEAMS)[number];

export const TEAM_COOKIE = "pathsapp_team";

export function isTeam(value: unknown): value is Team {
  return typeof value === "string" && (TEAMS as readonly string[]).includes(value);
}
