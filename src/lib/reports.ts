import { getTranslations } from "next-intl/server";
import { prisma } from "./prisma";
import { computeGoalProgress } from "./goal-helpers";
import { GOAL_KINDS, GOAL_STATUSES } from "./constants";

export async function getReportData() {
  const [goals, indicators] = await Promise.all([
    prisma.advocacyGoal.findMany({
      include: {
        subtasks: { select: { status: true } },
        goalContacts: { include: { contact: true } },
        indicators: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.indicator.findMany({
      where: { goalId: null },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const goalsWithProgress = goals.map((goal) => ({
    ...goal,
    progress: computeGoalProgress(goal.subtasks),
  }));

  const summary = {
    total: goals.length,
    achieved: goals.filter((g) => g.status === "ACHIEVED").length,
    inProgress: goals.filter((g) => g.status === "IN_PROGRESS").length,
  };

  return { goals: goalsWithProgress, globalIndicators: indicators, summary };
}

export type ReportData = Awaited<ReturnType<typeof getReportData>>;

// Lightweight variant for the Reports page's summary cards, which only
// need the three counts below — unlike getReportData (used by the actual
// PDF/Excel export), it never loads every goal's subtasks/contacts.
export async function getReportSummary() {
  const [total, byStatus] = await Promise.all([
    prisma.advocacyGoal.count(),
    prisma.advocacyGoal.groupBy({ by: ["status"], _count: true }),
  ]);
  const countFor = (status: string) =>
    byStatus.find((g) => g.status === status)?._count ?? 0;
  return {
    total,
    achieved: countFor("ACHIEVED"),
    inProgress: countFor("IN_PROGRESS"),
  };
}

// A flat bag of pre-translated strings for the given locale, built once so
// the PDF/Excel renderers never need access to next-intl's React context
// (they run outside of it, straight from a route handler).
export async function buildReportLabels(locale: string) {
  const [tNav, tHome, tGoalForm, tGoalDetail, tIndicators, tReports, tEnums] = await Promise.all([
    getTranslations({ locale, namespace: "Nav" }),
    getTranslations({ locale, namespace: "Home" }),
    getTranslations({ locale, namespace: "GoalForm" }),
    getTranslations({ locale, namespace: "GoalDetail" }),
    getTranslations({ locale, namespace: "Indicators" }),
    getTranslations({ locale, namespace: "Reports" }),
    getTranslations({ locale, namespace: "Enums" }),
  ]);

  return {
    brand: tNav("brand"),
    tagline: tNav("tagline"),
    reportTitle: tReports("title"),
    generatedAt: (date: string) => tReports("generatedAt", { date }),
    sheetGoals: tReports("sheetGoals"),
    sheetIndicators: tReports("sheetIndicators"),
    summaryTotal: tHome("summaryTotal"),
    summaryAchieved: tHome("summaryAchieved"),
    summaryInProgress: tHome("summaryInProgress"),
    name: tGoalForm("name"),
    kind: tGoalForm("kind"),
    category: tGoalForm("category"),
    responsible: tGoalForm("responsible"),
    targetDate: tGoalForm("targetDate"),
    noTargetDate: tHome("noTargetDate"),
    status: tGoalForm("status"),
    contactsTitle: tGoalDetail("contactsTitle"),
    indicatorsTitle: tIndicators("title"),
    columnName: tIndicators("columnName"),
    columnGoal: tIndicators("columnGoal"),
    columnTarget: tIndicators("columnTarget"),
    columnCurrent: tIndicators("columnCurrent"),
    columnProgress: tIndicators("columnProgress"),
    globalIndicator: tIndicators("globalIndicator"),
    goalKind: Object.fromEntries(GOAL_KINDS.map((k) => [k, tEnums(`goalKind.${k}`)])) as Record<
      string,
      string
    >,
    goalStatus: Object.fromEntries(
      GOAL_STATUSES.map((s) => [s, tEnums(`goalStatus.${s}`)])
    ) as Record<string, string>,
  };
}

export type ReportLabels = Awaited<ReturnType<typeof buildReportLabels>>;
