import { useLocale, useTranslations } from "next-intl";
import { Flag, Trophy, Paperclip } from "lucide-react";
import { Section } from "./ui/section";
import { ActionTypeIcon } from "./ui/action-type-icon";
import { StanceBadge, SubtaskStatusBadge } from "./ui/status-badge";
import { buildOutcomeChain } from "@/lib/outcome-chain";
import { formatDate } from "@/lib/goal-helpers";
import type { GoalDetail } from "@/lib/types";
import type { ActionType, Stance, SubtaskStatus } from "@/lib/constants";

// Only shown for ACHIEVED goals: the story of how it happened, not just
// that it did. A quiet "created, nothing else logged" chain isn't useful,
// so it's hidden unless there's at least one real event to narrate.
export function OutcomeChain({ goal }: { goal: GoalDetail }) {
  const t = useTranslations("OutcomeChain");
  const tEnums = useTranslations("Enums");
  const locale = useLocale();
  const events = buildOutcomeChain(goal);

  if (events.length <= 1) return null;

  return (
    <Section title={t("title")} subtitle={t("subtitle")}>
      <ol className="space-y-4 border-l-2 border-emerald-200 pl-4 dark:border-emerald-900/60">
        {events.map((event, i) => (
          <li key={i} className="relative">
            <span className="absolute top-1 -left-[1.1875rem] h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatDate(event.date, locale)}
            </p>

            {event.kind === "CREATED" && (
              <p className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300">
                <Flag className="h-4 w-4 text-slate-400" aria-hidden />
                {t("created")}
              </p>
            )}

            {event.kind === "ACTION" && (
              <div className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-slate-400">
                  <ActionTypeIcon type={event.actionType as ActionType} />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {event.name}
                    </p>
                    <SubtaskStatusBadge
                      status={event.status as SubtaskStatus}
                      label={tEnums(`subtaskStatus.${event.status as SubtaskStatus}`)}
                    />
                  </div>
                  {event.notes && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">{event.notes}</p>
                  )}
                  {event.attachmentCount > 0 && (
                    <span className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Paperclip className="h-3.5 w-3.5" aria-hidden />
                      {event.attachmentCount}
                    </span>
                  )}
                </div>
              </div>
            )}

            {event.kind === "STANCE_CHANGE" && (
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <span>{t("stanceChange", { contact: event.contactName })}</span>
                <StanceBadge
                  stance={event.stance as Stance}
                  label={tEnums(`stance.${event.stance as Stance}`)}
                />
                {event.note && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    — {event.note}
                  </span>
                )}
              </div>
            )}

            {event.kind === "ACHIEVED" && (
              <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                <Trophy className="h-4 w-4" aria-hidden />
                {t("achieved")}
              </p>
            )}
          </li>
        ))}
      </ol>
    </Section>
  );
}
