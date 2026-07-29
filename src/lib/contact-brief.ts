import { getTranslations } from "next-intl/server";
import { prisma } from "./prisma";

export async function getContactBriefData(contactId: string) {
  return prisma.contact.findUnique({
    where: { id: contactId },
    include: {
      goalLinks: { include: { goal: true }, orderBy: { createdAt: "asc" } },
      interactions: { orderBy: { createdAt: "desc" }, take: 8 },
      commitments: {
        where: { status: "PENDING" },
        include: { goal: { select: { id: true, name: true } } },
        orderBy: { followUpDate: "asc" },
      },
    },
  });
}

export type ContactBriefData = NonNullable<Awaited<ReturnType<typeof getContactBriefData>>>;

// A flat bag of pre-translated strings, built the same way as
// buildReportLabels in lib/reports.ts: the PDF renders outside of
// next-intl's React context, straight from a route handler.
export async function buildContactBriefLabels(locale: string) {
  const [tBrief, tGoalForm, tContactDetail, tEnums, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: "ContactBrief" }),
    getTranslations({ locale, namespace: "GoalForm" }),
    getTranslations({ locale, namespace: "ContactDetail" }),
    getTranslations({ locale, namespace: "Enums" }),
    getTranslations({ locale, namespace: "Common" }),
  ]);

  return {
    brand: "PATHSapp",
    title: tBrief("title"),
    generatedAt: (date: string) => tBrief("generatedAt", { date }),
    contactInfoTitle: tBrief("contactInfoTitle"),
    openCommitmentsTitle: tBrief("openCommitmentsTitle"),
    noOpenCommitments: tBrief("noOpenCommitments"),
    recentInteractionsTitle: tBrief("recentInteractionsTitle"),
    noInteractions: tBrief("noInteractions"),
    linkedGoalsTitle: tContactDetail("linkedGoalsTitle"),
    noLinkedGoals: tContactDetail("noLinkedGoals"),
    goalStatusLabel: tGoalForm("status"),
    followUpOn: (date: string) => tBrief("followUpOn", { date }),
    madeOn: (date: string) => tBrief("madeOn", { date }),
    unassigned: tCommon("unassigned"),
    goalKind: (kind: string) => tEnums(`goalKind.${kind}` as never),
    goalStatus: (status: string) => tEnums(`goalStatus.${status}` as never),
    actionType: (type: string) => tEnums(`actionType.${type}` as never),
  };
}

export type ContactBriefLabels = Awaited<ReturnType<typeof buildContactBriefLabels>>;
