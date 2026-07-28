import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { GoalsBoard } from "@/components/goals-board";

// This page reads live data straight from the database on every request;
// it must never be statically prerendered with a build-time snapshot.
export const dynamic = "force-dynamic";

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
      _count: { select: { goalContacts: true, indicators: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <GoalsBoard initialGoals={goals} />;
}
