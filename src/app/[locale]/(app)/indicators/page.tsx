import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { IndicatorsTable } from "@/components/indicators-table";

export const dynamic = "force-dynamic";

export default async function IndicatorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [indicators, goals] = await Promise.all([
    prisma.indicator.findMany({
      include: { goal: { select: { id: true, name: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.advocacyGoal.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return <IndicatorsTable initialIndicators={indicators} goals={goals} />;
}
