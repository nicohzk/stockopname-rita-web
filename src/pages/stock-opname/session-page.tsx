import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import type { RowSelectionState, Updater } from "@tanstack/react-table";
import { Separator } from "@/components/ui/separator";
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
import { Notice, RetryButton } from "@/components/ui/notice";
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
  createStockOpname,
  deleteStockOpname,
  getStockOpnames,
  moveStockOpname,
  setSellFactor,
  updateStockOpname,
} from "@/services/stock-opname.service";
import type {
  ResultSelectionItem,
  SellFactor,
  SellFactorScope,
  SelectionMode,
} from "@/types/stock-opname";
import ResultSelectionBar from "./result/result-selection-bar";
import SellFactorDialog from "./result/sell-factor-dialog";
import SellSummaryCard from "./result/sell-summary-card";
import StockOpnameAddItemButton from "./result/so-add-item-btn";
import StockOpnameMoveDialog from "./result/so-move-dialog";
import AuditTimeline from "./audit/audit-timeline";
import { CoordinatorTable } from "./coordinator/coordinator-table";
import { createColumns as createCoordinatorColumns } from "./coordinator/coordinator-table-column";
import { StockOpnameTable } from "./result/so-table";
import { createColumns as createResultColumns } from "./result/so-table-column";
import ProductMasterCard from "./session/product/product-master-card";
import CoordinatorAddButton from "./session/coordinator-add-btn";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type {
  StockOpname,
  StockOpnameCreateRequest,
  StockOpnameUpdateRequest,
} from "@/types/stock-opname";
import SessionExportMenu from "./session-export-menu";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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
  const [results, setResults] = useState<
    Awaited<ReturnType<typeof getStockOpnames>>["data"]
  >([]);
  const [progress, setProgress] = useState<
    Awaited<ReturnType<typeof getRackProgress>>
  >([]);
  const [racks, setRacks] = useState<Rack[]>([]);
  const [filterCoordinatorId, setFilterCoordinatorId] = useState("");
  const [filterRackId, setFilterRackId] = useState("");
  const [resultPage, setResultPage] = useState(1);
  const [resultSearch, setResultSearch] = useState("");
  const [resultSearchInput, setResultSearchInput] = useState("");
  const [resultTotalPages, setResultTotalPages] = useState(1);
  const [resultTotalItems, setResultTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [refreshWarning, setRefreshWarning] = useState<string>();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"COMPLETED" | "CANCELLED">("COMPLETED");
  const [productCount, setProductCount] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteCode, setDeleteCode] = useState("");
  const [deleteError, setDeleteError] = useState<string>();
  const [deleting, setDeleting] = useState(false);
  const [moveState, setMoveState] = useState<{
    sourceRackId: number;
    sourceRackName: string;
    resultIds?: number[];
    itemCount?: number;
  }>();
  const [auditRefresh, setAuditRefresh] = useState(0);
  const [summaryRefresh, setSummaryRefresh] = useState(0);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selectedItems, setSelectedItems] = useState<Map<number, ResultSelectionItem>>(new Map());
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("manual");
  const [factorTarget, setFactorTarget] = useState<{
    scope: SellFactorScope;
    scopeId?: number;
    label: string;
    itemCount: number;
    currentFactor?: SellFactor;
    mixed?: boolean;
    resultIds?: number[];
  }>();

  const fetchPageData = useCallback(
    () =>
      Promise.all([
        getSession(id),
        getCoordinators(id),
        getStockOpnames({
          sessionId: id,
          coordinatorId: filterCoordinatorId ? Number(filterCoordinatorId) : undefined,
          rakId: filterRackId ? Number(filterRackId) : undefined,
          page: resultPage,
          search: resultSearch,
        }),
        getRackProgress({ sessionId: id }),
        getProductCount(id),
      ]),
    [id, filterCoordinatorId, filterRackId, resultPage, resultSearch],
  );

  const applyPageData = useCallback(
    ([
      loadedSession,
      loadedCoordinators,
      loadedResults,
      loadedProgress,
      loadedProductCount,
    ]: Awaited<ReturnType<typeof fetchPageData>>) => {
      setSession(loadedSession);
      setCoordinators(loadedCoordinators);
      setResults(loadedResults.data);
      setResultPage(loadedResults.pagination.page);
      setResultTotalPages(loadedResults.pagination.total_pages || 1);
      setResultTotalItems(loadedResults.pagination.total_items ?? 0);
      setProgress(loadedProgress);
      setProductCount(loadedProductCount);
      setError(undefined);
    },
    [],
  );

  const loadData = async () => {
    setLoading(true);
    setError(undefined);
    try {
      applyPageData(await fetchPageData());
      setRefreshWarning(undefined);
    } catch (loadError) {
      setError(errorMessage(loadError, "Gagal memuat data sesi."));
    } finally {
      setLoading(false);
    }
  };

  // Runs after a mutation that already succeeded. A failing refresh must never
  // turn that success into an error: report a stale view instead.
  const refreshAfterMutation = async () => {
    try {
      applyPageData(await fetchPageData());
      setError(undefined);
      setRefreshWarning(undefined);
    } catch (refreshError) {
      setRefreshWarning(refreshWarningMessage(refreshError));
    }
  };

  const clearSelection = () => {
    setRowSelection({});
    setSelectedItems(new Map());
    setSelectionMode("manual");
  };

  const handleRowSelectionChange = (updater: Updater<RowSelectionState>) => {
    const next = typeof updater === "function" ? updater(rowSelection) : updater;
    if (Object.keys(next).length > 500) {
      showToast("Maksimal 500 item untuk selection manual.", "error");
      return;
    }
    setRowSelection(next);
    setSelectedItems((previous) => {
      const updated = new Map(previous);
      for (const id of updated.keys()) {
        if (!next[String(id)]) updated.delete(id);
      }
      for (const item of results) {
        if (next[String(item.id)]) {
          updated.set(item.id, {
            id: item.id,
            rackId: item.rackId,
            coordinatorId: item.coordinatorId,
            sellFactor: item.sellFactor,
          });
        } else {
          updated.delete(item.id);
        }
      }
      return updated;
    });
    if (Object.keys(next).length > 0) {
      setSelectionMode("manual");
    }
  };

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
        const data = await fetchPageData();
        if (cancelled) return;
        applyPageData(data);
      } catch (loadError) {
        if (cancelled) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Gagal memuat data sesi.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [id, fetchPageData, applyPageData]);
  useEffect(() => {
    if (!Number.isFinite(id)) return;
    // Filter options only; a failure must not block the result table.
    getRacks({ sessionId: id }).then(setRacks).catch(() => undefined);
  }, [id]);
  useEffect(() => {
    if (resultSearchInput === resultSearch) return;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(undefined);
      setResultSearch(resultSearchInput);
      setResultPage(1);
      setRowSelection({});
      setSelectedItems(new Map());
      setSelectionMode("manual");
    }, 250);
    return () => window.clearTimeout(timer);
  }, [resultSearchInput, resultSearch]);

  const changeStatus = async (status: "COMPLETED" | "CANCELLED") => {
    try {
      await updateSession(id, { status });
    } catch (mutationError) {
      showToast(errorMessage(mutationError, "Gagal memperbarui sesi."), "error");
      return;
    }
    // Reflect the new status right away so the final actions stop being offered
    // even when the follow-up refresh fails.
    setSession((current) => (current ? { ...current, status } : current));
    showToast(`Sesi berhasil ${status === "COMPLETED" ? "diselesaikan" : "dibatalkan"}.`);
    await refreshAfterMutation();
  };
  const handleResultUpdate = async (
    resultId: number,
    data: StockOpnameUpdateRequest,
  ) => {
    try {
      await updateStockOpname(resultId, data);
    } catch (mutationError) {
      showToast(
        errorMessage(mutationError, "Gagal memperbarui data stock opname."),
        "error",
      );
      throw mutationError;
    }
    showToast("Data stock opname berhasil diperbarui.");
    clearSelection();
    setAuditRefresh((value) => value + 1);
    setSummaryRefresh((value) => value + 1);
    await refreshAfterMutation();
  };
  const handleResultDelete = async (resultId: number) => {
    try {
      await deleteStockOpname(resultId);
    } catch (mutationError) {
      showToast(
        errorMessage(mutationError, "Gagal menghapus data stock opname."),
        "error",
      );
      return;
    }
    showToast("Data stock opname berhasil dihapus.");
    clearSelection();
    setAuditRefresh((value) => value + 1);
    setSummaryRefresh((value) => value + 1);
    await refreshAfterMutation();
  };
  const handleResultCreate = async (data: StockOpnameCreateRequest) => {
    try {
      await createStockOpname(data);
    } catch (mutationError) {
      showToast(errorMessage(mutationError, "Gagal menambahkan item."), "error");
      throw mutationError;
    }
    showToast("Item berhasil ditambahkan.");
    clearSelection();
    setAuditRefresh((value) => value + 1);
    setSummaryRefresh((value) => value + 1);
    await refreshAfterMutation();
  };

  const handleMoveRequest = (item: { rackId: number; rackName: string; id: number }) => {
    setMoveState({
      sourceRackId: item.rackId,
      sourceRackName: item.rackName,
      resultIds: [item.id],
      itemCount: 1,
    });
  };

  const handleMoveSubmit = async (targetRakId: number, note: string) => {
    if (!moveState) return;
    const result = await moveStockOpname({
      sourceRakId: moveState.sourceRackId,
      targetRakId,
      resultIds: moveState.resultIds,
      note,
    });
    clearSelection();
    setAuditRefresh((value) => value + 1);
    setSummaryRefresh((value) => value + 1);
    showToast(
      `${result.data.moved_count} item dipindah${result.data.merged_count ? `, ${result.data.merged_count} digabung` : ""}.`,
    );
    await refreshAfterMutation();
  };

  const handleCoordinatorFilter = (value: string) => {
    setLoading(true);
    setError(undefined);
    setFilterCoordinatorId(value);
    setFilterRackId("");
    setResultPage(1);
    clearSelection();
  };
  const handleRackFilter = (value: string) => {
    setLoading(true);
    setError(undefined);
    setFilterRackId(value);
    setResultPage(1);
    clearSelection();
  };
  const handleResultPageChange = (nextPage: number) => {
    setLoading(true);
    setError(undefined);
    setResultPage(nextPage);
  };
  const coordinatorCodeById = new Map(coordinators.map((coordinator) => [coordinator.id, coordinator.code]));
  const coordinatorStatusById = new Map(coordinators.map((coordinator) => [coordinator.id, coordinator.status]));
  const isResultReadOnly = (item: StockOpname) => {
    const status = coordinatorStatusById.get(item.coordinatorId);
    return session?.status !== "IN_PROGRESS" || status === "COMPLETED" || status === "CANCELLED";
  };

  const selectedItemsList = Array.from(selectedItems.values());
  const selectedCount = selectedItemsList.length;
  const selectedRackId = selectedItemsList.length > 0
    ? selectedItemsList.every((item) => item.rackId === selectedItemsList[0].rackId)
      ? selectedItemsList[0].rackId
      : undefined
    : undefined;
  const selectedRack = selectedRackId !== undefined
    ? racks.find((rack) => rack.id === selectedRackId)
    : undefined;
  const mixedSelectedFactor = new Set(selectedItemsList.map((item) => item.sellFactor)).size > 1;
  const sourceCoordinatorStatus = selectedRack
    ? coordinatorStatusById.get(selectedRack.coordinatorId)
    : undefined;
  const moveDisabledReason = selectedCount === 0
    ? "Pilih item terlebih dahulu."
    : selectedRackId === undefined
      ? "Pilih item dari satu rak untuk memindahkan."
      : !selectedRack
        ? "Rak sumber tidak ditemukan."
        : session?.status !== "IN_PROGRESS"
          ? "Sesi sudah final."
          : sourceCoordinatorStatus === "COMPLETED" || sourceCoordinatorStatus === "CANCELLED"
            ? "Koordinator sudah final."
            : undefined;

  const filterActive = resultSearch.trim() !== "" || filterCoordinatorId !== "" || filterRackId !== "";

  const openItemFactor = (item: StockOpname) => {
    setFactorTarget({
      scope: "item",
      scopeId: item.id,
      label: item.name,
      itemCount: 1,
      currentFactor: item.sellFactor,
    });
  };

  const openSessionFactor = () => {
    setFactorTarget({
      scope: "session",
      label: session?.code ?? "Sesi",
      itemCount: progress[0]?.total_items ?? 0,
    });
  };

  const openSelectedFactor = () => {
    setFactorTarget({
      scope: "items",
      resultIds: selectedItemsList.map((item) => item.id),
      label: `${selectedCount} item terpilih`,
      itemCount: selectedCount,
      mixed: mixedSelectedFactor,
    });
  };

  const activateFilterMode = () => {
    setRowSelection({});
    setSelectedItems(new Map());
    setSelectionMode("filter");
  };

  const openFilterFactor = () => {
    setFactorTarget({
      scope: "filter",
      label: "Semua hasil filter",
      itemCount: resultTotalItems,
      mixed: true,
    });
  };

  const openSelectedMove = () => {
    if (selectedCount === 0 || !selectedRack || moveDisabledReason) return;
    setMoveState({
      sourceRackId: selectedRack.id,
      sourceRackName: selectedRack.name,
      resultIds: selectedItemsList.map((item) => item.id),
      itemCount: selectedCount,
    });
  };

  const handleFactorSubmit = async (factor: SellFactor, note: string) => {
    if (!factorTarget) return;
    try {
      const result = await setSellFactor(id, {
        scope: factorTarget.scope,
        scopeId: factorTarget.scopeId,
        resultIds: factorTarget.resultIds,
        filter: factorTarget.scope === "filter"
          ? {
              search: resultSearch.trim() || undefined,
              coordinatorId: filterCoordinatorId ? Number(filterCoordinatorId) : undefined,
              rakId: filterRackId ? Number(filterRackId) : undefined,
            }
          : undefined,
        factor,
        note,
      });
      showToast(
        result.updated_count === 0
          ? "Tidak ada perubahan faktor."
          : `${result.updated_count} item berhasil diubah faktornya.`,
      );
    } catch (mutationError) {
      showToast(errorMessage(mutationError, "Gagal mengubah faktor jual."), "error");
      throw mutationError;
    }
    clearSelection();
    setFactorTarget(undefined);
    setAuditRefresh((value) => value + 1);
    setSummaryRefresh((value) => value + 1);
    await refreshAfterMutation();
  };

  const rackOptions = racks.filter(
    (rack) => !filterCoordinatorId || rack.coordinatorId === Number(filterCoordinatorId),
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
      <div className="p-4 text-destructive">
        {error ?? "Sesi tidak ditemukan."}
      </div>
    );
  const rack = progress[0];
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
      {error ? (
        <Notice
          tone="error"
          message={error}
          action={
            <RetryButton onRetry={() => void loadData()} retrying={loading} />
          }
        />
      ) : null}
      <div className="mb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink render={<Link to="/stock-opname" />} className="text-xs">
                    Stock Opname
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-xs">{session.code}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-2xl font-bold mt-2">{session.code}</h1>
            <StatusBadge className="my-2" status={session.status} />
            <p>{session.location}</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-5">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={openSessionFactor}
                disabled={(rack?.total_items ?? 0) === 0 || (rack?.total_items ?? 0) > 1000}
                title={
                  (rack?.total_items ?? 0) === 0
                    ? "Belum ada hasil stock opname."
                    : (rack?.total_items ?? 0) > 1000
                      ? "Lebih dari 1000 hasil; pecah per koordinator/rak."
                      : undefined
                }
              >
                Faktor Jual
              </Button>
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
            <Button
              variant="secondary"
              onClick={() => navigate("/stock-opname")}
            >
              Kembali
            </Button>
          </div>
        </div>
        <Separator className="mt-2" />
      </div>
      <div className="mb-5 grid gap-3 sm:gap-5 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Progres</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{progressPercent}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Status Rak</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {rack?.rackCompleted ?? 0}/{rack?.rackAssigned ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Barang</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{rack?.total_items ?? 0}</p>
          </CardContent>
        </Card>
      </div>
      <SellSummaryCard sessionId={id} refreshKey={summaryRefresh} />
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
      <Card className="my-5">
        <CardHeader>
          <CardTitle>Data Barang Stock Opname</CardTitle>
          <CardDescription>Data terkini hasil koreksi admin</CardDescription>
        </CardHeader>
        <CardContent>
          <ResultSelectionBar
            mode={selectionMode}
            count={selectionMode === "filter" ? resultTotalItems : selectedCount}
            onFactor={selectionMode === "filter" ? openFilterFactor : openSelectedFactor}
            onMove={selectionMode === "filter" ? undefined : openSelectedMove}
            moveDisabledReason={selectionMode === "filter" ? undefined : moveDisabledReason}
            onClear={clearSelection}
          />
          <StockOpnameTable
            columns={createResultColumns(
              handleResultUpdate,
              handleResultDelete,
              handleMoveRequest,
              isResultReadOnly,
              openItemFactor,
            )}
            data={results}
            selectable
            rowSelection={rowSelection}
            onRowSelectionChange={handleRowSelectionChange}
            getRowId={(item) => String(item.id)}
            filters={
              <div className="flex flex-wrap gap-2">
                <select
                  aria-label="Filter koordinator"
                  className="h-9 min-w-40 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-background [&>option]:text-foreground"
                  value={filterCoordinatorId}
                  onChange={(event) => handleCoordinatorFilter(event.target.value)}
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
                  value={filterRackId}
                  onChange={(event) => handleRackFilter(event.target.value)}
                  disabled={rackOptions.length === 0}
                >
                  <option value="">Semua rak</option>
                  {rackOptions.map((rack) => (
                    <option key={rack.id} value={rack.id}>
                      {filterCoordinatorId
                        ? rack.name
                        : `${rack.name} - ${coordinatorCodeById.get(rack.coordinatorId) ?? ""}`}
                    </option>
                  ))}
                </select>
                {filterActive ? (
                  <Button
                    variant={selectionMode === "filter" ? "default" : "outline"}
                    size="sm"
                    onClick={activateFilterMode}
                    disabled={selectionMode === "filter" || resultTotalItems === 0 || resultTotalItems > 1000}
                    title={
                      resultTotalItems > 1000
                        ? "Persempit filter; maksimal 1000 baris."
                        : undefined
                    }
                  >
                    Pilih semua {resultTotalItems} hasil filter
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
            onSearch={setResultSearchInput}
            searchValue={resultSearchInput}
            loading={loading}
            page={resultPage}
            totalPages={resultTotalPages}
            onPageChange={handleResultPageChange}
          />
        </CardContent>
      </Card>
      <AuditTimeline key={`session-${id}`} sessionId={id} refreshKey={auditRefresh} />
      {moveState ? (
        <StockOpnameMoveDialog
          open
          onOpenChange={(open) => { if (!open) setMoveState(undefined); }}
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
      <SellFactorDialog
        key={`${factorTarget?.scope ?? "closed"}-${factorTarget?.scopeId ?? ""}-${factorTarget?.itemCount ?? 0}`}
        open={Boolean(factorTarget)}
        onOpenChange={(open) => { if (!open) setFactorTarget(undefined); }}
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
