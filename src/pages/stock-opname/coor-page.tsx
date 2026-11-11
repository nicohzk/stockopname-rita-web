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
import { Notice, ErrorState, RetryButton } from "@/components/ui/notice";
import { errorMessage, refreshWarningMessage } from "@/lib/errors";
import { LoadingSpinner } from "@/components/ui/loading";
import { AlertDialog } from "@/components/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getSession } from "@/services/session.service";
import {
  getCoordinator,
  getCoordinators,
  updateCoordinator,
} from "@/services/coordinator.service";
import { deleteRack, getRackProgress, getRacks } from "@/services/rack.service";
import { getUploads } from "@/services/upload.service";
import {
  createStockOpname,
  deleteStockOpname,
  getStockOpnames,
  moveStockOpname,
  setQtyFactor,
  updateStockOpname,
} from "@/services/stock-opname.service";
import type {
  ResultSelectionItem,
  QtyFactor,
  QtyFactorScope,
  SelectionMode,
} from "@/types/stock-opname";
import ResultSelectionBar from "./result/result-selection-bar";
import QtyFactorDialog from "./result/qty-factor-dialog";
import StockOpnameAddItemButton from "./result/so-add-item-btn";
import StockOpnameMoveDialog from "./result/so-move-dialog";
import AuditTimeline from "./audit/audit-timeline";
import { RackTable } from "./rack/rack-table";
import { RackSeatMap } from "./rack/rack-seat-map";
import { createColumns as createRackColumns } from "./rack/rack-table-column";
import { UploadTable } from "./upload/upload-table";
import { createColumns as createUploadColumns } from "./upload/upload-table-column";
import { StockOpnameTable } from "./result/so-table";
import { createColumns as createResultColumns } from "./result/so-table-column";
import type {
  StockOpnameCreateRequest,
  StockOpnameUpdateRequest,
} from "@/types/stock-opname";
import type { Rack } from "@/types/rack";
import type { Upload } from "@/types/upload";
import type { Coordinator } from "@/types/coordinator";
import { Printer } from "lucide-react";
import CoordinatorPrintMenu from "./coordinator-print-menu";
import { openCoordinatorUploadSummary, openUploadReport } from "@/services/report.service";
import { StatusBadge } from "@/components/ui/status-badge";
import CoordinatorQRModal from "@/components/CoordinatorQRModal";

// Each block of the page loads independently: one failing request must not take
// the others down with it.
type PageSection =
  | "session"
  | "coordinator"
  | "results"
  | "progress"
  | "racks"
  | "coordinators"
  | "uploads";

const SECTION_LABELS: Record<PageSection, string> = {
  session: "sesi",
  coordinator: "koordinator",
  results: "daftar hasil",
  progress: "progres rak",
  racks: "daftar rak",
  coordinators: "daftar koordinator",
  uploads: "upload",
};

function describeSections(sections: PageSection[]): string {
  return sections.map((section) => SECTION_LABELS[section]).join(", ");
}

export default function CoorPage() {
  const { sessionId, coorId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const id = Number(coorId);
  const session = Number(sessionId);
  const [sessionData, setSessionData] =
    useState<Awaited<ReturnType<typeof getSession>>>();
  const [coordinator, setCoordinator] =
    useState<Awaited<ReturnType<typeof getCoordinator>>>();
  const [racks, setRacks] = useState<Rack[]>([]);
  const [allRacks, setAllRacks] = useState<Rack[]>([]);
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [moveState, setMoveState] = useState<{
    sourceRackId: number;
    sourceRackName: string;
    resultIds?: number[];
    itemCount?: number;
  }>();
  const [auditRefresh, setAuditRefresh] = useState(0);
  const [results, setResults] = useState<
    Awaited<ReturnType<typeof getStockOpnames>>["data"]
  >([]);
  const [progress, setProgress] = useState<
    Awaited<ReturnType<typeof getRackProgress>>
  >([]);
  const [resultPage, setResultPage] = useState(1);
  const [resultSearch, setResultSearch] = useState("");
  const [resultSearchInput, setResultSearchInput] = useState("");
  const [filterRackId, setFilterRackId] = useState("");
  const [resultTotalPages, setResultTotalPages] = useState(1);
  const [resultTotalItems, setResultTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [refreshWarning, setRefreshWarning] = useState<string>();
  const [failedSections, setFailedSections] = useState<PageSection[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"COMPLETED" | "CANCELLED">("COMPLETED");
  const [qrOpen, setQrOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selectedItems, setSelectedItems] = useState<Map<number, ResultSelectionItem>>(new Map());
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("manual");
  const [factorTarget, setFactorTarget] = useState<{
    scope: QtyFactorScope;
    scopeId?: number;
    label: string;
    itemCount: number;
    currentFactor?: QtyFactor;
    mixed?: boolean;
    resultIds?: number[];
  }>();

  const fetchPageData = useCallback(async () => {
    const [sessionOutcome, coordinatorOutcome, resultsOutcome, progressOutcome] =
      await Promise.allSettled([
        getSession(session),
        getCoordinator(id),
        getStockOpnames({
          sessionId: session,
          coordinatorId: id,
          rakId: filterRackId ? Number(filterRackId) : undefined,
          page: resultPage,
          search: resultSearch,
        }),
        getRackProgress({ sessionId: session, coordinatorId: id }),
      ]);
    const [racksOutcome, allRacksOutcome, coordinatorsOutcome, uploadsOutcome] =
      await Promise.allSettled([
        getRacks({ sessionId: session, coordinatorId: id }),
        getRacks({ sessionId: session }),
        getCoordinators(session),
        getUploads(id),
      ]);
    return {
      sessionOutcome,
      coordinatorOutcome,
      resultsOutcome,
      progressOutcome,
      racksOutcome,
      allRacksOutcome,
      coordinatorsOutcome,
      uploadsOutcome,
    };
  }, [session, id, filterRackId, resultPage, resultSearch]);

  // Applies whatever actually arrived; a failed section keeps its previous data
  // instead of blanking the card.
  const applyOutcomes = useCallback(
    (data: Awaited<ReturnType<typeof fetchPageData>>) => {
      const failed: PageSection[] = [];

      if (data.sessionOutcome.status === "fulfilled") {
        setSessionData(data.sessionOutcome.value);
      } else {
        failed.push("session");
      }

      if (data.coordinatorOutcome.status === "fulfilled") {
        setCoordinator(data.coordinatorOutcome.value);
      } else {
        failed.push("coordinator");
      }

      if (data.resultsOutcome.status === "fulfilled") {
        setResults(data.resultsOutcome.value.data);
        setResultPage(data.resultsOutcome.value.pagination.page);
        setResultTotalPages(data.resultsOutcome.value.pagination.total_pages || 1);
        setResultTotalItems(data.resultsOutcome.value.pagination.total_items ?? 0);
      } else {
        failed.push("results");
      }

      if (data.progressOutcome.status === "fulfilled") {
        setProgress(data.progressOutcome.value);
      } else {
        failed.push("progress");
      }

      if (data.racksOutcome.status === "fulfilled") {
        setRacks(data.racksOutcome.value);
      } else {
        failed.push("racks");
      }

      if (data.allRacksOutcome.status === "fulfilled") {
        setAllRacks(data.allRacksOutcome.value);
      } else {
        failed.push("racks");
      }

      if (data.coordinatorsOutcome.status === "fulfilled") {
        setCoordinators(data.coordinatorsOutcome.value);
      } else {
        failed.push("coordinators");
      }

      if (data.uploadsOutcome.status === "fulfilled") {
        setUploads(data.uploadsOutcome.value);
      } else {
        failed.push("uploads");
      }

      return Array.from(new Set(failed));
    },
    [],
  );

  // The coordinator and its session are the page context: without them there is
  // nothing safe to render, so their failure also sets the fatal `error`. The
  // render decides between the error screen (nothing loaded yet) and the
  // warning banner (page already on screen).
  const reportOutcomes = useCallback(
    (outcomes: Awaited<ReturnType<typeof fetchPageData>>) => {
      const failed = applyOutcomes(outcomes);
      const { coordinatorOutcome, sessionOutcome } = outcomes;

      let failure: unknown;
      if (coordinatorOutcome.status === "rejected") {
        failure = coordinatorOutcome.reason;
      } else if (sessionOutcome.status === "rejected") {
        failure = sessionOutcome.reason;
      }

      if (failure !== undefined) {
        setError(errorMessage(failure, "Gagal memuat data koordinator."));
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
    const rejected = [
      outcomes.sessionOutcome,
      outcomes.coordinatorOutcome,
      outcomes.resultsOutcome,
      outcomes.progressOutcome,
      outcomes.racksOutcome,
      outcomes.allRacksOutcome,
      outcomes.coordinatorsOutcome,
      outcomes.uploadsOutcome,
    ].find((outcome) => outcome.status === "rejected");
    if (rejected && rejected.status === "rejected") {
      setRefreshWarning(refreshWarningMessage(rejected.reason));
    } else {
      setRefreshWarning(undefined);
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
            qtyFactor: item.qtyFactor,
          });
        } else {
          updated.delete(item.id);
        }
      }
      return updated;
    });
    if (Object.keys(next).length > 0) setSelectionMode("manual");
  };

  useEffect(() => {
    if (!Number.isFinite(id) || !Number.isFinite(session)) return;
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
  }, [id, session, fetchPageData, reportOutcomes]);
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
    const canComplete = coordinator?.status === "IN_REVIEW";
    const canCancel =
      coordinator?.status === "IN_REVIEW" ||
      coordinator?.status === "IN_PROGRESS";
    if (
      (status === "COMPLETED" && !canComplete) ||
      (status === "CANCELLED" && !canCancel)
    ) {
      showToast("Status koordinator tidak memungkinkan aksi ini.", "error");
      return;
    }
    try {
      await updateCoordinator(id, { status });
    } catch (mutationError) {
      showToast(
        errorMessage(mutationError, "Gagal memperbarui koordinator."),
        "error",
      );
      throw mutationError;
    }
    // Reflect the new status right away so the final actions stop being offered
    // even when the follow-up refresh fails.
    setCoordinator((current) => (current ? { ...current, status } : current));
    showToast(`Koordinator berhasil ${status === "COMPLETED" ? "diselesaikan" : "dibatalkan"}.`);
    void refreshAfterMutation();
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
    void refreshAfterMutation();
  };
  const handleResultDelete = async (resultId: number) => {
    try {
      await deleteStockOpname(resultId);
    } catch (mutationError) {
      showToast(
        errorMessage(mutationError, "Gagal menghapus data stock opname."),
        "error",
      );
      throw mutationError;
    }
    showToast("Data stock opname berhasil dihapus.");
    clearSelection();
    setAuditRefresh((value) => value + 1);
    void refreshAfterMutation();
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
    void refreshAfterMutation();
  };

  const handleMoveRequest = (item: { rackId: number; rackName: string; id: number }) => {
    setMoveState({
      sourceRackId: item.rackId,
      sourceRackName: item.rackName,
      resultIds: [item.id],
      itemCount: 1,
    });
  };

  const handleRackMoveRequest = (rack: Rack) => {
    setMoveState({ sourceRackId: rack.id, sourceRackName: rack.name });
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
    showToast(
      `${result.data.moved_count} item dipindah${result.data.merged_count ? `, ${result.data.merged_count} digabung` : ""}.${
        result.data.reopened_rack_id ? " Rak sumber kosong; upload dibuka dan bisa diupload ulang." : ""
      }`,
    );
    void refreshAfterMutation();
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
  const handleOpenUploadReport = async (uploadId: number, includeCarton = false) => {
    try {
      await openUploadReport(uploadId, includeCarton);
    } catch (mutationError) {
      showToast(
        mutationError instanceof Error ? mutationError.message : "Gagal membuat PDF upload.",
        "error",
      );
    }
  };
  const handleOpenUploadSummary = async () => {
    try {
      await openCoordinatorUploadSummary(id);
    } catch (mutationError) {
      showToast(
        mutationError instanceof Error ? mutationError.message : "Gagal membuat summary upload.",
        "error",
      );
    }
  };
  const handleDeleteRack = async (rakId: number) => {
    try {
      await deleteRack(rakId);
    } catch (mutationError) {
      showToast(
        errorMessage(mutationError, "Gagal menghapus rak."),
        "error",
      );
      throw mutationError;
    }
    showToast("Rak berhasil dihapus.");
    void refreshAfterMutation();
  };

  if (!Number.isFinite(id) || !Number.isFinite(session)) {
    return (
      <div className="p-4 text-destructive">
        ID sesi atau koordinator tidak valid.
      </div>
    );
  }

  if (loading && !coordinator) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center">
        <LoadingSpinner message="Memuat data koordinator..." />
      </div>
    );
  }
  if (!coordinator || !sessionData)
    return (
      <ErrorState
        message={error ?? "Koordinator tidak ditemukan."}
        onRetry={() => void loadData()}
        retrying={loading}
      />
    );
  const rack = progress[0];
  const progressFailed = failedSections.includes("progress");
  const resultsFailed = failedSections.includes("results");
  const progressPercent = rack?.rackAssigned
    ? Math.round((rack.rackCompleted / rack.rackAssigned) * 100)
    : 0;
  const canComplete = coordinator.status === "IN_REVIEW";
  const canCancel =
    coordinator.status === "IN_REVIEW" || coordinator.status === "IN_PROGRESS";
  const coordinatorReadOnly =
    sessionData?.status !== "IN_PROGRESS" ||
    coordinator.status === "COMPLETED" ||
    coordinator.status === "CANCELLED";

  const selectedItemsList = Array.from(selectedItems.values());
  const selectedCount = selectedItemsList.length;
  const selectedRackId = selectedItemsList.length > 0
    ? selectedItemsList.every((item) => item.rackId === selectedItemsList[0].rackId)
      ? selectedItemsList[0].rackId
      : undefined
    : undefined;
  const selectedRack = selectedRackId !== undefined
    ? racks.find((item) => item.id === selectedRackId)
    : undefined;
  const mixedSelectedFactor = new Set(selectedItemsList.map((item) => item.qtyFactor)).size > 1;
  const moveDisabledReason = selectedCount === 0
    ? "Pilih item terlebih dahulu."
    : selectedRackId === undefined
      ? "Pilih item dari satu rak untuk memindahkan."
      : !selectedRack
        ? "Rak sumber tidak ditemukan."
        : coordinatorReadOnly
          ? "Sesi atau koordinator sudah final."
          : undefined;
  const filterActive = resultSearch.trim() !== "" || filterRackId !== "";

  // Jumps from an audit entry to the matching row in the results table.
  const openResultFromAudit = (term: string) => {
    setResultSearchInput(term);
    setResultSearch(term);
    setResultPage(1);
    requestAnimationFrame(() => {
      document.getElementById("stock-opname-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const openItemFactor = (item: { id: number; name: string; qtyFactor: QtyFactor }) => {
    setFactorTarget({
      scope: "item",
      scopeId: item.id,
      label: item.name,
      itemCount: 1,
      currentFactor: item.qtyFactor,
    });
  };

  const openRackFactor = (item: Rack) => {
    setFactorTarget({
      scope: "rack",
      scopeId: item.id,
      label: item.name,
      itemCount: item.itemCount,
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

  const openBulkFactor = () => {
    setFactorTarget(
      filterActive
        ? {
            scope: "filter",
            label: "Semua hasil filter",
            itemCount: resultTotalItems,
            mixed: true,
          }
        : {
            scope: "coordinator",
            scopeId: id,
            label: coordinator.code,
            itemCount: resultTotalItems,
          },
    );
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

  const handleFactorSubmit = async (factor: QtyFactor, note: string) => {
    if (!factorTarget) return;
    try {
      const result = await setQtyFactor(session, {
        scope: factorTarget.scope,
        scopeId: factorTarget.scopeId,
        resultIds: factorTarget.resultIds,
        filter: factorTarget.scope === "filter"
          ? {
              search: resultSearch.trim() || undefined,
              coordinatorId: id,
              rakId: filterRackId ? Number(filterRackId) : undefined,
            }
          : undefined,
        qtyFactor: factor,
        note,
      });
      showToast(
        result.updated_count === 0
          ? "Tidak ada perubahan faktor."
          : `${result.updated_count} item berhasil diubah faktornya.`,
      );
    } catch (mutationError) {
      showToast(errorMessage(mutationError, "Gagal mengubah faktor qty."), "error");
      throw mutationError;
    }
    clearSelection();
    setFactorTarget(undefined);
    setAuditRefresh((value) => value + 1);
    void refreshAfterMutation();
  };

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
                  <BreadcrumbLink
                    render={<Link to={`/stock-opname/sesi/${sessionId}`} />}
                    className="text-xs"
                  >
                    {sessionData?.code ?? "..."}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-xs">{coordinator.code}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-2xl font-bold mt-2">{coordinator.code}</h1>
            <StatusBadge className="my-2" status={coordinator.status} />
            {(coordinator.sessionCode ?? sessionData?.code) && (
              <p className="text-muted-foreground text-sm">
                {coordinator.sessionCode ?? sessionData?.code}
                {(coordinator.sessionLocation ?? sessionData?.location) ? ` · ${coordinator.sessionLocation ?? sessionData?.location}` : ""}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-5">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                onClick={() => { setPendingAction("COMPLETED"); setConfirmOpen(true); }}
                disabled={!canComplete}
              >
                Selesai
              </Button>
              <Button
                variant="destructive"
                onClick={() => { setPendingAction("CANCELLED"); setConfirmOpen(true); }}
                disabled={!canCancel}
              >
                Batal
              </Button>
            </div>
            <CoordinatorPrintMenu
              coordinatorId={id}
              status={coordinator.status}
              onShowQR={() => {
                if (coordinator.status !== "IN_PROGRESS") return;
                setQrOpen(true);
              }}
            />
            <Button
              variant="secondary"
              onClick={() => navigate(`/stock-opname/sesi/${sessionId}`)}
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
            <p className="text-2xl font-bold">
              {progressFailed ? "—" : `${progressPercent}%`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Status Rak</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {progressFailed
                ? "—"
                : `${rack?.rackCompleted ?? 0}/${rack?.rackAssigned ?? 0}`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Barang</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {progressFailed ? "—" : (rack?.total_items ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>
      <Card className="my-5">
        <CardHeader>
          <CardTitle>Daftar Upload</CardTitle>
          <CardDescription>Laporan upload memakai hasil terkini; koreksi admin ikut tercermin.</CardDescription>
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleOpenUploadSummary()}
              disabled={uploads.length === 0}
            >
              <Printer />
              Cetak Summary
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <UploadTable
            columns={createUploadColumns(handleOpenUploadReport)}
            data={uploads}
          />
        </CardContent>
      </Card>
      <Card className="my-5">
        <CardHeader>
          <CardTitle>Daftar Rak</CardTitle>
          <CardDescription>Hapus hanya untuk rak kosong yang belum diupload.</CardDescription>
          <CardAction>
            <RackSeatMap racks={racks} />
          </CardAction>
        </CardHeader>
        <CardContent>
          <RackTable
            columns={createRackColumns(
              handleDeleteRack,
              handleRackMoveRequest,
              coordinatorReadOnly,
              openRackFactor,
            )}
            data={racks}
          />
        </CardContent>
      </Card>
      <Card className="my-5" id="stock-opname-results">
        <CardHeader>
          <CardTitle>Data Barang Stock Opname</CardTitle>
          <CardDescription>Data terkini hasil koreksi admin</CardDescription>
        </CardHeader>
        <CardContent>
          <ResultSelectionBar
            mode={selectionMode}
            filtered={filterActive}
            count={selectionMode === "filter" ? resultTotalItems : selectedCount}
            onFactor={selectionMode === "filter" ? openBulkFactor : openSelectedFactor}
            onMove={openSelectedMove}
            moveDisabledReason={
              selectionMode === "filter"
                ? "Mode filter bisa mencakup banyak rak. Pindahkan hanya tersedia untuk pilihan manual dari satu rak."
                : moveDisabledReason
            }
            onClear={clearSelection}
          />
          {resultsFailed && results.length === 0 ? (
            <ErrorState
              message="Daftar hasil gagal dimuat."
              onRetry={() => void loadData()}
              retrying={loading}
            />
          ) : (
          <StockOpnameTable
            columns={createResultColumns(
              handleResultUpdate,
              handleResultDelete,
              handleMoveRequest,
              coordinatorReadOnly,
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
                  aria-label="Filter rak"
                  className="h-9 min-w-40 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-background [&>option]:text-foreground"
                  value={filterRackId}
                  onChange={(event) => handleRackFilter(event.target.value)}
                  disabled={racks.length === 0}
                >
                  <option value="">Semua rak</option>
                  {racks.map((rack) => (
                    <option key={rack.id} value={rack.id}>
                      {rack.name}
                    </option>
                  ))}
                </select>
                {resultTotalItems > 0 ? (
                  <Button
                    variant={selectionMode === "filter" ? "default" : "outline"}
                    size="sm"
                    onClick={activateFilterMode}
                    disabled={selectionMode === "filter" || resultTotalItems > 1000}
                    title={
                      resultTotalItems > 1000
                        ? filterActive
                          ? "Persempit filter; maksimal 1000 baris."
                          : "Maksimal 1000 baris; faktorkan per rak."
                        : undefined
                    }
                  >
                    Pilih semua {resultTotalItems} hasil{filterActive ? " filter" : ""}
                  </Button>
                ) : null}
              </div>
            }
            addButton={
              <StockOpnameAddItemButton
                sessionId={session}
                coordinators={coordinator ? [coordinator] : []}
                onSubmit={handleResultCreate}
                disabled={coordinatorReadOnly}
              />
            }
            onSearch={setResultSearchInput}
            searchValue={resultSearchInput}
            loading={loading}
            page={resultPage}
            totalPages={resultTotalPages}
            onPageChange={handleResultPageChange}
          />
          )}
        </CardContent>
      </Card>
      <AuditTimeline
        key={`coordinator-${id}`}
        coordinatorId={id}
        refreshKey={auditRefresh}
        onOpenResult={openResultFromAudit}
      />
      {moveState ? (
        <StockOpnameMoveDialog
          open
          onOpenChange={(open) => { if (!open) setMoveState(undefined); }}
          sourceRack={allRacks.find((rack) => rack.id === moveState.sourceRackId) ?? racks.find((rack) => rack.id === moveState.sourceRackId)}
          racks={allRacks.length > 0 ? allRacks : racks}
          coordinators={coordinators.length > 0 ? coordinators : [coordinator]}
          resultIds={moveState.resultIds}
          itemCount={moveState.itemCount}
          onSubmit={handleMoveSubmit}
        />
      ) : null}
      <AlertDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={pendingAction === "COMPLETED" ? "Selesaikan Koordinator?" : "Batalkan Koordinator?"}
        description={
          pendingAction === "COMPLETED"
            ? "Koordinator akan ditandai sebagai selesai."
            : "Koordinator akan dibatalkan. Tindakan ini tidak dapat dibatalkan."
        }
        confirmLabel={pendingAction === "COMPLETED" ? "Selesai" : "Batalkan"}
        pendingLabel={
          pendingAction === "COMPLETED" ? "Menyelesaikan..." : "Membatalkan..."
        }
        destructive={pendingAction === "CANCELLED"}
        onConfirm={() => changeStatus(pendingAction)}
      />
      <CoordinatorQRModal
        coordinator={
          coordinator
            ? {
                id: coordinator.id,
                code: coordinator.code,
                status: coordinator.status,
                sessionId: session,
                sessionCode: coordinator.sessionCode ?? sessionData?.code,
                sessionLocation: coordinator.sessionLocation ?? sessionData?.location,
              }
            : null
        }
        open={qrOpen}
        onClose={() => setQrOpen(false)}
      />
      <QtyFactorDialog
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
