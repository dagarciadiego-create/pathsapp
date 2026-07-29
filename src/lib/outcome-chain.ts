import type { GoalDetail } from "./types";

// The narrative of how an ACHIEVED goal actually got there: creation, every
// action taken, every stance shift among linked contacts, and the moment it
// was marked achieved — merged into one chronological timeline.
export type OutcomeChainEvent =
  | { kind: "CREATED"; date: Date }
  | {
      kind: "ACTION";
      date: Date;
      name: string;
      actionType: string;
      status: string;
      notes: string | null;
      attachmentCount: number;
    }
  | {
      kind: "STANCE_CHANGE";
      date: Date;
      contactName: string;
      stance: string;
      note: string | null;
    }
  | { kind: "ACHIEVED"; date: Date };

export function buildOutcomeChain(goal: GoalDetail): OutcomeChainEvent[] {
  const events: OutcomeChainEvent[] = [{ kind: "CREATED", date: goal.createdAt }];

  for (const subtask of goal.subtasks) {
    events.push({
      kind: "ACTION",
      // Same field, same convention as the contact interaction timeline:
      // dueDate doubles as "when this happened" for logged/unplanned
      // actions, falling back to createdAt only if it was never set.
      date: subtask.dueDate ?? subtask.createdAt,
      name: subtask.name,
      actionType: subtask.actionType,
      status: subtask.status,
      notes: subtask.notes,
      attachmentCount: subtask.attachments.length,
    });
  }

  for (const goalContact of goal.goalContacts) {
    for (const change of goalContact.stanceHistory) {
      events.push({
        kind: "STANCE_CHANGE",
        date: change.changedAt,
        contactName: goalContact.contact.name,
        stance: change.stance,
        note: change.note,
      });
    }
  }

  if (goal.achievedAt) {
    events.push({ kind: "ACHIEVED", date: goal.achievedAt });
  }

  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
