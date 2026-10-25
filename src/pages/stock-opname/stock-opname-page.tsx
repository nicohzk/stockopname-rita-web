import { Separator } from "@/components/ui/separator";
import { columns } from "./session/session-table-column";
import { SessionTable } from "./session/session-table";
import { useEffect, useState } from "react";
import { getSessions, createSession } from "@/services/session.service";
import { importProducts } from "@/services/product.service";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/toast";
import SessionAddBtn from "./session/session-add-btn";
import StockOpnameSummaryCards from "./stock-opname-summary-cards";
import type { SessionCreateRequest } from "@/types/session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SessionSummary = {
  totalSessions: number;
  completedSessions: number;
  inProgressSessions: number;
};

function toSessionSummary(result: Awaited<ReturnType<typeof getSessions>>): SessionSummary {
  return {
    totalSessions: result.pagination.total_items,
    completedSessions: result.data.filter((session) => session.status === "COMPLETED").length,
    inProgressSessions: result.data.filter((session) => session.status === "IN_PROGRESS").length,
  };
}

export default function StockOpnamePage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Awaited<ReturnType<typeof getSessions>>["data"]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [summary, setSummary] = useState<SessionSummary>({
    totalSessions: 0,
    completedSessions: 0,
    inProgressSessions: 0,
  });
  const [summaryError, setSummaryError] = useState<string>();
  const { showToast } = useToast();
  // shortcut: status counts cap at 1000 sessions (backend max); add a count endpoint if this grows.
  const refreshSummary = async () => {
    try {
      const result = await getSessions(1, 1000);
      setSummaryError(undefined);
      setSummary(toSessionSummary(result));
    } catch (summaryLoadError) {
      setSummaryError(summaryLoadError instanceof Error ? summaryLoadError.message : "Gagal memuat ringkasan sesi.");
    }
  };
  const loadSessions = async (nextPage = page, nextSearch = search) => {
    try { setLoading(true); setError(undefined); const result = await getSessions(nextPage, 6, nextSearch); setSessions(result.data); setPage(result.pagination.page); setTotalPages(result.pagination.total_pages || 1); }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Gagal memuat data sesi."); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    const timer = window.setTimeout(() => { setSearch(searchInput); setPage(1); }, 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);
  useEffect(() => { void loadSessions(); }, [page, search]);
  useEffect(() => {
    let cancelled = false;
    getSessions(1, 1000)
      .then((result) => {
        if (cancelled) return;
        setSummaryError(undefined);
        setSummary(toSessionSummary(result));
      })
      .catch((summaryLoadError) => {
        if (!cancelled) setSummaryError(summaryLoadError instanceof Error ? summaryLoadError.message : "Gagal memuat ringkasan sesi.");
      });
    return () => { cancelled = true; };
  }, []);
  const handleCreate = async (data: SessionCreateRequest, produk: File, barcode: File) => {
    let session;
    try {
      session = await createSession(data);
    } catch (mutationError) {
      showToast(mutationError instanceof Error ? mutationError.message : "Gagal menambahkan sesi.", "error");
      throw mutationError;
    }

    try {
      await importProducts(produk, barcode, session.id);
      showToast("Sesi dan produk berhasil dibuat.");
    } catch (importError) {
      showToast(
        importError instanceof Error
          ? `Sesi dibuat, tetapi import gagal: ${importError.message}`
          : "Sesi dibuat, tetapi import produk gagal. Coba import ulang dari detail sesi.",
        "error",
      );
    }

    await loadSessions(page, search);
    void refreshSummary();
    navigate(`/stock-opname/sesi/${session.id}`);
  };
  return (
    <div className="min-w-0 p-0 sm:p-2">
      <div className="mb-3">
        <h1 className="text-xl font-bold sm:text-2xl">Stock Opname</h1>
        <p>Pantau dan kelola sesi stock opname yang sedang berlangsung</p>
        <Separator className="mt-2" />
      </div>
      {summaryError ? (
        <p className="mb-4 text-sm text-destructive">{summaryError}</p>
      ) : (
        <div className="mb-4">
          <StockOpnameSummaryCards {...summary} />
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Sesi Stock Opname</CardTitle>
          <CardDescription>
            Buat dan pantau sesi stock opname yang sedang berjalan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SessionTable columns={columns} data={sessions} addButton={<SessionAddBtn onSubmit={handleCreate} />} error={error} onSearch={setSearchInput} searchValue={searchInput} loading={loading} page={page} totalPages={totalPages} onPageChange={setPage} />
        </CardContent>
      </Card>
    </div>
  );
}
