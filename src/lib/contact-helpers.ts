import type { ContactConnectionView } from "./types";

type RawConnection = {
  id: string;
  description: string;
  createdAt: Date;
  contactA: { id: string; name: string };
  contactB: { id: string; name: string };
};

// ContactConnection is undirected (see schema comment): a contact's own
// connections come back split across "as A" and "as B" queries, each still
// pointing at itself on one side. This flattens both into "the other
// contact" so the UI never has to care which side is which.
export function normalizeConnections(
  connectionsAsA: RawConnection[],
  connectionsAsB: RawConnection[]
): ContactConnectionView[] {
  const fromA = connectionsAsA.map((c) => ({
    id: c.id,
    description: c.description,
    createdAt: c.createdAt,
    otherContact: c.contactB,
  }));
  const fromB = connectionsAsB.map((c) => ({
    id: c.id,
    description: c.description,
    createdAt: c.createdAt,
    otherContact: c.contactA,
  }));
  return [...fromA, ...fromB].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
