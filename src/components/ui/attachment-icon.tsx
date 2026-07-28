import { FileText, FileImage, FileSpreadsheet, File as FileIcon } from "lucide-react";

export function AttachmentIcon({
  mimeType,
  className,
}: {
  mimeType: string;
  className?: string;
}) {
  if (mimeType.startsWith("image/")) return <FileImage className={className} aria-hidden />;
  if (mimeType === "application/pdf") return <FileText className={className} aria-hidden />;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
    return <FileSpreadsheet className={className} aria-hidden />;
  if (mimeType.includes("word") || mimeType.includes("presentation"))
    return <FileText className={className} aria-hidden />;
  return <FileIcon className={className} aria-hidden />;
}
