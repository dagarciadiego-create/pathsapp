import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
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

  const [subtasks, goals] = await Promise.all([
    prisma.subtask.findMany({
      where: { dueDate: { not: null } },
      include: { goal: { select: { id: true, name: true } } },
    }),
    prisma.advocacyGoal.findMany({
      where: { targetDate: { not: null } },
      select: { id: true, name: true, targetDate: true, status: true },
    }),
  ]);

  const events = buildCalendarEvents(subtasks, goals);

  return <CalendarView events={events} />;
}
