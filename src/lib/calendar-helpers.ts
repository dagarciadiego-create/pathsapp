export type CalendarEvent = {
  id: string;
  date: Date;
  title: string;
  kind: "subtask" | "goalTarget";
  goalId: string;
  goalName: string;
  status: string;
  actionType?: string;
  isPlanned?: boolean;
};

type SubtaskForCalendar = {
  id: string;
  name: string;
  dueDate: Date | null;
  status: string;
  actionType: string;
  isPlanned: boolean;
  goal: { id: string; name: string };
};

type GoalForCalendar = {
  id: string;
  name: string;
  targetDate: Date | null;
  status: string;
};

export function buildCalendarEvents(
  subtasks: SubtaskForCalendar[],
  goals: GoalForCalendar[]
): CalendarEvent[] {
  const subtaskEvents: CalendarEvent[] = subtasks
    .filter((s) => s.dueDate)
    .map((s) => ({
      id: `subtask-${s.id}`,
      date: new Date(s.dueDate!),
      title: s.name,
      kind: "subtask",
      goalId: s.goal.id,
      goalName: s.goal.name,
      status: s.status,
      actionType: s.actionType,
      isPlanned: s.isPlanned,
    }));

  const goalEvents: CalendarEvent[] = goals
    .filter((g) => g.targetDate)
    .map((g) => ({
      id: `goal-${g.id}`,
      date: new Date(g.targetDate!),
      title: g.name,
      kind: "goalTarget",
      goalId: g.id,
      goalName: g.name,
      status: g.status,
    }));

  return [...subtaskEvents, ...goalEvents].sort((a, b) => a.date.getTime() - b.date.getTime());
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function eventsOnDay(events: CalendarEvent[], day: Date) {
  return events.filter((e) => isSameDay(e.date, day));
}

function isEventDone(event: CalendarEvent) {
  const doneStatuses = ["DONE", "ACHIEVED", "CANCELLED"];
  return doneStatuses.includes(event.status);
}

export function upcomingEvents(events: CalendarEvent[], withinDays = 30) {
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + withinDays);
  return events.filter((e) => !isEventDone(e) && e.date >= now && e.date <= end);
}

export function overdueEvents(events: CalendarEvent[]) {
  const now = new Date();
  return events.filter((e) => !isEventDone(e) && e.date < now);
}

// Monday-first 6x7 grid covering the full month (plus leading/trailing
// days from adjacent months so every week row is complete).
export function getMonthGridDays(year: number, month: number) {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7; // 0 = Monday
  const gridStart = new Date(year, month, 1 - startWeekday);

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    return date;
  });
}
