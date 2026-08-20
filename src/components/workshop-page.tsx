"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Sprout,
  Compass,
  Mountain,
  ArrowRight,
  RotateCcw,
  Target,
  CheckCircle2,
} from "lucide-react";
import { clsx } from "clsx";
import { Link } from "@/i18n/navigation";
import { Button } from "./ui/form";
import { ProgressBar } from "./ui/progress-bar";
import { useWorkshopProgress } from "./workshop-progress";
import {
  WORKSHOP_CHALLENGES,
  WORKSHOP_CHALLENGE_IDS,
  WORKSHOP_CHALLENGE_NUMBER,
  WORKSHOP_LEVELS,
  type WorkshopLevel,
} from "@/lib/workshop-challenges";

const levelIcons: Record<WorkshopLevel, typeof Sprout> = {
  BEGINNER: Sprout,
  INTERMEDIATE: Compass,
  ADVANCED: Mountain,
};

const levelHeader: Record<WorkshopLevel, string> = {
  BEGINNER:
    "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-900/30 dark:text-emerald-100",
  INTERMEDIATE:
    "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/60 dark:bg-blue-900/30 dark:text-blue-100",
  ADVANCED:
    "border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-900/60 dark:bg-violet-900/30 dark:text-violet-100",
};

const levelNumberBadge: Record<WorkshopLevel, string> = {
  BEGINNER: "bg-emerald-600 text-white",
  INTERMEDIATE: "bg-blue-600 text-white",
  ADVANCED: "bg-violet-600 text-white",
};

export function WorkshopPage() {
  const t = useTranslations("Workshop");
  const { done, toggle, reset } = useWorkshopProgress();

  const total = WORKSHOP_CHALLENGE_IDS.length;
  const doneCount = useMemo(
    () => WORKSHOP_CHALLENGE_IDS.filter((id) => done.has(id)).length,
    [done]
  );
  const percent = Math.round((doneCount / total) * 100);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-800 dark:bg-teal-900/50 dark:text-teal-200">
          <Target className="h-3.5 w-3.5" aria-hidden />
          PATHSapp
        </span>
        <h1 className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-100">{t("title")}</h1>
        <p className="mt-1 text-base text-slate-600 dark:text-slate-300">{t("subtitle")}</p>
        <p className="mt-3 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{t("howItWorks")}</p>
      </div>

      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            <CheckCircle2
              className={clsx(
                "h-4 w-4",
                doneCount === total ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
              )}
              aria-hidden
            />
            {t("progress", { done: doneCount, total })}
          </p>
          <div className="flex items-center gap-2">
            {doneCount > 0 && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                {t("reset")}
              </button>
            )}
            <Link href="/">
              <Button variant="secondary">
                {t("backToApp")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        <ProgressBar percent={percent} />
      </div>

      <div className="space-y-10">
        {WORKSHOP_LEVELS.map((level) => {
          const LevelIcon = levelIcons[level];
          const ids = WORKSHOP_CHALLENGES[level];
          const levelDone = ids.filter((id) => done.has(id)).length;

          return (
            <section key={level}>
              <div
                className={clsx(
                  "mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3",
                  levelHeader[level]
                )}
              >
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-semibold">
                    <LevelIcon className="h-5 w-5" aria-hidden />
                    {t(`levels.${level}.name`)}
                  </h2>
                  <p className="mt-0.5 text-sm opacity-80">{t(`levels.${level}.hint`)}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums opacity-80">
                  {levelDone}/{ids.length}
                </span>
              </div>

              <ol className="space-y-3">
                {ids.map((id) => {
                  const isDone = done.has(id);
                  const checkboxId = `workshop-${id}`;

                  return (
                    <li
                      key={id}
                      className={clsx(
                        "rounded-xl border bg-white p-4 shadow-sm transition-colors dark:bg-slate-900",
                        isDone
                          ? "border-emerald-300 dark:border-emerald-900"
                          : "border-slate-200 dark:border-slate-800"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={clsx(
                            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums",
                            isDone ? "bg-emerald-600 text-white" : levelNumberBadge[level]
                          )}
                          aria-hidden
                        >
                          {WORKSHOP_CHALLENGE_NUMBER[id]}
                        </span>

                        <div className="min-w-0 flex-1">
                          <label
                            htmlFor={checkboxId}
                            className={clsx(
                              "cursor-pointer font-semibold",
                              isDone
                                ? "text-slate-500 line-through decoration-slate-300 dark:text-slate-400"
                                : "text-slate-900 dark:text-slate-100"
                            )}
                          >
                            {t(`challenges.${id}.title`)}
                          </label>

                          <dl className="mt-2 space-y-2 text-sm">
                            <div>
                              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                {t("task")}
                              </dt>
                              <dd className="mt-0.5 text-slate-700 dark:text-slate-300">
                                {t(`challenges.${id}.task`)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                {t("doneWhen")}
                              </dt>
                              <dd className="mt-0.5 text-slate-700 dark:text-slate-300">
                                {t(`challenges.${id}.doneWhen`)}
                              </dd>
                            </div>
                          </dl>

                          {/* The two blocks above are the advocacy problem;
                              this one is tool guidance, so it's set apart
                              rather than reading as a third equal field. */}
                          <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                              {t("why")}
                            </p>
                            <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                              {t(`challenges.${id}.why`)}
                            </p>
                          </div>
                        </div>

                        <input
                          id={checkboxId}
                          type="checkbox"
                          checked={isDone}
                          onChange={() => toggle(id)}
                          className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}
