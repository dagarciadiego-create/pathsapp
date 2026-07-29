import type {
  AdvocacyGoal,
  Contact,
  GoalContact,
  Subtask,
  Indicator,
  Attachment,
  Commitment,
  StanceChange,
  Deadline,
  Position,
  PositionHolder,
  StrategicDate,
  Spokesperson,
  Petition,
  PetitionVersion,
  Evidence,
  JointLetter,
  JointLetterCosigner,
  MediaCoverage,
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

// A ContactConnection is undirected in practice (see schema comment), so
// it's normalized to "the other contact" before reaching the UI — nothing
// downstream needs to know whether this contact was stored as A or B.
export type ContactConnectionView = {
  id: string;
  description: string;
  createdAt: Date;
  otherContact: { id: string; name: string };
};

export type DeadlineWithGoal = Deadline & {
  goal: { id: string; name: string } | null;
};

export type TriageGoal = Pick<
  AdvocacyGoal,
  | "id"
  | "name"
  | "kind"
  | "status"
  | "category"
  | "targetDate"
  | "effortScore"
  | "impactScore"
>;

export type ContactDetail = Contact & {
  goalLinks: GoalLinkWithStanceHistory[];
  interactions: SubtaskWithAttachments[];
  commitments: CommitmentWithGoal[];
  connections: ContactConnectionView[];
};

export type PositionHolderWithContact = PositionHolder & { contact: Contact };

export type PositionDetail = Position & {
  holders: PositionHolderWithContact[];
};

export type PetitionDetail = Petition & {
  versions: PetitionVersion[];
  evidence: Evidence[];
};

export type JointLetterWithGoalAndCosigners = JointLetter & {
  goal: { id: string; name: string } | null;
  cosigners: JointLetterCosigner[];
};

export type MediaCoverageWithGoal = MediaCoverage & {
  goal: { id: string; name: string } | null;
};

export type {
  AdvocacyGoal,
  Contact,
  GoalContact,
  Subtask,
  Indicator,
  Attachment,
  Commitment,
  StanceChange,
  Deadline,
  Position,
  PositionHolder,
  StrategicDate,
  Spokesperson,
  Petition,
  PetitionVersion,
  Evidence,
  JointLetter,
  JointLetterCosigner,
  MediaCoverage,
};
