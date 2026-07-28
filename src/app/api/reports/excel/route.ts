import { Workbook } from "exceljs";
import { NextResponse } from "next/server";
import { buildReportLabels, getReportData } from "@/lib/reports";
import { routing } from "@/i18n/routing";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawLocale = searchParams.get("locale");
  const locale = routing.locales.includes(rawLocale as never)
    ? (rawLocale as string)
    : routing.defaultLocale;

  const [{ goals, globalIndicators }, labels] = await Promise.all([
    getReportData(),
    buildReportLabels(locale),
  ]);

  const workbook = new Workbook();
  workbook.creator = "PATHSapp";
  workbook.created = new Date();

  const goalsSheet = workbook.addWorksheet(labels.sheetGoals);
  goalsSheet.columns = [
    { header: labels.name, key: "name", width: 45 },
    { header: labels.kind, key: "kind", width: 20 },
    { header: labels.responsible, key: "responsible", width: 25 },
    { header: labels.category, key: "category", width: 20 },
    { header: labels.status, key: "status", width: 16 },
    { header: labels.targetDate, key: "targetDate", width: 16 },
    { header: "%", key: "progress", width: 10 },
    { header: labels.contactsTitle, key: "contacts", width: 40 },
  ];
  goalsSheet.getRow(1).font = { bold: true };

  for (const goal of goals) {
    goalsSheet.addRow({
      name: goal.name,
      kind: labels.goalKind[goal.kind] ?? goal.kind,
      responsible: goal.responsible,
      category: goal.category ?? "",
      status: labels.goalStatus[goal.status] ?? goal.status,
      targetDate: goal.targetDate ? goal.targetDate.toISOString().slice(0, 10) : "",
      progress: goal.progress.percent ?? "",
      contacts: goal.goalContacts.map((gc) => gc.contact.name).join(", "),
    });
  }

  const indicatorsSheet = workbook.addWorksheet(labels.sheetIndicators);
  indicatorsSheet.columns = [
    { header: labels.columnName, key: "name", width: 45 },
    { header: labels.columnGoal, key: "goal", width: 40 },
    { header: labels.columnTarget, key: "target", width: 14 },
    { header: labels.columnCurrent, key: "current", width: 14 },
    { header: labels.columnProgress, key: "progress", width: 14 },
  ];
  indicatorsSheet.getRow(1).font = { bold: true };

  for (const goal of goals) {
    for (const indicator of goal.indicators) {
      indicatorsSheet.addRow({
        name: indicator.name,
        goal: goal.name,
        target: indicator.targetValue,
        current: indicator.currentValue,
        progress:
          indicator.targetValue > 0
            ? Math.round((indicator.currentValue / indicator.targetValue) * 100)
            : 0,
      });
    }
  }
  for (const indicator of globalIndicators) {
    indicatorsSheet.addRow({
      name: indicator.name,
      goal: labels.globalIndicator,
      target: indicator.targetValue,
      current: indicator.currentValue,
      progress:
        indicator.targetValue > 0
          ? Math.round((indicator.currentValue / indicator.targetValue) * 100)
          : 0,
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="pathsapp-informe.xlsx"`,
    },
  });
}
