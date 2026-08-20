import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireTeam } from "@/lib/team-session";
import { buildCalendarEvents } from "@/lib/calendar-helpers";
import { CalendarView } from "@/components/calendar-view";

export const dynamic = "force-dynamic";

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const team = await requireTeam(locale);

  const [subtasksRaw, goals, strategicDates] = await Promise.all([
    // Goal-less entries are contact interactions (see Contact.interactions),
    // not scheduled goal work — they show on the contact's own timeline
    // instead of this goal-focused calendar. The where clause guarantees
    // goal is non-null; the filter below just proves that to TypeScript.
    prisma.subtask.findMany({
      where: { dueDate: { not: null }, goal: { team } },
      include: { goal: { select: { id: true, name: true } } },
    }),
    prisma.advocacyGoal.findMany({
      where: { team, targetDate: { not: null } },
      select: { id: true, name: true, targetDate: true, status: true },
    }),
    prisma.strategicDate.findMany({ where: { team }, orderBy: { date: "asc" } }),
  ]);
  const subtasks = subtasksRaw.filter(
    (s): s is typeof s & { goal: { id: string; name: string } } => s.goal !== null
  );

  const events = buildCalendarEvents(subtasks, goals, strategicDates);

  return <CalendarView events={events} strategicDates={strategicDates} />;
}
