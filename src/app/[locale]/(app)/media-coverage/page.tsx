import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { MediaCoveragePage } from "@/components/media-coverage-page";

export const dynamic = "force-dynamic";

export default async function MediaCoverageRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [items, goals] = await Promise.all([
    prisma.mediaCoverage.findMany({
      include: { goal: { select: { id: true, name: true } } },
      orderBy: { publishedDate: "desc" },
    }),
    prisma.advocacyGoal.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return <MediaCoveragePage initialItems={items} goals={goals} />;
}
