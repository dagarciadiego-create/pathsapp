import { AppShell } from "@/components/app-shell";
import { requireTeam } from "@/lib/team-session";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Every page under (app) also requires a team, but gating the layout
  // means a page added later without that check still can't render.
  const team = await requireTeam(locale);
  return <AppShell team={team}>{children}</AppShell>;
}
