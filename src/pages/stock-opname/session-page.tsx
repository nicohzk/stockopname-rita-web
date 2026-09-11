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
import { getSession, updateSession } from "@/services/session.service";
import { getCoordinators } from "@/services/coordinator.service";
import { getRackProgress } from "@/services/rack.service";
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
import type {
  StockOpnameCreateRequest,
  StockOpnameUpdateRequest,
} from "@/types/stock-opname";
import PrintDetailButton from "./print-detail-button";
import { openSessionReport } from "@/services/report.service";
import { StatusBadge } from "@/components/ui/status-badge";

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
      const [loadedSession, loadedCoordinators, loadedResults, loadedProgress] =
        await Promise.all([
          getSession(id),
          getCoordinators(id),
          getStockOpnames({
            sessionId: id,
            page: resultPage,
            search: resultSearch,
          }),
          getRackProgress({ sessionId: id }),
        ]);
      setSession(loadedSession);
      setCoordinators(loadedCoordinators);
      setResults(loadedResults.data);
      setResultPage(loadedResults.pagination.page);
      setResultTotalPages(loadedResults.pagination.total_pages || 1);
      setProgress(loadedProgress);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load session.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Number.isFinite(id)) void loadData();
  }, [id, resultPage, resultSearch]);
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
      showToast(`Session ${status.toLowerCase()} successfully.`);
    } catch (mutationError) {
      showToast(
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to update session.",
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

  if (loading && !session) return <div className="p-4">Loading session...</div>;
  if (error || !session)
    return (
      <div className="p-4 text-destructive">
        {error ?? "Session not found."}
      </div>
    );
  const rack = progress[0];
  const progressPercent = rack?.rackAssigned
    ? Math.round((rack.rackCompleted / rack.rackAssigned) * 100)
    : 0;

  return (
    <div className="p-4">
      <div className="mb-3">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{session.code}</h1>
            <StatusBadge className="my-2" status={session.status} />
            <p>{session.location}</p>
          </div>
          <div className="flex gap-5">
            <div className="flex gap-2">
              <Button
                variant="default"
                onClick={() => void changeStatus("COMPLETED")}
                disabled={session.status !== "IN_PROGRESS"}
              >
                Done
              </Button>
              <Button
                variant="destructive"
                onClick={() => void changeStatus("CANCELLED")}
                disabled={session.status !== "IN_PROGRESS"}
              >
                Cancel
              </Button>
            </div>
            <PrintDetailButton onPrint={() => openSessionReport(id)} />
            <Button
              variant="secondary"
              onClick={() => navigate("/stock-opname")}
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
          <CardTitle>Data Koordinator</CardTitle>
          <CardDescription />
        </CardHeader>
        <CardContent>
          <CoordinatorTable
            columns={createCoordinatorColumns(sessionId!)}
            data={coordinators}
          />
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
                sessionId={id}
                coordinators={coordinators}
                onSubmit={handleResultCreate}
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
