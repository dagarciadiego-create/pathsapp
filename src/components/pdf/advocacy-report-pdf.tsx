import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ReportData, ReportLabels } from "@/lib/reports";
import { formatDate as formatDateOrNull, percentOf } from "@/lib/goal-helpers";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: "Helvetica", color: "#1e293b" },
  title: { fontSize: 20, fontFamily: "Helvetica-Bold", marginBottom: 2, color: "#0f766e" },
  subtitle: { fontSize: 10, color: "#64748b", marginBottom: 4 },
  generatedAt: { fontSize: 8, color: "#94a3b8", marginBottom: 16 },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    padding: 8,
  },
  statLabel: { fontSize: 8, color: "#64748b", marginBottom: 2 },
  statValue: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginTop: 14,
    marginBottom: 8,
    color: "#0f766e",
  },
  goalBox: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
  },
  goalHeaderRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  goalName: { fontSize: 11.5, fontFamily: "Helvetica-Bold", flex: 1, paddingRight: 8 },
  badge: {
    fontSize: 8,
    backgroundColor: "#f1f5f9",
    color: "#334155",
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginLeft: 4,
  },
  metaRow: { flexDirection: "row", gap: 14, marginBottom: 3 },
  metaText: { fontSize: 8.5, color: "#475569" },
  contactsText: { fontSize: 8.5, color: "#64748b", marginTop: 2 },
  progressTrack: {
    height: 5,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    marginTop: 4,
    marginBottom: 2,
  },
  progressFill: { height: 5, backgroundColor: "#0f766e", borderRadius: 3 },
  table: { marginTop: 4, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 4 },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f0fdfa",
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  th: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#0f766e" },
  td: { fontSize: 8.5, color: "#334155" },
  colName: { flex: 3 },
  colGoal: { flex: 3 },
  colNum: { flex: 1, textAlign: "right" },
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

function formatDate(date: Date | null, locale: string, noDateLabel: string) {
  return formatDateOrNull(date, locale) ?? noDateLabel;
}

export function AdvocacyReportPdf({
  data,
  labels,
  locale,
}: {
  data: ReportData;
  labels: ReportLabels;
  locale: string;
}) {
  const generatedAtLabel = labels.generatedAt(
    new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date())
  );

  return (
    <Document title={labels.reportTitle} creator="PATHSapp" producer="PATHSapp">
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{labels.brand}</Text>
        <Text style={styles.subtitle}>{labels.tagline}</Text>
        <Text style={styles.generatedAt}>{generatedAtLabel}</Text>

        <View style={styles.summaryRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>{labels.summaryTotal}</Text>
            <Text style={styles.statValue}>{data.summary.total}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>{labels.summaryAchieved}</Text>
            <Text style={styles.statValue}>{data.summary.achieved}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>{labels.summaryInProgress}</Text>
            <Text style={styles.statValue}>{data.summary.inProgress}</Text>
          </View>
        </View>

        {data.goals.map((goal) => (
          <View key={goal.id} style={styles.goalBox} wrap={false}>
            <View style={styles.goalHeaderRow}>
              <Text style={styles.goalName}>{goal.name}</Text>
              <Text style={styles.badge}>{labels.goalKind[goal.kind] ?? goal.kind}</Text>
              <Text style={styles.badge}>{labels.goalStatus[goal.status] ?? goal.status}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                {labels.responsible}: {goal.responsible}
              </Text>
              <Text style={styles.metaText}>
                {labels.targetDate}: {formatDate(goal.targetDate, locale, labels.noTargetDate)}
              </Text>
            </View>
            {goal.subtasks.length > 0 && (
              <>
                <View style={styles.progressTrack}>
                  <View
                    style={[styles.progressFill, { width: `${goal.progress.percent ?? 0}%` }]}
                  />
                </View>
                <Text style={styles.metaText}>
                  {goal.progress.done} / {goal.progress.total} ({goal.progress.percent ?? 0}%)
                </Text>
              </>
            )}
            {goal.goalContacts.length > 0 && (
              <Text style={styles.contactsText}>
                {labels.contactsTitle}: {goal.goalContacts.map((gc) => gc.contact.name).join(", ")}
              </Text>
            )}
          </View>
        ))}

        <Text style={styles.sectionTitle}>{labels.indicatorsTitle}</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, styles.colName]}>{labels.columnName}</Text>
            <Text style={[styles.th, styles.colGoal]}>{labels.columnGoal}</Text>
            <Text style={[styles.th, styles.colNum]}>{labels.columnTarget}</Text>
            <Text style={[styles.th, styles.colNum]}>{labels.columnCurrent}</Text>
            <Text style={[styles.th, styles.colNum]}>{labels.columnProgress}</Text>
          </View>
          {data.goals.flatMap((goal) =>
            goal.indicators.map((indicator) => (
              <View key={indicator.id} style={styles.tableRow}>
                <Text style={[styles.td, styles.colName]}>{indicator.name}</Text>
                <Text style={[styles.td, styles.colGoal]}>{goal.name}</Text>
                <Text style={[styles.td, styles.colNum]}>{indicator.targetValue}</Text>
                <Text style={[styles.td, styles.colNum]}>{indicator.currentValue}</Text>
                <Text style={[styles.td, styles.colNum]}>{percentOf(indicator)}%</Text>
              </View>
            ))
          )}
          {data.globalIndicators.map((indicator) => (
            <View key={indicator.id} style={styles.tableRow}>
              <Text style={[styles.td, styles.colName]}>{indicator.name}</Text>
              <Text style={[styles.td, styles.colGoal]}>{labels.globalIndicator}</Text>
              <Text style={[styles.td, styles.colNum]}>{indicator.targetValue}</Text>
              <Text style={[styles.td, styles.colNum]}>{indicator.currentValue}</Text>
              <Text style={[styles.td, styles.colNum]}>{percentOf(indicator)}%</Text>
            </View>
          ))}
        </View>

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) => `${labels.brand} · ${pageNumber} / ${totalPages}`}
        />
      </Page>
    </Document>
  );
}
