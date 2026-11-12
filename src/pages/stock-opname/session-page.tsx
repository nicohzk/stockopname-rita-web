import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { Notice, ErrorState, RetryButton } from "@/components/ui/notice";
import { errorMessage, refreshWarningMessage } from "@/lib/errors";
import { LoadingSpinner } from "@/components/ui/loading";
import { Printer } from "lucide-react";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { getSession, updateSession, deleteSession } from "@/services/session.service";
import { getProductCount } from "@/services/product.service";
import { getCoordinators } from "@/services/coordinator.service";
import { getRackProgress, getRacks } from "@/services/rack.service";
import type { Rack } from "@/types/rack";
import {
  getSellSummary,
} from "@/services/stock-opname.service";
import type { SellSummaryGroup } from "@/types/stock-opname";
import { useResultTable } from "./hooks/use-result-table";
import ResultCard from "./result/result-card";
import QtyFactorDialog from "./result/qty-factor-dialog";
import SellSummaryCard from "./result/sell-summary-card";
import StockOpnameAddItemButton from "./result/so-add-item-btn";
import StockOpnameMoveDialog from "./result/so-move-dialog";
import AuditSection from "./audit/audit-section";
import { CoordinatorTable } from "./coordinator/coordinator-table";
import { createColumns as createCoordinatorColumns } from "./coordinator/coordinator-table-column";
import ProductMasterCard from "./session/product/product-master-card";
import CoordinatorAddButton from "./session/coordinator-add-btn";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { StockOpname } from "@/types/stock-opname";
import SessionExportMenu from "./session-export-menu";
import PageHeader from "./session/page-header";
import SummaryCards from "./session/summary-cards";

// Each part of the page loads independently: one failing request must not take
// the others down with it. The result table is not listed here: it loads and
// refreshes on its own through useResultTable.
type PageSection = "session" | "coordinators" | "progress" | "productCount" | "sellTotal";

const SECTION_LABELS: Record<PageSection, string> = {
  session: "sesi",
  coordinators: "koordinator",
  progress: "progres rak",
  productCount: "jumlah produk",
  sellTotal: "nilai jual",
};

function describeSections(sections: PageSection[]): string {
  return sections.map((section) => SECTION_LABELS[section]).join(", ");
}

export default function SessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const id = Number(sessionId);
  const [session, setSession] =
    useState<Awaited<ReturnType<typeof getSession>>>();
  const [coordinators, setCoordinators] = useState<
    Awaited<ReturnType<typeof getCoordinators>>
  >([]);
  const [progress, setProgress] = useState<
    Awaited<ReturnType<typeof getRackProgress>>
  >([]);
  const [racks, setRacks] = useState<Rack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [refreshWarning, setRefreshWarning] = useState<string>();
  const [failedSections, setFailedSections] = useState<PageSection[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"COMPLETED" | "CANCELLED">("COMPLETED");
  const [productCount, setProductCount] = useState<number>();
  const [sellTotal, setSellTotal] = useState<SellSummaryGroup>();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteCode, setDeleteCode] = useState("");
  const [deleteError, setDeleteError] = useState<string>();
  const [deleting, setDeleting] = useState(false);
  const [auditRefresh, setAuditRefresh] = useState(0);
  const [summaryRefresh, setSummaryRefresh] = useState(0);

  const coordinatorStatusById = new Map(
    coordinators.map((coordinator) => [coordinator.id, coordinator.status]),
  );
  const isResultReadOnly = (item: StockOpname) => {
    const status = coordinatorStatusById.get(item.coordinatorId);
    return session?.status !== "IN_PROGRESS" || status === "COMPLETED" || status === "CANCELLED";
  };

  // Mutasi memanggil penyegaran halaman lewat ref: refreshAfterMutation baru ada
  // setelah data pertama dimuat, sedangkan hook perlu callback-nya sejak awal.
  const refreshRef = useRef<() => void>(() => {});
  const table = useResultTable({
    sessionId: id,
    sessionStatus: session?.status,
    coordinators,
    racks,
    bulkScope: { scope: "session", label: session?.code ?? "Sesi" },
    moveBlockedMessages: {
      session: "Sesi sudah final.",
      coordinator: "Koordinator sudah final.",
    },
    onChanged: () => {
      setAuditRefresh((value) => value + 1);
      setSummaryRefresh((value) => value + 1);
      refreshRef.current();
    },
    showToast,
  });
  const {
    selectionMode,
    activateFilterMode,
    openResultFromAudit,
    moveState,
    closeMove,
    handleMoveSubmit,
    factorTarget,
    closeFactor,
    handleFactorSubmit,
    handleResultCreate,
  } = table;

  const fetchPageData = useCallback(
    () =>
      Promise.allSettled([
        getSession(id),
        getCoordinators(id),
        getRackProgress({ sessionId: id }),
        getProductCount(id),
        getSellSummary(id, "session"),
      ]),
    [id],
  );

  // Applies whatever actually arrived and reports which sections failed, so one
  // broken endpoint cannot discard the data that did load.
  const applyOutcomes = useCallback(
    ([
      sessionOutcome,
      coordinatorsOutcome,
      progressOutcome,
      productCountOutcome,
      sellTotalOutcome,
    ]: Awaited<ReturnType<typeof fetchPageData>>) => {
      const failed: PageSection[] = [];

      if (sessionOutcome.status === "fulfilled") {
        setSession(sessionOutcome.value);
      } else {
        failed.push("session");
      }

      if (coordinatorsOutcome.status === "fulfilled") {
        setCoordinators(coordinatorsOutcome.value);
      } else {
        failed.push("coordinators");
      }

      if (progressOutcome.status === "fulfilled") {
        setProgress(progressOutcome.value);
      } else {
        failed.push("progress");
      }

      if (productCountOutcome.status === "fulfilled") {
        setProductCount(productCountOutcome.value);
      } else {
        failed.push("productCount");
      }

      if (sellTotalOutcome.status === "fulfilled") {
        setSellTotal(sellTotalOutcome.value.groups[0]);
      } else {
        failed.push("sellTotal");
      }

      return failed;
    },
    [],
  );

  // A page without a session has nothing to render, so that failure also sets
  // the fatal `error`; the render decides between the error screen (no session
  // yet) and the warning banner (session already on screen).
  const reportOutcomes = useCallback(
    (outcomes: Awaited<ReturnType<typeof fetchPageData>>) => {
      const failed = applyOutcomes(outcomes);
      const sessionOutcome = outcomes[0];

      if (sessionOutcome.status === "rejected") {
        setError(errorMessage(sessionOutcome.reason, "Gagal memuat data sesi."));
      } else {
        setError(undefined);
      }

      setFailedSections(failed);
    },
    [applyOutcomes],
  );

  const loadData = async () => {
    setLoading(true);
    setError(undefined);
    try {
      reportOutcomes(await fetchPageData());
      setRefreshWarning(undefined);
    } finally {
      setLoading(false);
    }
  };

  // Runs after a mutation that already succeeded. A failing refresh must never
  // turn that success into an error: report a stale view instead.
  const refreshAfterMutation = async () => {
    const outcomes = await fetchPageData();
    reportOutcomes(outcomes);
    const rejected = outcomes.find((outcome) => outcome.status === "rejected");
    if (rejected && rejected.status === "rejected") {
      setRefreshWarning(refreshWarningMessage(rejected.reason));
    } else {
      setRefreshWarning(undefined);
    }
  };

  // Hook mutasi memanggil callback ini; ref menunjuk versi terbaru tiap render.
  useEffect(() => {
    refreshRef.current = () => void refreshAfterMutation();
  });

  const refreshProductCount = async () => {
    try {
      setProductCount(await getProductCount(id));
    } catch {
      // Count refresh is best-effort; the next loadData retries.
    }
  };

  const handleCoordinatorCreated = async () => {
    await loadData();
    try {
      setRacks(await getRacks({ sessionId: id }));
    } catch {
      // Rack filters refresh is best-effort; the next page load retries.
    }
  };

  const handleDeleteSession = async () => {
    setDeleting(true);
    setDeleteError(undefined);
    try {
      await deleteSession(id);
      showToast("Sesi berhasil dihapus.");
      navigate("/stock-opname");
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Gagal menghapus sesi.";
      setDeleteError(message);
      showToast(message, "error");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!Number.isFinite(id)) return;
    let cancelled = false;
    const run = async () => {
      try {
        const outcomes = await fetchPageData();
        if (cancelled) return;
        reportOutcomes(outcomes);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [id, fetchPageData, reportOutcomes]);
  useEffect(() => {
    if (!Number.isFinite(id)) return;
    // Filter options only; a failure must not block the result table.
    getRacks({ sessionId: id }).then(setRacks).catch(() => undefined);
  }, [id]);

  const changeStatus = async (status: "COMPLETED" | "CANCELLED") => {
    try {
      await updateSession(id, { status });
    } catch (mutationError) {
      showToast(errorMessage(mutationError, "Gagal memperbarui sesi."), "error");
      throw mutationError;
    }
    // Reflect the new status right away so the final actions stop being offered
    // even when the follow-up refresh fails.
    setSession((current) => (current ? { ...current, status } : current));
    showToast(`Sesi berhasil ${status === "COMPLETED" ? "diselesaikan" : "dibatalkan"}.`);
    void refreshAfterMutation();
  };

  const coordinatorCodeById = new Map(coordinators.map((coordinator) => [coordinator.id, coordinator.code]));
  const rackOptions = racks.filter(
    (rack) => !table.coordinatorFilter || rack.coordinatorId === Number(table.coordinatorFilter),
  );
  const activeCoordinatorCount = coordinators.filter(
    (coordinator) => coordinator.status === "IN_PROGRESS",
  ).length;
  const handlePrintAllQR = () => {
    const win = window.open(
      `/stock-opname/sesi/${id}/print-qr?all=1&auto=1`,
      "_blank",
    );
    if (!win) showToast("Popup diblokir. Izinkan popup untuk mencetak.", "error");
  };

  if (!Number.isFinite(id)) {
    return (
      <div className="p-4 text-destructive">ID sesi tidak valid.</div>
    );
  }

  if (loading && !session) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center">
        <LoadingSpinner message="Memuat data sesi..." />
      </div>
    );
  }
  if (!session)
    return (
      <ErrorState
        message={error ?? "Sesi tidak ditemukan."}
        onRetry={() => void loadData()}
        retrying={loading}
      />
    );
  const rack = progress[0];
  const progressFailed = failedSections.includes("progress");
  const sellTotalFailed = failedSections.includes("sellTotal");
  const progressPercent = rack?.rackAssigned
    ? Math.round((rack.rackCompleted / rack.rackAssigned) * 100)
    : 0;

  return (
    <div className="min-w-0 p-0 sm:p-2">
      {refreshWarning ? (
        <Notice
          message={refreshWarning}
          action={
            <RetryButton onRetry={() => void loadData()} retrying={loading} />
          }
        />
      ) : null}
      {!refreshWarning && failedSections.length > 0 ? (
        <Notice
          message={`Sebagian data gagal dimuat: ${describeSections(failedSections)}. Menampilkan data terakhir yang berhasil dimuat.`}
          action={
            <RetryButton onRetry={() => void loadData()} retrying={loading} />
          }
        />
      ) : null}
      <PageHeader
        title={session.code}
        status={session.status}
        subtitle={<p>{session.location}</p>}
        actions={
          <>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                onClick={() => { setPendingAction("COMPLETED"); setConfirmOpen(true); }}
                disabled={session.status !== "IN_PROGRESS" || productCount === 0}
                title={productCount === 0 ? "Sesi belum punya produk." : undefined}
              >
                Selesai
              </Button>
              <Button
                variant="destructive"
                onClick={() => { setPendingAction("CANCELLED"); setConfirmOpen(true); }}
                disabled={session.status !== "IN_PROGRESS"}
              >
                Batal
              </Button>
              {(session.status !== "IN_PROGRESS" || productCount === 0) && (
                <Button
                  variant="destructive"
                  onClick={() => { setDeleteCode(""); setDeleteError(undefined); setDeleteOpen(true); }}
                >
                  Hapus Sesi
                </Button>
              )}
            </div>
            <SessionExportMenu sessionId={id} sessionCode={session.code} />
            <Button variant="secondary" onClick={() => navigate("/stock-opname")}>
              Kembali
            </Button>
          </>
        }
      />
      <SummaryCards
        progressFailed={progressFailed}
        progressPercent={progressPercent}
        rackCompleted={rack?.rackCompleted}
        rackAssigned={rack?.rackAssigned}
        totalItems={rack?.total_items}
        sellTotal={sellTotal}
        sellTotalFailed={sellTotalFailed}
      />
      {session.status === "IN_PROGRESS" && productCount === 0 && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          Sesi belum punya produk. Join koordinator dan scan hasil stock opname diblokir sampai produk diimpor atau ditambahkan. Sesi juga tidak bisa diselesaikan.
        </div>
      )}
      <div className="my-5">
        <ProductMasterCard
          sessionId={id}
          sessionStatus={session.status}
          onProductsChanged={refreshProductCount}
        />
      </div>
      <Card className="my-5">
        <CardHeader>
          <CardTitle>Data Koordinator</CardTitle>
          <CardDescription>Daftar koordinator yang bertugas dalam sesi ini</CardDescription>
          <CardAction>
            <div className="flex flex-wrap gap-2">
              <CoordinatorAddButton
                sessionId={id}
                disabled={session.status !== "IN_PROGRESS"}
                onCreated={handleCoordinatorCreated}
              />
              <Button
                variant="outline"
                onClick={handlePrintAllQR}
                disabled={activeCoordinatorCount === 0}
                title={
                  activeCoordinatorCount === 0
                    ? "Tidak ada koordinator berstatus In Progress."
                    : undefined
                }
              >
                <Printer />
                Cetak Semua QR
              </Button>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          <CoordinatorTable
            columns={createCoordinatorColumns(sessionId ?? "", racks)}
            data={coordinators}
          />
        </CardContent>
      </Card>
      <SellSummaryCard sessionId={id} refreshKey={summaryRefresh} />
      <ResultCard
        table={table}
        isRowReadOnly={isResultReadOnly}
        filters={
          <div className="flex flex-wrap gap-2">
            <select
              aria-label="Filter koordinator"
              className="h-9 min-w-40 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-background [&>option]:text-foreground"
              value={table.coordinatorFilter}
              onChange={(event) => table.handleCoordinatorFilter(event.target.value)}
            >
              <option value="">Semua koordinator</option>
              {coordinators.map((coordinator) => (
                <option key={coordinator.id} value={coordinator.id}>
                  {coordinator.code}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter rak"
              className="h-9 min-w-40 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-background [&>option]:text-foreground"
              value={table.rackFilter}
              onChange={(event) => table.handleRackFilter(event.target.value)}
              disabled={rackOptions.length === 0}
            >
              <option value="">Semua rak</option>
              {rackOptions.map((rak) => (
                <option key={rak.id} value={rak.id}>
                  {table.coordinatorFilter
                    ? rak.name
                    : `${rak.name} - ${coordinatorCodeById.get(rak.coordinatorId) ?? ""}`}
                </option>
              ))}
            </select>
            {table.totalItems > 0 && selectionMode !== "filter" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={activateFilterMode}
                disabled={table.totalItems > 1000}
                title={
                  table.totalItems > 1000
                    ? table.filterActive
                      ? "Persempit filter; maksimal 1000 baris."
                      : "Maksimal 1000 baris; persempit lewat filter."
                    : undefined
                }
              >
                Pilih semua {table.totalItems} hasil{table.filterActive ? " filter" : ""}
              </Button>
            ) : null}
          </div>
        }
        addButton={
          <StockOpnameAddItemButton
            sessionId={id}
            coordinators={coordinators}
            onSubmit={handleResultCreate}
            disabled={session.status === "COMPLETED" || session.status === "CANCELLED"}
          />
        }
      />
      <AuditSection sessionId={id} refreshKey={auditRefresh} onOpenResult={openResultFromAudit} />
      {moveState ? (
        <StockOpnameMoveDialog
          open
          onOpenChange={(open) => { if (!open) closeMove(); }}
          sourceRack={racks.find((rack) => rack.id === moveState.sourceRackId)}
          racks={racks}
          coordinators={coordinators}
          resultIds={moveState.resultIds}
          itemCount={moveState.itemCount}
          onSubmit={handleMoveSubmit}
        />
      ) : null}
      <AlertDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={pendingAction === "COMPLETED" ? "Selesaikan Sesi?" : "Batalkan Sesi?"}
        description={
          pendingAction === "COMPLETED"
            ? "Sesi akan ditandai sebagai selesai."
            : "Sesi akan dibatalkan. Tindakan ini tidak dapat dibatalkan."
        }
        confirmLabel={pendingAction === "COMPLETED" ? "Selesai" : "Batalkan"}
        pendingLabel={
          pendingAction === "COMPLETED" ? "Menyelesaikan..." : "Membatalkan..."
        }
        destructive={pendingAction === "CANCELLED"}
        onConfirm={() => changeStatus(pendingAction)}
      />
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Hapus Sesi?</DialogTitle>
            <DialogDescription>
              Sesi <b>{session.code}</b> dan seluruh datanya (produk, barcode, rak, koordinator, hasil stock opname) akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={deleteCode}
            onChange={(event) => setDeleteCode(event.target.value)}
            placeholder={`Ketik ${session.code} untuk konfirmasi`}
          />
          {deleteError ? <p className="text-sm text-destructive">{deleteError}</p> : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Batal
            </Button>
            <Button
              variant="destructive"
              disabled={deleting || deleteCode !== session.code}
              onClick={() => void handleDeleteSession()}
            >
              {deleting ? "Menghapus..." : "Hapus Sesi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <QtyFactorDialog
        key={`${factorTarget?.scope ?? "closed"}-${factorTarget?.scopeId ?? ""}-${factorTarget?.itemCount ?? 0}`}
        open={Boolean(factorTarget)}
        onOpenChange={(open) => { if (!open) closeFactor(); }}
        scope={factorTarget?.scope ?? "item"}
        label={factorTarget?.label ?? ""}
        itemCount={factorTarget?.itemCount ?? 0}
        currentFactor={factorTarget?.currentFactor}
        mixed={factorTarget?.mixed}
        onSubmit={handleFactorSubmit}
      />
    </div>
  );
}
