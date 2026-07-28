import { utcMidnight } from "./date-utils";

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

// Compared by UTC calendar day everywhere in this module (not exact
// instant, and not the browser's local timezone): grid days, event dates,
// and "today" all need to agree on the same reference frame, or the same
// event can render as overdue in one place and upcoming in another.
export function isSameDay(a: Date, b: Date) {
  return utcMidnight(a) === utcMidnight(b);
}

export function eventsOnDay(events: CalendarEvent[], day: Date) {
  return events.filter((e) => isSameDay(e.date, day));
}

export function isEventDone(event: CalendarEvent) {
  const doneStatuses = ["DONE", "ACHIEVED", "CANCELLED"];
  return doneStatuses.includes(event.status);
}

// A single source of truth for "is this overdue" so the calendar's per-day
// dots and its overdue list can never disagree with each other. Not
// overdue on its own due day, only starting the day after.
export function isEventOverdue(event: CalendarEvent, now: Date = new Date()) {
  return !isEventDone(event) && utcMidnight(event.date) < utcMidnight(now);
}

export function upcomingEvents(events: CalendarEvent[], withinDays = 30) {
  const now = new Date();
  const todayMs = utcMidnight(now);
  const endMs = todayMs + withinDays * 86_400_000;
  return events.filter((e) => {
    if (isEventDone(e)) return false;
    const eventMs = utcMidnight(e.date);
    return eventMs >= todayMs && eventMs <= endMs;
  });
}

export function overdueEvents(events: CalendarEvent[]) {
  const now = new Date();
  return events.filter((e) => isEventOverdue(e, now));
}

// Monday-first 6x7 grid covering the full month (plus leading/trailing
// days from adjacent months so every week row is complete). Built in UTC
// so grid cells compare correctly (via isSameDay) against event dates,
// which are themselves UTC midnight.
export function getMonthGridDays(year: number, month: number) {
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const startWeekday = (firstOfMonth.getUTCDay() + 6) % 7; // 0 = Monday
  const gridStart = new Date(Date.UTC(year, month, 1 - startWeekday));

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart);
    date.setUTCDate(gridStart.getUTCDate() + i);
    return date;
  });
}
