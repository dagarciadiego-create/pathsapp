import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { PetitionsPage } from "@/components/petitions-page";

export const dynamic = "force-dynamic";

export default async function PetitionsRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const petitions = await prisma.petition.findMany({
    include: {
      versions: { orderBy: { createdAt: "desc" } },
      evidence: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { title: "asc" },
  });

  return <PetitionsPage petitions={petitions} />;
}
