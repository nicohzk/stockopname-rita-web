import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading";
import { formatDateTime } from "@/lib/format-date";
import { getAuditBatches, getAudits } from "@/services/audit.service";
import type { AuditAction, AuditBatchSummary, AuditData, AuditEntry } from "@/types/audit";

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

function factorValue(data: AuditData | null | undefined): number {
  return data?.sell_factor ?? 1;
}

function factorLabel(entry: AuditEntry) {
  if (entry.action === "CREATE") return factorValue(entry.after);
  if (entry.action === "DELETE") return factorValue(entry.before);
  const before = factorValue(entry.before);
  const after = factorValue(entry.after);
  return before === after ? after : `${before} → ${after}`;
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
      <span className="w-24 shrink-0 text-sm">Faktor {factorLabel(entry)}</span>
      <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{entry.note || "-"}</span>
    </div>
  );
}

export default function AuditTimeline({
  sessionId,
  coordinatorId,
  resultId,
  refreshKey = 0,
  title = "Riwayat Perubahan",
  description = "Setiap koreksi hasil SO dicatat di sini.",
}: Props) {
  const [batches, setBatches] = useState<AuditBatchSummary[]>([]);
  const [batchesPage, setBatchesPage] = useState(1);
  const [batchesTotalPages, setBatchesTotalPages] = useState(1);
  const [batchesLoading, setBatchesLoading] = useState(true);
  const [batchesError, setBatchesError] = useState<string>();

  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const [expandedBatch, setExpandedBatch] = useState<string>();
  const [batchEntries, setBatchEntries] = useState<AuditEntry[]>([]);
  const [batchPage, setBatchPage] = useState(1);
  const [batchTotalPages, setBatchTotalPages] = useState(1);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setBatchesLoading(true);
      setBatchesError(undefined);
      try {
        const result = await getAuditBatches({ sessionId, coordinatorId, resultId, page: batchesPage, limit: 10 });
        if (!cancelled) {
          setBatches(result.data);
          setBatchesTotalPages(result.pagination.total_pages || 1);
        }
      } catch (loadError) {
        if (!cancelled) setBatchesError(loadError instanceof Error ? loadError.message : "Gagal memuat aksi massal.");
      } finally {
        if (!cancelled) setBatchesLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [sessionId, coordinatorId, resultId, batchesPage, refreshKey]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(undefined);
      try {
        const result = await getAudits({ sessionId, coordinatorId, resultId, page, limit: 10, withoutBatch: true });
        if (!cancelled) {
          setEntries(result.data);
          setTotalPages(result.pagination.total_pages || 1);
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Gagal memuat riwayat perubahan.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [sessionId, coordinatorId, resultId, page, refreshKey]);

  useEffect(() => {
    if (!expandedBatch) return;
    let cancelled = false;
    const load = async () => {
      setBatchLoading(true);
      setBatchError(undefined);
      try {
        const result = await getAudits({ batchId: expandedBatch, page: batchPage, limit: 1000 });
        if (!cancelled) {
          setBatchEntries(result.data);
          setBatchTotalPages(result.pagination.total_pages || 1);
        }
      } catch (loadError) {
        if (!cancelled) setBatchError(loadError instanceof Error ? loadError.message : "Gagal memuat detail batch.");
      } finally {
        if (!cancelled) setBatchLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [expandedBatch, batchPage]);

  const toggleBatch = (batchId: string) => {
    if (expandedBatch === batchId) {
      setExpandedBatch(undefined);
      setBatchEntries([]);
      return;
    }
    setExpandedBatch(batchId);
    setBatchPage(1);
  };

  return (
    <Card className="my-5">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <section>
          <h3 className="mb-2 text-sm font-semibold">Aksi Massal</h3>
          {batchesLoading ? (
            <LoadingSpinner message="Memuat aksi massal..." />
          ) : batchesError ? (
            <p className="text-sm text-destructive">{batchesError}</p>
          ) : batches.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada aksi massal.</p>
          ) : (
            <div className="space-y-1">
              {batches.map((batch) => (
                <div key={batch.batch_id} className="rounded-md border px-2 py-1">
                  <button
                    type="button"
                    className="flex w-full flex-wrap items-center gap-2 text-left text-sm"
                    onClick={() => toggleBatch(batch.batch_id)}
                  >
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${actionClass[batch.action]}`}>
                      {batch.action}
                    </span>
                    <span className="font-medium">{batch.item_count} item</span>
                    <span>{batch.actor}</span>
                    <span className="truncate text-muted-foreground">{batch.note || "-"}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{formatDateTime(batch.created_at)}</span>
                  </button>
                  {expandedBatch === batch.batch_id ? (
                    <div className="mt-2 border-t pt-2">
                      {batchLoading ? (
                        <LoadingSpinner message="Memuat detail batch..." />
                      ) : batchError ? (
                        <p className="text-sm text-destructive">{batchError}</p>
                      ) : (
                        <>
                          {batchEntries.map((entry) => <AuditRow key={entry.id} entry={entry} />)}
                          <div className="flex items-center justify-end gap-2 pt-2">
                            <Button variant="outline" size="sm" onClick={() => setBatchPage((value) => Math.max(1, value - 1))} disabled={batchPage <= 1 || batchLoading}>
                              Previous
                            </Button>
                            <span className="text-xs text-muted-foreground">Page {batchPage} of {batchTotalPages}</span>
                            <Button variant="outline" size="sm" onClick={() => setBatchPage((value) => Math.min(batchTotalPages, value + 1))} disabled={batchPage >= batchTotalPages || batchLoading}>
                              Next
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : null}
                </div>
              ))}
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setBatchesPage((value) => Math.max(1, value - 1))} disabled={batchesPage <= 1 || batchesLoading}>
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">Page {batchesPage} of {batchesTotalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setBatchesPage((value) => Math.min(batchesTotalPages, value + 1))} disabled={batchesPage >= batchesTotalPages || batchesLoading}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold">Perubahan Satuan</h3>
          {loading ? (
            <LoadingSpinner message="Memuat riwayat perubahan..." />
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada perubahan satuan.</p>
          ) : (
            <div className="space-y-1">
              {entries.map((entry) => <AuditRow key={entry.id} entry={entry} />)}
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1 || loading}>
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page >= totalPages || loading}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
