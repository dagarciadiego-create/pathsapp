import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireTeam } from "@/lib/team-session";
import { PetitionsPage } from "@/components/petitions-page";

export const dynamic = "force-dynamic";

export default async function PetitionsRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const team = await requireTeam(locale);

  const petitions = await prisma.petition.findMany({
    where: { team },
    include: {
      versions: { orderBy: { createdAt: "desc" } },
      evidence: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { title: "asc" },
  });

  return <PetitionsPage petitions={petitions} />;
}
