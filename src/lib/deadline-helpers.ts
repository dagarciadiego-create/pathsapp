import { utcMidnight } from "./date-utils";

// Same UTC-day-granularity rule as goal/calendar overdue checks (see
// lib/goal-helpers.ts and lib/calendar-helpers.ts): not overdue on the due
// day itself, only starting the day after, and only while still OPEN.
export function isDeadlineOverdue(deadline: { dueDate: Date | string; status: string }) {
  if (deadline.status !== "OPEN") return false;
  return utcMidnight(deadline.dueDate) < utcMidnight(new Date());
}

export function isDeadlineDueSoon(
  deadline: { dueDate: Date | string; status: string },
  withinDays = 30
) {
  if (deadline.status !== "OPEN") return false;
  const dueMs = utcMidnight(deadline.dueDate);
  const todayMs = utcMidnight(new Date());
  return dueMs >= todayMs && dueMs <= todayMs + withinDays * 86_400_000;
}
