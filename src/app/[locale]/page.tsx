import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { GoalsBoard } from "@/components/goals-board";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const goals = await prisma.advocacyGoal.findMany({
    include: {
      subtasks: { select: { status: true } },
      _count: { select: { contacts: true, indicators: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <GoalsBoard initialGoals={goals} />;
}
