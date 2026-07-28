import { getTranslations } from "next-intl/server";
import { NavHeader } from "@/components/nav-header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <FooterHint />
      </footer>
    </>
  );
}

async function FooterHint() {
  const t = await getTranslations("Footer");
  return <p>{t("installHint")}</p>;
}
