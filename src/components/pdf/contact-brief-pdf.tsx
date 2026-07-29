import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ContactBriefData, ContactBriefLabels } from "@/lib/contact-brief";
import { formatDate as formatDateOrNull } from "@/lib/goal-helpers";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: "Helvetica", color: "#1e293b" },
  title: { fontSize: 20, fontFamily: "Helvetica-Bold", marginBottom: 2, color: "#0f766e" },
  subtitle: { fontSize: 12, color: "#334155", marginBottom: 4 },
  generatedAt: { fontSize: 8, color: "#94a3b8", marginBottom: 16 },
  infoBox: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    padding: 10,
    marginBottom: 16,
  },
  infoRow: { fontSize: 9.5, color: "#334155", marginBottom: 2 },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginTop: 14,
    marginBottom: 8,
    color: "#0f766e",
  },
  itemBox: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    padding: 8,
    marginBottom: 6,
  },
  itemTitle: { fontSize: 10.5, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  itemMeta: { fontSize: 8.5, color: "#64748b" },
  itemNotes: { fontSize: 9, color: "#475569", marginTop: 2 },
  emptyText: { fontSize: 9, color: "#94a3b8", fontStyle: "italic" },
  badge: {
    fontSize: 8,
    backgroundColor: "#f1f5f9",
    color: "#334155",
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 36,
    right: 36,
    fontSize: 7.5,
    color: "#94a3b8",
    textAlign: "center",
  },
});

function formatDate(date: Date | string | null | undefined, locale: string) {
  return formatDateOrNull(date, locale) ?? "";
}

export function ContactBriefPdf({
  contact,
  labels,
  locale,
}: {
  contact: ContactBriefData;
  labels: ContactBriefLabels;
  locale: string;
}) {
  const generatedAtLabel = labels.generatedAt(
    new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date())
  );

  return (
    <Document title={`${labels.title} — ${contact.name}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{labels.title}</Text>
        <Text style={styles.subtitle}>{contact.name}</Text>
        <Text style={styles.generatedAt}>{generatedAtLabel}</Text>

        <View style={styles.infoBox}>
          {(contact.role || contact.organization) && (
            <Text style={styles.infoRow}>
              {[contact.role, contact.organization].filter(Boolean).join(" · ")}
            </Text>
          )}
          {contact.email && <Text style={styles.infoRow}>{contact.email}</Text>}
          {contact.phone && <Text style={styles.infoRow}>{contact.phone}</Text>}
          {contact.notes && <Text style={styles.infoRow}>{contact.notes}</Text>}
        </View>

        <Text style={styles.sectionTitle}>{labels.openCommitmentsTitle}</Text>
        {contact.commitments.length === 0 ? (
          <Text style={styles.emptyText}>{labels.noOpenCommitments}</Text>
        ) : (
          contact.commitments.map((c) => (
            <View key={c.id} style={styles.itemBox}>
              <Text style={styles.itemTitle}>{c.description}</Text>
              <Text style={styles.itemMeta}>
                {labels.madeOn(formatDate(c.madeDate, locale))}
                {c.followUpDate ? ` · ${labels.followUpOn(formatDate(c.followUpDate, locale))}` : ""}
                {c.goal ? ` · ${c.goal.name}` : ""}
              </Text>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>{labels.recentInteractionsTitle}</Text>
        {contact.interactions.length === 0 ? (
          <Text style={styles.emptyText}>{labels.noInteractions}</Text>
        ) : (
          contact.interactions.map((i) => (
            <View key={i.id} style={styles.itemBox}>
              <Text style={styles.itemTitle}>{i.name}</Text>
              <Text style={styles.itemMeta}>
                {labels.actionType(i.actionType)}
                {i.dueDate ? ` · ${formatDate(i.dueDate, locale)}` : ""}
              </Text>
              {i.notes && <Text style={styles.itemNotes}>{i.notes}</Text>}
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>{labels.linkedGoalsTitle}</Text>
        {contact.goalLinks.length === 0 ? (
          <Text style={styles.emptyText}>{labels.noLinkedGoals}</Text>
        ) : (
          contact.goalLinks.map((gl) => (
            <View key={gl.id} style={styles.itemBox}>
              <Text style={styles.itemTitle}>{gl.goal.name}</Text>
              <Text style={styles.itemMeta}>
                {labels.goalStatusLabel}: {labels.goalStatus(gl.goal.status)}
              </Text>
              {gl.goal.description && <Text style={styles.itemNotes}>{gl.goal.description}</Text>}
            </View>
          ))
        )}

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) => `${labels.brand} · ${pageNumber} / ${totalPages}`}
        />
      </Page>
    </Document>
  );
}
