import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import PrintDetailButton from "./print-detail-button";
import { openCoordinatorReport } from "@/services/report.service";
import { StatusBadge } from "@/components/ui/status-badge";

export default function CoorPage() {
  const { sessionId, coorId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const id = Number(coorId);
  const session = Number(sessionId);
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

  const loadData = async () => {
    try {
      setLoading(true);
      setError(undefined);
      const [
        loadedCoordinator,
        loadedInspectors,
        loadedResults,
        loadedProgress,
      ] = await Promise.all([
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
          : "Failed to load coordinator.",
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
      showToast("The coordinator status does not allow this action.", "error");
      return;
    }
    try {
      await updateCoordinator(id, { status });
      await loadData();
      showToast(`Coordinator ${status.toLowerCase()} successfully.`);
    } catch (mutationError) {
      showToast(
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to update coordinator.",
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
      showToast("Stock opname updated successfully.");
    } catch (mutationError) {
      showToast(
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to update stock opname.",
        "error",
      );
      throw mutationError;
    }
  };
  const handleResultDelete = async (resultId: number) => {
    try {
      await deleteStockOpname(resultId);
      await loadData();
      showToast("Stock opname deleted successfully.");
    } catch (mutationError) {
      showToast(
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to delete stock opname.",
        "error",
      );
    }
  };
  const handleResultCreate = async (data: StockOpnameCreateRequest) => {
    try {
      await createStockOpname(data);
      await loadData();
      showToast("Item added successfully.");
    } catch (mutationError) {
      showToast(
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to add item.",
        "error",
      );
      throw mutationError;
    }
  };

  if (loading && !coordinator)
    return <div className="p-4">Loading coordinator...</div>;
  if (error || !coordinator)
    return (
      <div className="p-4 text-destructive">
        {error ?? "Coordinator not found."}
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
    <div className="p-4">
      <div className="mb-3">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{coordinator.code}</h1>
            <StatusBadge className="my-2" status={coordinator.status} />
          </div>
          <div className="flex gap-5">
            <div className="flex gap-2">
              <Button
                variant="default"
                onClick={() => void changeStatus("COMPLETED")}
                disabled={!canComplete}
              >
                Done
              </Button>
              <Button
                variant="destructive"
                onClick={() => void changeStatus("CANCELLED")}
                disabled={!canCancel}
              >
                Cancel
              </Button>
            </div>
            <PrintDetailButton onPrint={() => openCoordinatorReport(id)} />
            <Button
              variant="secondary"
              onClick={() => navigate(`/stock-opname/sesi/${sessionId}`)}
            >
              Back
            </Button>
          </div>
        </div>
        <Separator className="mt-2" />
      </div>
      <div className="grid gap-5 md:grid-cols-3 mb-5">
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{progressPercent}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Status Rak</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              {rack?.rackCompleted ?? 0}/{rack?.rackAssigned ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Barang</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{rack?.total_items ?? 0}</p>
          </CardContent>
        </Card>
      </div>
      <Card className="my-5">
        <CardHeader>
          <CardTitle>Data Inspektur</CardTitle>
          <CardDescription />
        </CardHeader>
        <CardContent>
          <InspectorTable columns={inspectorColumns} data={inspectors} />
        </CardContent>
      </Card>
      <Card className="my-5">
        <CardHeader>
          <CardTitle>Data Barang Stock Opname</CardTitle>
          <CardDescription />
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
    </div>
  );
}
