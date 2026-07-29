import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { ContactDetailView } from "@/components/contact-detail-view";
import { normalizeConnections } from "@/lib/contact-helpers";

export const dynamic = "force-dynamic";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [contact, allContacts] = await Promise.all([
    prisma.contact.findUnique({
      where: { id },
      include: {
        goalLinks: {
          include: { goal: { select: { id: true, name: true } }, stanceHistory: { orderBy: { changedAt: "desc" } } },
          orderBy: { createdAt: "asc" },
        },
        interactions: {
          include: { attachments: true },
          orderBy: { createdAt: "desc" },
        },
        commitments: {
          include: { goal: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        },
        connectionsAsA: { include: { contactA: true, contactB: true } },
        connectionsAsB: { include: { contactA: true, contactB: true } },
      },
    }),
    prisma.contact.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!contact) notFound();

  const { connectionsAsA, connectionsAsB, ...rest } = contact;
  const contactDetail = {
    ...rest,
    connections: normalizeConnections(connectionsAsA, connectionsAsB),
  };

  return <ContactDetailView contact={contactDetail} otherContacts={allContacts.filter((c) => c.id !== id)} />;
}
