import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireTeam } from "@/lib/team-session";
import { PositionsPage } from "@/components/positions-page";

export const dynamic = "force-dynamic";

export default async function PositionsRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const team = await requireTeam(locale);

  const [positions, contacts] = await Promise.all([
    prisma.position.findMany({
      where: { team },
      include: {
        holders: { include: { contact: true }, orderBy: { startDate: "desc" } },
      },
      orderBy: { title: "asc" },
    }),
    prisma.contact.findMany({
      where: { team },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return <PositionsPage positions={positions} contacts={contacts} />;
}
