import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireTeam } from "@/lib/team-session";
import { GoalDetailView } from "@/components/goal-detail-view";

export const dynamic = "force-dynamic";

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const team = await requireTeam(locale);

  const [goal, directoryContacts] = await Promise.all([
    prisma.advocacyGoal.findFirst({
      where: { id, team },
      include: {
        goalContacts: {
          include: { contact: true, stanceHistory: { orderBy: { changedAt: "desc" } } },
          orderBy: { createdAt: "asc" },
        },
        subtasks: { include: { attachments: true }, orderBy: { createdAt: "asc" } },
        indicators: { orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.contact.findMany({ where: { team }, orderBy: { name: "asc" } }),
  ]);

  if (!goal) notFound();

  return <GoalDetailView goal={goal} directoryContacts={directoryContacts} />;
}
