import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireTeam } from "@/lib/team-session";
import { DeadlinesPage } from "@/components/deadlines-page";

export const dynamic = "force-dynamic";

export default async function DeadlinesRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const team = await requireTeam(locale);

  const [deadlines, goals] = await Promise.all([
    prisma.deadline.findMany({
      where: { team },
      include: { goal: { select: { id: true, name: true } } },
      orderBy: { dueDate: "asc" },
    }),
    prisma.advocacyGoal.findMany({
      where: { team },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return <DeadlinesPage initialDeadlines={deadlines} goals={goals} />;
}
