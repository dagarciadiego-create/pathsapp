import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { TriagePage } from "@/components/triage-page";

export const dynamic = "force-dynamic";

export default async function TriageRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const goals = await prisma.advocacyGoal.findMany({
    where: { status: { notIn: ["ACHIEVED", "CANCELLED"] } },
    select: {
      id: true,
      name: true,
      kind: true,
      status: true,
      category: true,
      targetDate: true,
      effortScore: true,
      impactScore: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return <TriagePage goals={goals} />;
}
