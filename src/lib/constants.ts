// Shared "enum-like" values. SQLite has no native enum type, so these are
// plain strings in the database, validated at the application boundary.

export const GOAL_KINDS = ["ACTION", "OUTCOME"] as const;
export type GoalKind = (typeof GOAL_KINDS)[number];

export const GOAL_STATUSES = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "ACHIEVED",
  "STALLED",
  "CANCELLED",
] as const;
export type GoalStatus = (typeof GOAL_STATUSES)[number];

export const CONTACT_RELATIONS = ["DECISION_MAKER", "SUPPORTER"] as const;
export type ContactRelation = (typeof CONTACT_RELATIONS)[number];

export const ACTION_TYPES = [
  "LETTER",
  "CALL",
  "MEETING",
  "ENCOUNTER",
  "CAMPAIGN",
  "OTHER",
] as const;
export type ActionType = (typeof ACTION_TYPES)[number];

export const SUBTASK_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "DONE",
  "CANCELLED",
] as const;
export type SubtaskStatus = (typeof SUBTASK_STATUSES)[number];
