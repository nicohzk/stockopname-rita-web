import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading";
import { formatDateTime } from "@/lib/format-date";
import { getAudits } from "@/services/audit.service";
import type { AuditAction, AuditEntry } from "@/types/audit";

type Props = {
  sessionId?: number;
  coordinatorId?: number;
  resultId?: number;
  refreshKey?: number;
  title?: string;
  description?: string;
};

const actionClass: Record<AuditAction, string> = {
  CREATE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  UPDATE: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  DELETE: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",
  MOVE: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
};

function rackLabel(entry: AuditEntry) {
  const before = entry.before?.rak_name;
  const after = entry.after?.rak_name;
  if (entry.action === "MOVE") return `${before ?? "-"} → ${after ?? "-"}`;
  return after ?? before ?? "-";
}

function qtyLabel(entry: AuditEntry) {
  const before = entry.before?.quantity;
  const after = entry.after?.quantity;
  if (entry.action === "CREATE") return after ?? "-";
  if (entry.action === "DELETE") return before ?? "-";
  return `${before ?? "-"} → ${after ?? "-"}`;
}

function AuditRow({ entry }: { entry: AuditEntry }) {
  const product = entry.after ?? entry.before;
  return (
    <div className="flex flex-col gap-1 border-b py-2 last:border-b-0 sm:flex-row sm:items-center sm:gap-3">
      <span className="w-36 shrink-0 text-xs text-muted-foreground">{formatDateTime(entry.created_at)}</span>
      <span className={`w-20 shrink-0 rounded-full px-2 py-0.5 text-center text-xs font-medium ${actionClass[entry.action]}`}>
        {entry.action}
      </span>
      <span className="w-24 shrink-0 truncate text-sm">{entry.actor}</span>
      <span className="min-w-0 flex-1 truncate text-sm">{product?.name ?? "-"}</span>
      <span className="w-36 shrink-0 truncate text-sm">{rackLabel(entry)}</span>
      <span className="w-28 shrink-0 text-sm">{qtyLabel(entry)}</span>
      <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{entry.note || "-"}</span>
    </div>
  );
}

type AuditGroup = { key: string; entries: AuditEntry[] };

function groupAudits(entries: AuditEntry[]): AuditGroup[] {
  const groups: AuditGroup[] = [];
  const index = new Map<string, number>();
  for (const entry of entries) {
    if (!entry.batch_id) {
      groups.push({ key: `single-${entry.id}`, entries: [entry] });
      continue;
    }
    const existing = index.get(entry.batch_id);
    if (existing === undefined) {
      index.set(entry.batch_id, groups.length);
      groups.push({ key: entry.batch_id, entries: [entry] });
    } else {
      groups[existing].entries.push(entry);
    }
  }
  return groups;
}

export default function AuditTimeline({
  sessionId,
  coordinatorId,
  resultId,
  refreshKey = 0,
  title = "Riwayat Perubahan",
  description = "Setiap koreksi hasil SO dicatat di sini.",
}: Props) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    getAudits({ sessionId, coordinatorId, resultId, page, limit: 10 })
      .then((result) => {
        if (cancelled) return;
        setError(undefined);
        setEntries(result.data);
        setTotalPages(result.pagination.total_pages || 1);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Gagal memuat riwayat perubahan.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId, coordinatorId, resultId, page, refreshKey]);

  const groups = groupAudits(entries);

  return (
    <Card className="my-5">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingSpinner message="Memuat riwayat perubahan..." />
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada perubahan.</p>
        ) : (
          <div className="space-y-1">
            {groups.map((group) => {
              if (group.entries.length === 1) {
                return <AuditRow key={group.key} entry={group.entries[0]} />;
              }
              const first = group.entries[0];
              return (
                <details key={group.key} className="rounded-md border px-2 py-1">
                  <summary className="cursor-pointer text-sm">
                    <span className={`mr-2 rounded-full px-2 py-0.5 text-xs font-medium ${actionClass[first.action]}`}>
                      {first.action}
                    </span>
                    {group.entries.length} item · {first.actor} · {rackLabel(first)} · {formatDateTime(first.created_at)}
                  </summary>
                  <div className="mt-1">
                    {group.entries.map((entry) => <AuditRow key={entry.id} entry={entry} />)}
                  </div>
                </details>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3">
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1 || loading}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page >= totalPages || loading}>
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
