import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireTeam } from "@/lib/team-session";
import { IndicatorsTable } from "@/components/indicators-table";

export const dynamic = "force-dynamic";

export default async function IndicatorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const team = await requireTeam(locale);

  const [indicators, goals] = await Promise.all([
    prisma.indicator.findMany({
      where: { team },
      include: { goal: { select: { id: true, name: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.advocacyGoal.findMany({
      where: { team },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return <IndicatorsTable initialIndicators={indicators} goals={goals} />;
}
