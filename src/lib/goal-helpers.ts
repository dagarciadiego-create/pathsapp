import type { AdvocacyGoal, Subtask } from "@/generated/prisma/client";
import { utcMidnight } from "./date-utils";

export function computeGoalProgress(subtasks: Pick<Subtask, "status">[]) {
  const total = subtasks.length;
  const done = subtasks.filter((s) => s.status === "DONE").length;
  const percent = total > 0 ? Math.round((done / total) * 100) : null;
  return { done, total, percent };
}

// Compared by UTC calendar day (not exact instant): a goal isn't overdue on
// the day it's due, only starting the day after, and this must agree with
// how dates are formatted below and with the calendar's own overdue rule.
export function isGoalOverdue(goal: Pick<AdvocacyGoal, "targetDate" | "status">) {
  if (!goal.targetDate) return false;
  if (goal.status === "ACHIEVED" || goal.status === "CANCELLED") return false;
  return utcMidnight(goal.targetDate) < utcMidnight(new Date());
}

export function formatDate(date: Date | string | null | undefined, locale: string) {
  if (!date) return null;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

export function percentOf(indicator: { targetValue: number; currentValue: number }) {
  if (indicator.targetValue <= 0) return 0;
  return Math.round((indicator.currentValue / indicator.targetValue) * 100);
}

export function formatIndicatorValue(value: number, unit: string | null | undefined, locale: string) {
  const formattedValue = new Intl.NumberFormat(locale).format(value);
  if (!unit) return formattedValue;
  return unit.trim().startsWith("%") ? `${formattedValue}${unit}` : `${formattedValue} ${unit}`;
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
