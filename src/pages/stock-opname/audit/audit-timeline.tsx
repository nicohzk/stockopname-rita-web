import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading";
import { Notice, RetryButton } from "@/components/ui/notice";
import { formatDateTime } from "@/lib/format-date";
import { getAudits, getAuditTimeline } from "@/services/audit.service";
import type { AuditAction, AuditData, AuditTimelineItem } from "@/types/audit";
import { describeEntry } from "./audit-describe";

type Props = {
  sessionId?: number;
  coordinatorId?: number;
  resultId?: number;
  refreshKey?: number;
  title?: string;
  description?: string;
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

function AuditRow({ entry }: { entry: TimelineEntry }) {
  const { product, change } = describeEntry(entry);
  return (
    <div className="flex flex-col gap-1 border-b py-2 last:border-b-0">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>{formatDateTime(entry.created_at)}</span>
        <span className="font-medium text-foreground">{entry.actor || "-"}</span>
        <ActionBadge action={entry.action} />
      </div>
      <p className="text-sm">
        <span className="font-medium">{product}</span>
        <span className="text-muted-foreground"> · {change}</span>
      </p>
      {entry.note ? <p className="text-xs text-muted-foreground">Catatan: {entry.note}</p> : null}
    </div>
  );
}

function BatchCard({
  batch,
  expanded,
  loading,
  error,
  entries,
  page,
  totalPages,
  onToggle,
  onPageChange,
}: {
  batch: TimelineBatch;
  expanded: boolean;
  loading: boolean;
  error?: string;
  entries: TimelineEntry[];
  page: number;
  totalPages: number;
  onToggle: () => void;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="rounded-md border">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={onToggle}
        className="flex w-full flex-wrap items-center gap-2 px-2 py-2 text-left text-sm"
      >
        {expanded ? (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        )}
        <ActionBadge action={batch.action} />
        <span className="font-medium">{batch.item_count} hasil</span>
        <span>{batch.actor || "-"}</span>
        {batch.note ? <span className="truncate text-muted-foreground">{batch.note}</span> : null}
        <span className="ml-auto text-xs text-muted-foreground">{formatDateTime(batch.created_at)}</span>
      </button>
      {expanded ? (
        <div className="border-t px-2 py-2">
          {loading ? (
            <LoadingSpinner message="Memuat detail perubahan..." />
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tidak ada item pada perubahan ini.</p>
          ) : (
            <>
              {entries.map((entry) => (
                <AuditRow key={entry.id} entry={entry} />
              ))}
              <Pager page={page} totalPages={totalPages} disabled={loading} onChange={onPageChange} />
            </>
          )}
        </div>
      ) : null}
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
          <div className="space-y-2">
            {groupByDay(items, (item) => item.created_at).map((group) => (
              <div key={group.key} className="space-y-1">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.label}</h4>
                {group.items.map((item) =>
                  item.kind === "batch" ? (
                    <BatchCard
                      key={`batch-${item.batch_id}`}
                      batch={item}
                      expanded={expandedBatch === item.batch_id}
                      loading={batchLoading}
                      error={batchError}
                      entries={batchEntries}
                      page={batchPage}
                      totalPages={batchTotalPages}
                      onToggle={() => toggleBatch(item.batch_id)}
                      onPageChange={setBatchPage}
                    />
                  ) : (
                    <AuditRow key={`entry-${item.id}`} entry={item} />
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
