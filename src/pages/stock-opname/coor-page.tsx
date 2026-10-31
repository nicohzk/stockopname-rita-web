import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
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
import { deleteRack, getRackProgress, getRacks } from "@/services/rack.service";
import { getUploads } from "@/services/upload.service";
import {
  createStockOpname,
  deleteStockOpname,
  getStockOpnames,
  updateStockOpname,
} from "@/services/stock-opname.service";
import StockOpnameAddItemButton from "./result/so-add-item-btn";
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
import CoordinatorPrintMenu from "./coordinator-print-menu";
import { openUploadReport } from "@/services/report.service";
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
  const [racks, setRacks] = useState<Rack[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
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
        loadedResults,
        loadedProgress,
      ] = await Promise.all([
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
      const [racksResult, uploadsResult] = await Promise.allSettled([
        getRacks({ sessionId: session, coordinatorId: id }),
        getUploads(id),
      ]);
      setSessionData(loadedSession);
      setCoordinator(loadedCoordinator);
      const allRacks = racksResult.status === "fulfilled" ? racksResult.value : [];
      setRacks(allRacks);
      setUploads(uploadsResult.status === "fulfilled" ? uploadsResult.value : []);
      if (uploadsResult.status === "rejected") {
        showToast("Gagal memuat riwayat upload.", "error");
      }
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
  }, [id, session, resultPage, resultSearch, filterRackId]);
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

  const handleRackFilter = (value: string) => {
    setFilterRackId(value);
    setResultPage(1);
  };
  const handleOpenUploadReport = async (uploadId: number) => {
    try {
      await openUploadReport(uploadId);
    } catch (mutationError) {
      showToast(
        mutationError instanceof Error ? mutationError.message : "Gagal membuat PDF upload.",
        "error",
      );
    }
  };
  const handleDeleteRack = async (rakId: number) => {
    try {
      await deleteRack(rakId);
      await loadData();
      showToast("Rak berhasil dihapus.");
    } catch (mutationError) {
      showToast(
        mutationError instanceof Error ? mutationError.message : "Gagal menghapus rak.",
        "error",
      );
      throw mutationError;
    }
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
          <CardTitle>Riwayat Upload</CardTitle>
          <CardDescription>Setiap submit mobile dicatat sebagai satu upload</CardDescription>
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
          <CardDescription>Rak yang belum diupload masih bisa dihapus</CardDescription>
          <CardAction>
            <RackSeatMap racks={racks} />
          </CardAction>
        </CardHeader>
        <CardContent>
          <RackTable
            columns={createRackColumns(
              handleDeleteRack,
              sessionData?.status !== "IN_PROGRESS",
            )}
            data={racks}
          />
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
              sessionData?.status !== "IN_PROGRESS",
            )}
            data={results}
            filters={
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
            }
            addButton={
              <StockOpnameAddItemButton
                sessionId={session}
                coordinators={coordinator ? [coordinator] : []}
                onSubmit={handleResultCreate}
                disabled={sessionData?.status !== "IN_PROGRESS" || coordinator.status === "COMPLETED" || coordinator.status === "CANCELLED"}
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
                sessionId: session,
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
