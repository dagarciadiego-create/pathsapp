import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { GoalDetailView } from "@/components/goal-detail-view";

export const dynamic = "force-dynamic";

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [goal, directoryContacts] = await Promise.all([
    prisma.advocacyGoal.findUnique({
      where: { id },
      include: {
        goalContacts: {
          include: { contact: true, stanceHistory: { orderBy: { changedAt: "desc" } } },
          orderBy: { createdAt: "asc" },
        },
        subtasks: { include: { attachments: true }, orderBy: { createdAt: "asc" } },
        indicators: { orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.contact.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!goal) notFound();

  return <GoalDetailView goal={goal} directoryContacts={directoryContacts} />;
}
