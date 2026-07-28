import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { GoalDetailView } from "@/components/goal-detail-view";

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const goal = await prisma.advocacyGoal.findUnique({
    where: { id },
    include: {
      contacts: { orderBy: { createdAt: "asc" } },
      subtasks: { orderBy: { createdAt: "asc" } },
      indicators: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!goal) notFound();

  return <GoalDetailView goal={goal} />;
}
