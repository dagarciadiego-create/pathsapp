import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireTeam } from "@/lib/team-session";
import { SpokespeoplePage } from "@/components/spokespeople-page";

export const dynamic = "force-dynamic";

export default async function SpokespeopleRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const team = await requireTeam(locale);

  const spokespeople = await prisma.spokesperson.findMany({
    where: { team },
    orderBy: { name: "asc" },
  });

  return <SpokespeoplePage initialSpokespeople={spokespeople} />;
}
