import type { AdvocacyGoal } from "./types";

// Classic impact/effort prioritization matrix. Scores are on a 1-5 scale;
// 4-5 counts as "high" on either axis so a genuine "3 out of 5" (an
// average score) doesn't get inflated into a false top or bottom bucket.
export const TRIAGE_QUADRANTS = [
  "QUICK_WIN",
  "MAJOR_PROJECT",
  "FILL_IN",
  "THANKLESS",
] as const;
export type TriageQuadrant = (typeof TRIAGE_QUADRANTS)[number];

export function triageQuadrant(
  goal: Pick<AdvocacyGoal, "effortScore" | "impactScore">
): TriageQuadrant | null {
  if (goal.effortScore == null || goal.impactScore == null) return null;
  const highImpact = goal.impactScore >= 4;
  const highEffort = goal.effortScore >= 4;
  if (highImpact) return highEffort ? "MAJOR_PROJECT" : "QUICK_WIN";
  return highEffort ? "THANKLESS" : "FILL_IN";
}

// Within a quadrant, surface the most time-sensitive goals first; goals
// with no target date sort last rather than first (an unscheduled goal
// isn't more urgent than a dated one).
export function compareByUrgency(
  a: Pick<AdvocacyGoal, "targetDate">,
  b: Pick<AdvocacyGoal, "targetDate">
) {
  if (!a.targetDate && !b.targetDate) return 0;
  if (!a.targetDate) return 1;
  if (!b.targetDate) return -1;
  return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
}
