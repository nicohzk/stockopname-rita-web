import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
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
  updateCoordinator,
} from "@/services/coordinator.service";
import { getInspectors } from "@/services/inspector.service";
import { getRackProgress } from "@/services/rack.service";
import {
  createStockOpname,
  deleteStockOpname,
  getStockOpnames,
  updateStockOpname,
} from "@/services/stock-opname.service";
import StockOpnameAddItemButton from "./result/so-add-item-btn";
import { InspectorTable } from "./inspector/inspector-table";
import { columns as inspectorColumns } from "./inspector/inspector-table.column";
import { StockOpnameTable } from "./result/so-table";
import { createColumns as createResultColumns } from "./result/so-table-column";
import type {
  StockOpnameCreateRequest,
  StockOpnameUpdateRequest,
} from "@/types/stock-opname";
import CoordinatorPrintMenu from "./coordinator-print-menu";
import { StatusBadge } from "@/components/ui/status-badge";
import CoordinatorQRModal from "@/components/CoordinatorQRModal";

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
  const [inspectors, setInspectors] = useState<
    Awaited<ReturnType<typeof getInspectors>>
  >([]);
  const [results, setResults] = useState<
    Awaited<ReturnType<typeof getStockOpnames>>["data"]
  >([]);
  const [progress, setProgress] = useState<
    Awaited<ReturnType<typeof getRackProgress>>
  >([]);
  const [resultPage, setResultPage] = useState(1);
  const [resultSearch, setResultSearch] = useState("");
  const [resultSearchInput, setResultSearchInput] = useState("");
  const [resultTotalPages, setResultTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"COMPLETED" | "CANCELLED">("COMPLETED");
  const [qrOpen, setQrOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(undefined);
      const [
        loadedSession,
        loadedCoordinator,
        loadedInspectors,
        loadedResults,
        loadedProgress,
      ] = await Promise.all([
        getSession(session),
        getCoordinator(id),
        getInspectors(id),
        getStockOpnames({
          sessionId: session,
          coordinatorId: id,
          page: resultPage,
          search: resultSearch,
        }),
        getRackProgress({ sessionId: session, coordinatorId: id }),
      ]);
      setSessionData(loadedSession);
      setCoordinator(loadedCoordinator);
      setInspectors(loadedInspectors);
      setResults(loadedResults.data);
      setResultPage(loadedResults.pagination.page);
      setResultTotalPages(loadedResults.pagination.total_pages || 1);
      setProgress(loadedProgress);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Gagal memuat data koordinator.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Number.isFinite(id) && Number.isFinite(session)) void loadData();
  }, [id, session, resultPage, resultSearch]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setResultSearch(resultSearchInput);
      setResultPage(1);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [resultSearchInput]);

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
      await loadData();
      showToast(`Koordinator berhasil ${status === "COMPLETED" ? "diselesaikan" : "dibatalkan"}.`);
    } catch (mutationError) {
      showToast(
        mutationError instanceof Error
          ? mutationError.message
          : "Gagal memperbarui koordinator.",
        "error",
      );
    }
  };
  const handleResultUpdate = async (
    resultId: number,
    data: StockOpnameUpdateRequest,
  ) => {
    try {
      await updateStockOpname(resultId, data);
      await loadData();
      showToast("Data stock opname berhasil diperbarui.");
    } catch (mutationError) {
      showToast(
        mutationError instanceof Error
          ? mutationError.message
          : "Gagal memperbarui data stock opname.",
        "error",
      );
      throw mutationError;
    }
  };
  const handleResultDelete = async (resultId: number) => {
    try {
      await deleteStockOpname(resultId);
      await loadData();
      showToast("Data stock opname berhasil dihapus.");
    } catch (mutationError) {
      showToast(
        mutationError instanceof Error
          ? mutationError.message
          : "Gagal menghapus data stock opname.",
        "error",
      );
    }
  };
  const handleResultCreate = async (data: StockOpnameCreateRequest) => {
    try {
      await createStockOpname(data);
      await loadData();
      showToast("Item berhasil ditambahkan.");
    } catch (mutationError) {
      showToast(
        mutationError instanceof Error
          ? mutationError.message
          : "Gagal menambahkan item.",
        "error",
      );
      throw mutationError;
    }
  };

  if (loading && !coordinator) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center">
        <LoadingSpinner message="Memuat data koordinator..." />
      </div>
    );
  }
  if (error || !coordinator)
    return (
      <div className="p-4 text-destructive">
        {error ?? "Koordinator tidak ditemukan."}
      </div>
    );
  const rack = progress[0];
  const progressPercent = rack?.rackAssigned
    ? Math.round((rack.rackCompleted / rack.rackAssigned) * 100)
    : 0;
  const canComplete = coordinator.status === "IN_REVIEW";
  const canCancel =
    coordinator.status === "IN_REVIEW" || coordinator.status === "IN_PROGRESS";

  return (
    <div className="min-w-0 p-0 sm:p-2">
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
      <Card className="my-5">
        <CardHeader>
          <CardTitle>Data Inspektur</CardTitle>
          <CardDescription>Daftar inspektur yang bertugas dalam koordinator ini</CardDescription>
        </CardHeader>
        <CardContent>
          <InspectorTable columns={inspectorColumns} data={inspectors} />
        </CardContent>
      </Card>
      <Card className="my-5">
        <CardHeader>
          <CardTitle>Data Barang Stock Opname</CardTitle>
          <CardDescription>Daftar barang yang sudah dihitung dalam koordinator ini</CardDescription>
        </CardHeader>
        <CardContent>
          <StockOpnameTable
            columns={createResultColumns(
              handleResultUpdate,
              handleResultDelete,
            )}
            data={results}
            addButton={
              <StockOpnameAddItemButton
                sessionId={session}
                coordinators={coordinator ? [coordinator] : []}
                onSubmit={handleResultCreate}
                disabled={coordinator.status === "COMPLETED" || coordinator.status === "CANCELLED"}
              />
            }
            onSearch={setResultSearchInput}
            searchValue={resultSearchInput}
            loading={loading}
            page={resultPage}
            totalPages={resultTotalPages}
            onPageChange={setResultPage}
          />
        </CardContent>
      </Card>
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
                sessionCode: coordinator.sessionCode ?? sessionData?.code,
                sessionLocation: coordinator.sessionLocation ?? sessionData?.location,
              }
            : null
        }
        open={qrOpen}
        onClose={() => setQrOpen(false)}
      />
    </div>
  );
}
