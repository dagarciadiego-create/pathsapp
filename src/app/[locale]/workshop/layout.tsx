import { AppShell } from "@/components/app-shell";
import { getTeam } from "@/lib/team-session";

// Deliberately outside (app): the challenges are the reading material for
// the workshop, so a participant can read them before being assigned a
// team. Everything the nav links to is still gated.
export default async function WorkshopLayout({ children }: { children: React.ReactNode }) {
  return <AppShell team={await getTeam()}>{children}</AppShell>;
}
