import type { AdvocacyGoal, Subtask } from "@/generated/prisma/client";

export type GoalWithSubtasks = AdvocacyGoal & { subtasks: Subtask[] };

export function computeGoalProgress(subtasks: Pick<Subtask, "status">[]) {
  const total = subtasks.length;
  const done = subtasks.filter((s) => s.status === "DONE").length;
  const percent = total > 0 ? Math.round((done / total) * 100) : null;
  return { done, total, percent };
}

export function isGoalOverdue(goal: Pick<AdvocacyGoal, "targetDate" | "status">) {
  if (!goal.targetDate) return false;
  if (goal.status === "ACHIEVED" || goal.status === "CANCELLED") return false;
  return new Date(goal.targetDate).getTime() < Date.now();
}

export function formatDate(date: Date | string | null | undefined, locale: string) {
  if (!date) return null;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatIndicatorValue(value: number, unit: string | null | undefined, locale: string) {
  const formattedValue = new Intl.NumberFormat(locale).format(value);
  if (!unit) return formattedValue;
  return unit.trim().startsWith("%") ? `${formattedValue}${unit}` : `${formattedValue} ${unit}`;
}
