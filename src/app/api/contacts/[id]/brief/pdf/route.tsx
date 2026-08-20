import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireTeamApi } from "@/lib/team-api";
import { buildContactBriefLabels, getContactBriefData } from "@/lib/contact-brief";
import { ContactBriefPdf } from "@/components/pdf/contact-brief-pdf";
import { routing } from "@/i18n/routing";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { team, error: authError } = await requireTeamApi();
  if (authError) return authError;

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const rawLocale = searchParams.get("locale");
  const locale = routing.locales.includes(rawLocale as never)
    ? (rawLocale as string)
    : routing.defaultLocale;

  const [contact, labels] = await Promise.all([
    getContactBriefData(id, team),
    buildContactBriefLabels(locale),
  ]);
  if (!contact) return jsonError("Contact not found", 404);

  const buffer = await renderToBuffer(
    <ContactBriefPdf contact={contact} labels={labels} locale={locale} />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="brief-${contact.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf"`,
    },
  });
}
