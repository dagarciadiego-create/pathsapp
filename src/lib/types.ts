import type {
  AdvocacyGoal,
  Contact,
  GoalContact,
  Subtask,
  Indicator,
  Attachment,
} from "@/generated/prisma/client";

export type GoalListItem = AdvocacyGoal & {
  subtasks: Pick<Subtask, "status">[];
  _count: { goalContacts: number; indicators: number };
};

export type GoalContactWithContact = GoalContact & { contact: Contact };

export type SubtaskWithAttachments = Subtask & { attachments: Attachment[] };

export type GoalDetail = AdvocacyGoal & {
  goalContacts: GoalContactWithContact[];
  subtasks: SubtaskWithAttachments[];
  indicators: Indicator[];
};

export type IndicatorWithGoal = Indicator & {
  goal: { id: string; name: string } | null;
};

export type ContactWithGoals = Contact & {
  goalLinks: (GoalContact & { goal: { id: string; name: string } })[];
};

export type { AdvocacyGoal, Contact, GoalContact, Subtask, Indicator, Attachment };
