import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { PositionsPage } from "@/components/positions-page";

export const dynamic = "force-dynamic";

export default async function PositionsRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [positions, contacts] = await Promise.all([
    prisma.position.findMany({
      include: {
        holders: { include: { contact: true }, orderBy: { startDate: "desc" } },
      },
      orderBy: { title: "asc" },
    }),
    prisma.contact.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return <PositionsPage positions={positions} contacts={contacts} />;
}
