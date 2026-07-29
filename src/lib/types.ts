import type {
  AdvocacyGoal,
  Contact,
  GoalContact,
  Subtask,
  Indicator,
  Attachment,
  Commitment,
  StanceChange,
} from "@/generated/prisma/client";

export type GoalListItem = AdvocacyGoal & {
  subtasks: Pick<Subtask, "status">[];
  _count: { goalContacts: number; indicators: number };
};

export type GoalContactWithContact = GoalContact & { contact: Contact };

export type GoalContactWithStanceHistory = GoalContactWithContact & {
  stanceHistory: StanceChange[];
};

// A contact's own link to a goal — no need to re-embed the contact itself,
// since the page already knows which contact this is.
export type GoalLinkWithStanceHistory = GoalContact & {
  goal: { id: string; name: string };
  stanceHistory: StanceChange[];
};

export type SubtaskWithAttachments = Subtask & { attachments: Attachment[] };

export type GoalDetail = AdvocacyGoal & {
  goalContacts: GoalContactWithStanceHistory[];
  subtasks: SubtaskWithAttachments[];
  indicators: Indicator[];
};

export type IndicatorWithGoal = Indicator & {
  goal: { id: string; name: string } | null;
};

export type ContactWithGoals = Contact & {
  goalLinks: (GoalContact & { goal: { id: string; name: string } })[];
};

export type CommitmentWithGoal = Commitment & {
  goal: { id: string; name: string } | null;
};

export type ContactDetail = Contact & {
  goalLinks: GoalLinkWithStanceHistory[];
  interactions: SubtaskWithAttachments[];
  commitments: CommitmentWithGoal[];
};

export type { AdvocacyGoal, Contact, GoalContact, Subtask, Indicator, Attachment, Commitment, StanceChange };
