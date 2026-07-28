import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { buildReportLabels, getReportData } from "@/lib/reports";
import { AdvocacyReportPdf } from "@/components/pdf/advocacy-report-pdf";
import { routing } from "@/i18n/routing";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawLocale = searchParams.get("locale");
  const locale = routing.locales.includes(rawLocale as never)
    ? (rawLocale as string)
    : routing.defaultLocale;

  const [data, labels] = await Promise.all([getReportData(), buildReportLabels(locale)]);

  const buffer = await renderToBuffer(
    <AdvocacyReportPdf data={data} labels={labels} locale={locale} />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="pathsapp-informe.pdf"`,
    },
  });
}
