import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading";
import { Notice, RetryButton } from "@/components/ui/notice";
import { formatDateTime } from "@/lib/format-date";
import { getAudits, getAuditTimeline } from "@/services/audit.service";
import type { AuditAction, AuditData, AuditTimelineItem } from "@/types/audit";
import { describeEntry, factorName } from "./audit-describe";

type Props = {
  sessionId?: number;
  coordinatorId?: number;
  resultId?: number;
  refreshKey?: number;
  title?: string;
  description?: string;
  onOpenResult?: (term: string) => void;
};

type TimelineBatch = Extract<AuditTimelineItem, { kind: "batch" }>;

type TimelineEntry = {
  id: number;
  action: AuditAction;
  actor: string;
  note: string;
  created_at: string;
  before: AuditData | null;
  after: AuditData | null;
};

const actionClass: Record<AuditAction, string> = {
  CREATE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  UPDATE: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  DELETE: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",
  MOVE: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
};

const actionLabel: Record<AuditAction, string> = {
  CREATE: "Tambah",
  UPDATE: "Ubah",
  DELETE: "Hapus",
  MOVE: "Pindah",
};

const FILTERS: { label: string; actions: AuditAction[] }[] = [
  { label: "Semua", actions: [] },
  { label: "Ubah", actions: ["UPDATE"] },
  { label: "Pindah", actions: ["MOVE"] },
  { label: "Tambah", actions: ["CREATE"] },
  { label: "Hapus", actions: ["DELETE"] },
];

const dayFormatter = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function dayLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (dateKey(date) === dateKey(today)) return "Hari ini";
  if (dateKey(date) === dateKey(yesterday)) return "Kemarin";
  return dayFormatter.format(date);
}

type DayGroup<T> = { key: string; label: string; items: T[] };

function groupByDay<T>(items: T[], getDate: (item: T) => string): DayGroup<T>[] {
  const groups: DayGroup<T>[] = [];
  for (const item of items) {
    const value = getDate(item);
    const key = dateKey(new Date(value));
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(item);
    else groups.push({ key, label: dayLabel(value), items: [item] });
  }
  return groups;
}

function ActionBadge({ action }: { action: AuditAction }) {
  return (
    <span title={action} className={`rounded-full px-2 py-0.5 text-xs font-medium ${actionClass[action]}`}>
      {actionLabel[action]}
    </span>
  );
}

function RowShell({ children, nested = false }: { children: ReactNode; nested?: boolean }) {
  return (
    <div
      className={`border-b py-2 last:border-b-0 hover:bg-muted/40 ${
        nested ? "" : "-mx-2 rounded-md px-2"
      }`}
    >
      {children}
    </div>
  );
}

function RowMeta({
  item,
  extra,
}: {
  item: { created_at: string; actor: string; action: AuditAction };
  extra?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span>{formatDateTime(item.created_at)}</span>
      <span className="font-medium text-foreground">{item.actor || "-"}</span>
      <ActionBadge action={item.action} />
      {extra}
    </div>
  );
}

function Pager({
  page,
  totalPages,
  disabled,
  onChange,
}: {
  page: number;
  totalPages: number;
  disabled?: boolean;
  onChange: (page: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
      <Button variant="outline" size="sm" onClick={() => onChange(page - 1)} disabled={disabled || page <= 1}>
        Sebelumnya
      </Button>
      <span className="text-xs text-muted-foreground">
        Halaman {page} dari {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(page + 1)}
        disabled={disabled || page >= totalPages}
      >
        Berikutnya
      </Button>
    </div>
  );
}

/** Sentence for a batch row; empty when the batch has no useful metadata. */
function batchSummary(batch: TimelineBatch): string {
  const parts: string[] = [];
  if (batch.action === "MOVE") {
    if (batch.source_rak_name && batch.target_rak_name) {
      parts.push(`${batch.source_rak_name} → ${batch.target_rak_name}`);
    }
    if (batch.merged_count) {
      parts.push(`${batch.merged_count} digabung`);
    }
  } else if (batch.action === "UPDATE" && batch.factor_after !== undefined) {
    const to = factorName(batch.factor_after);
    parts.push(
      batch.factor_before !== undefined ? `faktor ${factorName(batch.factor_before)} → ${to}` : `faktor menjadi ${to}`,
    );
  }
  return parts.join(" · ");
}

function AuditRow({ entry, onOpenResult }: { entry: TimelineEntry; onOpenResult?: (term: string) => void }) {
  const { product, change } = describeEntry(entry);
  const term = entry.after?.barcode || entry.before?.barcode || entry.after?.plu || entry.before?.plu;
  return (
    <RowShell nested>
      <RowMeta item={entry} />
      <p className="text-sm">
        {onOpenResult && term ? (
          <button
            type="button"
            title="Lihat di daftar hasil"
            onClick={() => onOpenResult(term)}
            className="font-medium underline-offset-2 hover:underline"
          >
            {product}
          </button>
        ) : (
          <span className="font-medium">{product}</span>
        )}
        <span className="text-muted-foreground"> · {change}</span>
      </p>
      {entry.note ? <p className="text-xs text-muted-foreground">Catatan: {entry.note}</p> : null}
    </RowShell>
  );
}

function BatchRow({
  batch,
  expanded,
  onToggle,
  children,
}: {
  batch: TimelineBatch;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const summary = batchSummary(batch);
  return (
    <RowShell>
      <RowMeta
        item={batch}
        extra={<span className="font-medium text-foreground">{batch.item_count} hasil</span>}
      />
      <div className="flex items-start gap-2">
        <p className="min-w-0 flex-1 text-sm">
          {summary || "Perubahan massal"}
          {batch.note ? <span className="text-muted-foreground"> · {batch.note}</span> : null}
        </p>
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={expanded ? "Tutup detail" : "Buka detail"}
          onClick={onToggle}
          className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </button>
      </div>
      {expanded ? <div className="mt-2 ml-1 border-l pl-3">{children}</div> : null}
    </RowShell>
  );
}

export default function AuditTimeline({
  sessionId,
  coordinatorId,
  resultId,
  refreshKey = 0,
  title = "Riwayat Perubahan",
  description = "Setiap koreksi hasil SO dicatat di sini.",
  onOpenResult,
}: Props) {
  const [items, setItems] = useState<AuditTimelineItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [actions, setActions] = useState<AuditAction[]>([]);
  const [retryToken, setRetryToken] = useState(0);

  const [expandedBatch, setExpandedBatch] = useState<string>();
  const [batchEntries, setBatchEntries] = useState<TimelineEntry[]>([]);
  const [batchPage, setBatchPage] = useState(1);
  const [batchTotalPages, setBatchTotalPages] = useState(1);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState<string>();

  const retry = () => setRetryToken((value) => value + 1);

  const applyFilter = (next: AuditAction[]) => {
    const same = next.length === actions.length && next.every((action) => actions.includes(action));
    if (same) return;
    setActions(next);
    setPage(1);
    setExpandedBatch(undefined);
    setBatchEntries([]);
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(undefined);
      try {
        const result = await getAuditTimeline({ sessionId, coordinatorId, resultId, actions, page, limit: 10 });
        if (!cancelled) {
          setItems(result.data);
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
  }, [sessionId, coordinatorId, resultId, actions, page, refreshKey, retryToken]);

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
        if (!cancelled) setBatchError(loadError instanceof Error ? loadError.message : "Gagal memuat detail perubahan.");
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
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((filter) => {
            const active =
              filter.actions.length === actions.length && filter.actions.every((action) => actions.includes(action));
            return (
              <Button
                key={filter.label}
                size="sm"
                variant={active ? "default" : "outline"}
                aria-pressed={active}
                onClick={() => applyFilter(filter.actions)}
              >
                {filter.label}
              </Button>
            );
          })}
        </div>

        {error ? (
          <Notice tone="error" message={error} action={<RetryButton onRetry={retry} retrying={loading} />} />
        ) : null}

        {loading && items.length === 0 ? (
          <LoadingSpinner message="Memuat riwayat perubahan..." />
        ) : items.length === 0 ? (
          !error ? (
            <p className="text-sm text-muted-foreground">
              {actions.length === 0 ? "Belum ada perubahan." : "Tidak ada perubahan untuk filter ini."}
            </p>
          ) : null
        ) : (
          <div>
            {groupByDay(items, (item) => item.created_at).map((group) => (
              <div key={group.key}>
                <h4 className="pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.label}
                </h4>
                {group.items.map((item) =>
                  item.kind === "batch" ? (
                    <BatchRow
                      key={`batch-${item.batch_id}`}
                      batch={item}
                      expanded={expandedBatch === item.batch_id}
                      onToggle={() => toggleBatch(item.batch_id)}
                    >
                      {batchLoading ? (
                        <LoadingSpinner message="Memuat detail perubahan..." />
                      ) : batchError ? (
                        <p className="text-sm text-destructive">{batchError}</p>
                      ) : batchEntries.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Tidak ada item pada perubahan ini.</p>
                      ) : (
                        <>
                          {batchEntries.map((entry) => (
                            <AuditRow key={entry.id} entry={entry} onOpenResult={onOpenResult} />
                          ))}
                          <Pager page={batchPage} totalPages={batchTotalPages} disabled={batchLoading} onChange={setBatchPage} />
                        </>
                      )}
                    </BatchRow>
                  ) : (
                    <AuditRow key={`entry-${item.id}`} entry={item} onOpenResult={onOpenResult} />
                  ),
                )}
              </div>
            ))}
            <Pager page={page} totalPages={totalPages} disabled={loading} onChange={setPage} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
