import { clsx } from "clsx";
import type {
  GoalStatus,
  SubtaskStatus,
  ContactRelation,
  Stance,
  CommitmentStatus,
  DeadlineStatus,
} from "@/lib/constants";

const goalStatusColors: Record<GoalStatus, string> = {
  NOT_STARTED:
    "bg-slate-100 text-slate-700 dark:bg-slate-700/60 dark:text-slate-200",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  ACHIEVED:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  STALLED: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  CANCELLED: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
};

const subtaskStatusColors: Record<SubtaskStatus, string> = {
  PENDING: "bg-slate-100 text-slate-700 dark:bg-slate-700/60 dark:text-slate-200",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  DONE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  CANCELLED: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
};

const contactRelationColors: Record<ContactRelation, string> = {
  DECISION_MAKER:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
  SUPPORTER: "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300",
};

const stanceColors: Record<Stance, string> = {
  CHAMPION: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  FRIENDLY: "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300",
  NEUTRAL: "bg-slate-100 text-slate-700 dark:bg-slate-700/60 dark:text-slate-200",
  SKEPTICAL: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  OPPOSED: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
};

const commitmentStatusColors: Record<CommitmentStatus, string> = {
  PENDING: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  FULFILLED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  BROKEN: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
};

const deadlineStatusColors: Record<DeadlineStatus, string> = {
  OPEN: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  SUBMITTED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  MISSED: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
  CANCELLED: "bg-slate-100 text-slate-700 dark:bg-slate-700/60 dark:text-slate-200",
};

function Badge({ className, label }: { className: string; label: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        className
      )}
    >
      {label}
    </span>
  );
}

export function GoalStatusBadge({ status, label }: { status: GoalStatus; label: string }) {
  return <Badge className={goalStatusColors[status]} label={label} />;
}

export function SubtaskStatusBadge({
  status,
  label,
}: {
  status: SubtaskStatus;
  label: string;
}) {
  return <Badge className={subtaskStatusColors[status]} label={label} />;
}

export function ContactRelationBadge({
  relation,
  label,
}: {
  relation: ContactRelation;
  label: string;
}) {
  return <Badge className={contactRelationColors[relation]} label={label} />;
}

export function StanceBadge({ stance, label }: { stance: Stance; label: string }) {
  return <Badge className={stanceColors[stance]} label={label} />;
}

export function CommitmentStatusBadge({
  status,
  label,
}: {
  status: CommitmentStatus;
  label: string;
}) {
  return <Badge className={commitmentStatusColors[status]} label={label} />;
}

export function DeadlineStatusBadge({
  status,
  label,
}: {
  status: DeadlineStatus;
  label: string;
}) {
  return <Badge className={deadlineStatusColors[status]} label={label} />;
}
