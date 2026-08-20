import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireTeam } from "@/lib/team-session";
import { JointLettersPage } from "@/components/joint-letters-page";

export const dynamic = "force-dynamic";

export default async function JointLettersRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const team = await requireTeam(locale);

  const [jointLetters, goals] = await Promise.all([
    prisma.jointLetter.findMany({
      where: { team },
      include: {
        goal: { select: { id: true, name: true } },
        cosigners: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.advocacyGoal.findMany({
      where: { team },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return <JointLettersPage jointLetters={jointLetters} goals={goals} />;
}
