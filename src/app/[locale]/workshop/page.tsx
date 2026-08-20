import { setRequestLocale } from "next-intl/server";
import { WorkshopPage } from "@/components/workshop-page";

export default async function WorkshopRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Static content only — no database read, so this page stays available
  // even if the database is briefly unreachable during a workshop.
  return <WorkshopPage />;
}
