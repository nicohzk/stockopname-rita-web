import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: string;
  className?: string;
};

const statusLabels: Record<string, string> = {
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const statusStyles: Record<string, string> = {
  IN_PROGRESS: "border-blue-200 bg-blue-50 text-blue-700",
  IN_REVIEW: "border-amber-200 bg-amber-50 text-amber-700",
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CANCELLED: "border-red-200 bg-red-50 text-red-700",
};

function formatUnknownStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-sm font-medium whitespace-nowrap",
        statusStyles[status] ?? "border-border bg-muted text-muted-foreground",
        className,
      )}
    >
      {statusLabels[status] ?? formatUnknownStatus(status)}
    </span>
  );
}
