import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireTeam } from "@/lib/team-session";
import { ContactsDirectory } from "@/components/contacts-directory";

export const dynamic = "force-dynamic";

export default async function ContactsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const team = await requireTeam(locale);

  const contacts = await prisma.contact.findMany({
    where: { team },
    include: { goalLinks: { include: { goal: { select: { id: true, name: true } } } } },
    orderBy: { name: "asc" },
  });

  return <ContactsDirectory initialContacts={contacts} />;
}
