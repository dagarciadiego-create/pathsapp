import { setRequestLocale } from "next-intl/server";
import { getReportData } from "@/lib/reports";
import { ReportsPage } from "@/components/reports-page";

export const dynamic = "force-dynamic";

export default async function Reports({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { summary } = await getReportData();

  return <ReportsPage summary={summary} />;
}
