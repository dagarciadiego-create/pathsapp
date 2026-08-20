import { getTranslations } from "next-intl/server";
import { NavHeader } from "@/components/nav-header";

// The chrome shared by the signed-in app and by the workshop challenges
// page, which is readable before a team is chosen (team === null).
export async function AppShell({
  team,
  children,
}: {
  team: string | null;
  children: React.ReactNode;
}) {
  const t = await getTranslations("Footer");
  return (
    <>
      <NavHeader team={team} />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <div className="space-y-1 px-4">
          <p>{t("installHint")}</p>
          <p>{t("privacyNotice", { year: new Date().getFullYear() })}</p>
        </div>
      </footer>
    </>
  );
}
