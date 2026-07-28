// Date-only values (targetDate, dueDate) are stored as UTC midnight. Every
// comparison/formatting site must agree on that same reference frame —
// otherwise the server's UTC clock and a browser's local timezone disagree
// about which calendar day a value falls on, and the same goal can render
// as overdue in one place and upcoming in another on the same page.
export function utcMidnight(date: Date | string) {
  const d = new Date(date);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function toDateInputValue(date: Date | string | null | undefined) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}
