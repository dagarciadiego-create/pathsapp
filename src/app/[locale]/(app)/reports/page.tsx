import { setRequestLocale } from "next-intl/server";
import { getReportSummary } from "@/lib/reports";
import { ReportsPage } from "@/components/reports-page";

export const dynamic = "force-dynamic";

export default async function Reports({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const summary = await getReportSummary();

  return <ReportsPage summary={summary} />;
}
