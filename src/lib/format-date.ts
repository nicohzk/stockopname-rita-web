export function formatDateTime(value?: string | null): string {
  if (!value || value.trim() === "") return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  if (date.getUTCFullYear() <= 1) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}