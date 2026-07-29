// Shared "enum-like" values, kept as plain strings (not native Postgres
// enums) so the allowed values can evolve without a migration; validated
// at the application boundary instead.

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

export const STANCE_VALUES = [
  "CHAMPION",
  "FRIENDLY",
  "NEUTRAL",
  "SKEPTICAL",
  "OPPOSED",
] as const;
export type Stance = (typeof STANCE_VALUES)[number];

export const COMMITMENT_STATUSES = ["PENDING", "FULFILLED", "BROKEN"] as const;
export type CommitmentStatus = (typeof COMMITMENT_STATUSES)[number];

export const DEADLINE_KINDS = [
  "PUBLIC_CONSULTATION",
  "HEARING",
  "AMENDMENT",
  "OTHER",
] as const;
export type DeadlineKind = (typeof DEADLINE_KINDS)[number];

export const DEADLINE_STATUSES = ["OPEN", "SUBMITTED", "MISSED", "CANCELLED"] as const;
export type DeadlineStatus = (typeof DEADLINE_STATUSES)[number];

export const STRATEGIC_DATE_KINDS = [
  "BUDGET",
  "ELECTION",
  "AWARENESS_DAY",
  "LEGISLATIVE",
  "OTHER",
] as const;
export type StrategicDateKind = (typeof STRATEGIC_DATE_KINDS)[number];

export const COSIGNER_STATUSES = ["INVITED", "CONFIRMED", "DECLINED", "SIGNED"] as const;
export type CosignerStatus = (typeof COSIGNER_STATUSES)[number];

export const MEDIA_TONES = ["POSITIVE", "NEUTRAL", "NEGATIVE"] as const;
export type MediaTone = (typeof MEDIA_TONES)[number];
