"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  CalendarClock,
  Plus,
  Pencil,
  Trash2,
  Wallet,
  Vote,
  Megaphone,
  Gavel,
  Star,
} from "lucide-react";
import { clsx } from "clsx";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "./ui/form";
import { ConfirmDialog } from "./ui/confirm-dialog";
import { ActionTypeIcon } from "./ui/action-type-icon";
import { StrategicDateFormDialog } from "./strategic-date-form-dialog";
import { api } from "@/lib/api-client";
import {
  type CalendarEvent,
  eventsOnDay,
  getMonthGridDays,
  isEventDone,
  isEventOverdue,
  isSameDay,
  overdueEvents,
  upcomingEvents,
} from "@/lib/calendar-helpers";
import { formatDate } from "@/lib/goal-helpers";
import type { ActionType, StrategicDateKind } from "@/lib/constants";
import type { StrategicDate } from "@/lib/types";

const strategicIcons: Record<StrategicDateKind, typeof Wallet> = {
  BUDGET: Wallet,
  ELECTION: Vote,
  AWARENESS_DAY: Megaphone,
  LEGISLATIVE: Gavel,
  OTHER: Star,
};

function eventTone(event: CalendarEvent) {
  if (event.kind === "strategic") return "strategic";
  if (isEventDone(event)) return "muted";
  return isEventOverdue(event) ? "overdue" : "upcoming";
}

const dotClass: Record<string, string> = {
  overdue: "bg-rose-500",
  upcoming: "bg-teal-500",
  muted: "bg-slate-300 dark:bg-slate-600",
  strategic: "bg-purple-500",
};

const badgeClass: Record<string, string> = {
  overdue: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
  upcoming: "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300",
  muted: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  strategic: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
};

function EventRow({ event }: { event: CalendarEvent }) {
  const locale = useLocale();
  const tCalendar = useTranslations("Calendar");
  const tone = eventTone(event);
  const dateLabel = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(
    event.date
  );

  const icon =
    event.kind === "goalTarget" ? (
      <Flag className="h-3 w-3 shrink-0" aria-hidden />
    ) : event.kind === "strategic" ? (
      (() => {
        const Icon = strategicIcons[event.strategicKind as StrategicDateKind] ?? Star;
        return <Icon className="h-3 w-3 shrink-0" aria-hidden />;
      })()
    ) : (
      <ActionTypeIcon type={event.actionType as ActionType} className="h-3 w-3 shrink-0" />
    );

  const content = (
    <>
      <span className={clsx("mt-1 h-2 w-2 shrink-0 rounded-full", dotClass[tone])} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-200">
          {event.title}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          {icon}
          {event.kind !== "strategic" && <span className="truncate">{event.goalName}</span>}
          <span
            className={clsx(
              "ml-auto shrink-0 rounded-full px-1.5 py-0.5 font-medium",
              badgeClass[tone]
            )}
          >
            {event.kind === "goalTarget" ? tCalendar("goalTargetDate") : dateLabel}
          </span>
        </span>
      </span>
    </>
  );

  if (event.kind === "strategic") {
    return (
      <div className="flex items-start gap-2.5 rounded-lg px-2 py-1.5">{content}</div>
    );
  }

  return (
    <Link
      href={`/goals/${event.goalId}`}
      className="flex items-start gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60"
    >
      {content}
    </Link>
  );
}

export function CalendarView({
  events,
  strategicDates,
}: {
  events: CalendarEvent[];
  strategicDates: StrategicDate[];
}) {
  const t = useTranslations("Calendar");
  const tEnums = useTranslations("Enums");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();

  const [strategicDialog, setStrategicDialog] = useState<{
    open: boolean;
    strategicDate?: StrategicDate | null;
  }>({ open: false });
  const [deletingStrategic, setDeletingStrategic] = useState<StrategicDate | null>(null);
  const [strategicDeletePending, setStrategicDeletePending] = useState(false);

  async function confirmDeleteStrategic() {
    if (!deletingStrategic) return;
    setStrategicDeletePending(true);
    try {
      await api.deleteStrategicDate(deletingStrategic.id);
      router.refresh();
      setDeletingStrategic(null);
    } finally {
      setStrategicDeletePending(false);
    }
  }

  const today = useMemo(() => new Date(), []);
  const [viewedMonth, setViewedMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const gridDays = useMemo(
    () => getMonthGridDays(viewedMonth.getFullYear(), viewedMonth.getMonth()),
    [viewedMonth]
  );

  const weekdayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
    // Monday (2024-01-01) through Sunday (2024-01-07), a week with no DST edge cases.
    return Array.from({ length: 7 }, (_, i) => formatter.format(new Date(2024, 0, 1 + i)));
  }, [locale]);

  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
    viewedMonth
  );

  const selectedDayEvents = selectedDay ? eventsOnDay(events, selectedDay) : [];
  const upcoming = useMemo(() => upcomingEvents(events), [events]);
  const overdue = useMemo(() => overdueEvents(events), [events]);

  function changeMonth(delta: number) {
    setViewedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  function goToToday() {
    setViewedMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDay(today);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("title")}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold capitalize text-slate-900 dark:text-slate-100">
                {monthLabel}
              </h2>
              <div className="flex items-center gap-1">
                <Button variant="secondary" onClick={goToToday}>
                  {t("today")}
                </Button>
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  aria-label={t("previousMonth")}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  aria-label={t("nextMonth")}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 text-center text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
              {weekdayLabels.map((label) => (
                <div key={label} className="bg-slate-50 py-1.5 capitalize dark:bg-slate-900">
                  {label}
                </div>
              ))}
              {gridDays.map((day) => {
                const dayEvents = eventsOnDay(events, day);
                const inMonth = day.getUTCMonth() === viewedMonth.getMonth();
                const isToday = isSameDay(day, today);
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={clsx(
                      "flex min-h-16 flex-col items-center gap-1 bg-white py-1.5 dark:bg-slate-900",
                      !inMonth && "opacity-40",
                      isSelected && "ring-2 ring-inset ring-teal-500"
                    )}
                  >
                    <span
                      className={clsx(
                        "flex h-5 w-5 items-center justify-center rounded-full text-xs",
                        isToday
                          ? "bg-teal-600 font-semibold text-white"
                          : "text-slate-700 dark:text-slate-300"
                      )}
                    >
                      {day.getUTCDate()}
                    </span>
                    <span className="flex flex-wrap justify-center gap-0.5">
                      {dayEvents.slice(0, 4).map((event) => (
                        <span
                          key={event.id}
                          className={clsx("h-1.5 w-1.5 rounded-full", dotClass[eventTone(event)])}
                        />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <CalendarClock className="h-4 w-4" aria-hidden />
              {selectedDay
                ? new Intl.DateTimeFormat(locale, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  }).format(selectedDay)
                : t("selectDay")}
            </h3>
            {selectedDay && selectedDayEvents.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">{t("noEvents")}</p>
            )}
            <div className="space-y-0.5">
              {selectedDayEvents.map((event) => (
                <EventRow key={event.id} event={event} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              {t("upcoming")}
            </h3>
            {upcoming.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">{t("noUpcoming")}</p>
            ) : (
              <div className="space-y-0.5">
                {upcoming.map((event) => (
                  <EventRow key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              {t("overdue")}
            </h3>
            {overdue.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">{t("noOverdue")}</p>
            ) : (
              <div className="space-y-0.5">
                {overdue.map((event) => (
                  <EventRow key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {t("strategicDatesTitle")}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {t("strategicDatesSubtitle")}
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => setStrategicDialog({ open: true, strategicDate: null })}
          >
            <Plus className="h-4 w-4" />
            {t("newStrategicDate")}
          </Button>
        </div>

        {strategicDates.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("noStrategicDates")}
          </p>
        ) : (
          <ul className="space-y-1.5">
            {[...strategicDates]
              .sort((a, b) => a.title.localeCompare(b.title))
              .map((sd) => {
                const Icon = strategicIcons[sd.kind as StrategicDateKind] ?? Star;
                return (
                  <li
                    key={sd.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="shrink-0 rounded-full bg-purple-100 p-1.5 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300">
                        <Icon className="h-3.5 w-3.5" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                          {sd.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {tEnums(`strategicDateKind.${sd.kind as StrategicDateKind}`)}
                          {" · "}
                          {sd.isRecurring
                            ? t("recurringOn", {
                                date: new Intl.DateTimeFormat(locale, {
                                  month: "long",
                                  day: "numeric",
                                  timeZone: "UTC",
                                }).format(new Date(sd.date)),
                              })
                            : formatDate(sd.date, locale)}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => setStrategicDialog({ open: true, strategicDate: sd })}
                        aria-label={tCommon("edit")}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingStrategic(sd)}
                        aria-label={tCommon("delete")}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-900/40 dark:hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
          </ul>
        )}
      </div>

      <StrategicDateFormDialog
        open={strategicDialog.open}
        onClose={() => setStrategicDialog({ open: false })}
        strategicDate={strategicDialog.strategicDate}
      />
      <ConfirmDialog
        open={!!deletingStrategic}
        onClose={() => setDeletingStrategic(null)}
        onConfirm={confirmDeleteStrategic}
        pending={strategicDeletePending}
      />
    </div>
  );
}
