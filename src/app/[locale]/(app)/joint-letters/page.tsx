import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { JointLettersPage } from "@/components/joint-letters-page";

export const dynamic = "force-dynamic";

export default async function JointLettersRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [jointLetters, goals] = await Promise.all([
    prisma.jointLetter.findMany({
      include: {
        goal: { select: { id: true, name: true } },
        cosigners: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.advocacyGoal.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return <JointLettersPage jointLetters={jointLetters} goals={goals} />;
}
