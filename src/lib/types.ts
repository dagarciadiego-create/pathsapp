import type {
  AdvocacyGoal,
  Contact,
  Subtask,
  Indicator,
} from "@/generated/prisma/client";

export type GoalListItem = AdvocacyGoal & {
  subtasks: Pick<Subtask, "status">[];
  _count: { contacts: number; indicators: number };
};

export type GoalDetail = AdvocacyGoal & {
  contacts: Contact[];
  subtasks: Subtask[];
  indicators: Indicator[];
};

export type IndicatorWithGoal = Indicator & {
  goal: { id: string; name: string } | null;
};

export type { AdvocacyGoal, Contact, Subtask, Indicator };
