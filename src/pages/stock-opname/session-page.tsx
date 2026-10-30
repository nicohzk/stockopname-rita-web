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
import { getSession, updateSession, deleteSession } from "@/services/session.service";
import { getProductCount } from "@/services/product.service";
import { getCoordinators } from "@/services/coordinator.service";
import { getRackProgress, getRacks } from "@/services/rack.service";
import type { Rack } from "@/types/rack";
import {
  createStockOpname,
  deleteStockOpname,
  getStockOpnames,
  updateStockOpname,
} from "@/services/stock-opname.service";
import StockOpnameAddItemButton from "./result/so-add-item-btn";
import { CoordinatorTable } from "./coordinator/coordinator-table";
import { createColumns as createCoordinatorColumns } from "./coordinator/coordinator-table-column";
import { StockOpnameTable } from "./result/so-table";
import { createColumns as createResultColumns } from "./result/so-table-column";
import ProductMasterCard from "./session/product/product-master-card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"COMPLETED" | "CANCELLED">("COMPLETED");
  const [productCount, setProductCount] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteCode, setDeleteCode] = useState("");
  const [deleteError, setDeleteError] = useState<string>();
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(undefined);
      const [loadedSession, loadedCoordinators, loadedResults, loadedProgress, loadedProductCount] =
        await Promise.all([
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
        ]);
      setSession(loadedSession);
      setCoordinators(loadedCoordinators);
      setResults(loadedResults.data);
      setResultPage(loadedResults.pagination.page);
      setResultTotalPages(loadedResults.pagination.total_pages || 1);
      setProgress(loadedProgress);
      setProductCount(loadedProductCount);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Gagal memuat data sesi.",
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshProductCount = async () => {
    try {
      setProductCount(await getProductCount(id));
    } catch {
      // Count refresh is best-effort; the next loadData retries.
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
    if (Number.isFinite(id)) void loadData();
  }, [id, resultPage, resultSearch, filterCoordinatorId, filterRackId]);
  useEffect(() => {
    if (!Number.isFinite(id)) return;
    // Filter options only; a failure must not block the result table.
    getRacks({ sessionId: id }).then(setRacks).catch(() => undefined);
  }, [id]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setResultSearch(resultSearchInput);
      setResultPage(1);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [resultSearchInput]);

  const changeStatus = async (status: "COMPLETED" | "CANCELLED") => {
    try {
      await updateSession(id, { status });
      await loadData();
      showToast(`Sesi berhasil ${status === "COMPLETED" ? "diselesaikan" : "dibatalkan"}.`);
    } catch (mutationError) {
      showToast(
        mutationError instanceof Error
          ? mutationError.message
          : "Gagal memperbarui sesi.",
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

  const handleCoordinatorFilter = (value: string) => {
    setFilterCoordinatorId(value);
    setFilterRackId("");
    setResultPage(1);
  };
  const handleRackFilter = (value: string) => {
    setFilterRackId(value);
    setResultPage(1);
  };
  const coordinatorCodeById = new Map(coordinators.map((coordinator) => [coordinator.id, coordinator.code]));
  const rackOptions = racks.filter(
    (rack) => !filterCoordinatorId || rack.coordinatorId === Number(filterCoordinatorId),
  );

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
  if (error || !session)
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
      {session.status === "IN_PROGRESS" && productCount === 0 && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
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
        </CardHeader>
        <CardContent>
          <CoordinatorTable
            columns={createCoordinatorColumns(sessionId ?? "")}
            data={coordinators}
          />
        </CardContent>
      </Card>
      <Card className="my-5">
        <CardHeader>
          <CardTitle>Data Barang Stock Opname</CardTitle>
          <CardDescription>Daftar barang yang sudah dihitung dalam sesi ini</CardDescription>
        </CardHeader>
        <CardContent>
          <StockOpnameTable
            columns={createResultColumns(
              handleResultUpdate,
              handleResultDelete,
              session.status !== "IN_PROGRESS",
            )}
            data={results}
            filters={
              <div className="flex flex-wrap gap-2">
                <select
                  aria-label="Filter koordinator"
                  className="h-9 rounded-md border bg-transparent px-3 text-sm"
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
                  className="h-9 rounded-md border bg-transparent px-3 text-sm"
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
            onPageChange={setResultPage}
          />
        </CardContent>
      </Card>
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
    </div>
  );
}
