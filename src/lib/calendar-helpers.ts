import { utcMidnight } from "./date-utils";

export type CalendarEvent = {
  id: string;
  date: Date;
  title: string;
  kind: "subtask" | "goalTarget" | "strategic";
  // Only subtask/goalTarget events belong to a goal; a strategic date is an
  // external milestone (a budget window, an election, an awareness day)
  // this organization doesn't own, so it has neither.
  goalId?: string;
  goalName?: string;
  status?: string;
  actionType?: string;
  isPlanned?: boolean;
  strategicKind?: string;
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

type StrategicDateForCalendar = {
  id: string;
  title: string;
  kind: string;
  date: Date;
  isRecurring: boolean;
};

// Recurring strategic dates (awareness days, a typical budget window) only
// store one month/day; this projects one occurrence per year across a
// window around "now" wide enough to cover realistic calendar navigation,
// rather than trying to render every year that ever existed.
const RECURRING_YEARS_BACK = 2;
const RECURRING_YEARS_FORWARD = 3;

export function buildStrategicEvents(
  strategicDates: StrategicDateForCalendar[],
  referenceDate: Date = new Date()
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const currentYear = referenceDate.getUTCFullYear();

  for (const sd of strategicDates) {
    const original = new Date(sd.date);
    if (!sd.isRecurring) {
      events.push({
        id: `strategic-${sd.id}`,
        date: original,
        title: sd.title,
        kind: "strategic",
        strategicKind: sd.kind,
      });
      continue;
    }
    for (
      let year = currentYear - RECURRING_YEARS_BACK;
      year <= currentYear + RECURRING_YEARS_FORWARD;
      year++
    ) {
      events.push({
        id: `strategic-${sd.id}-${year}`,
        date: new Date(Date.UTC(year, original.getUTCMonth(), original.getUTCDate())),
        title: sd.title,
        kind: "strategic",
        strategicKind: sd.kind,
      });
    }
  }

  return events;
}

export function buildCalendarEvents(
  subtasks: SubtaskForCalendar[],
  goals: GoalForCalendar[],
  strategicDates: StrategicDateForCalendar[] = []
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

  const strategicEvents = buildStrategicEvents(strategicDates);

  return [...subtaskEvents, ...goalEvents, ...strategicEvents].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
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
  return event.status !== undefined && doneStatuses.includes(event.status);
}

// A single source of truth for "is this overdue" so the calendar's per-day
// dots and its overdue list can never disagree with each other. Not
// overdue on its own due day, only starting the day after. A strategic
// date is never "overdue" — it's an external milestone, not a task this
// organization can miss.
export function isEventOverdue(event: CalendarEvent, now: Date = new Date()) {
  if (event.kind === "strategic") return false;
  return !isEventDone(event) && utcMidnight(event.date) < utcMidnight(now);
}

// The "next 30 days" / "overdue" panels are about actionable work, so
// strategic milestones (shown on the grid itself instead) are excluded.
export function upcomingEvents(events: CalendarEvent[], withinDays = 30) {
  const now = new Date();
  const todayMs = utcMidnight(now);
  const endMs = todayMs + withinDays * 86_400_000;
  return events.filter((e) => {
    if (e.kind === "strategic" || isEventDone(e)) return false;
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
