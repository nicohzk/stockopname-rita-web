import { Separator } from "@/components/ui/separator";
import { columns } from "./session/session-table-column";
import { SessionTable } from "./session/session-table";
import { useEffect, useState } from "react";
import { getSessions, createSession } from "@/services/session.service";
import { useToast } from "@/components/ui/toast";
import SessionAddBtn from "./session/session-add-btn";
import type { SessionCreateRequest } from "@/types/session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function StockOpnamePage() {
  const [sessions, setSessions] = useState<Awaited<ReturnType<typeof getSessions>>["data"]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const { showToast } = useToast();
  const loadSessions = async (nextPage = page, nextSearch = search) => {
    try { setLoading(true); setError(undefined); const result = await getSessions(nextPage, 6, nextSearch); setSessions(result.data); setPage(result.pagination.page); setTotalPages(result.pagination.total_pages || 1); }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Failed to load sessions."); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    const timer = window.setTimeout(() => { setSearch(searchInput); setPage(1); }, 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);
  useEffect(() => { void loadSessions(); }, [page, search]);
  const handleCreate = async (data: SessionCreateRequest) => {
    try { await createSession(data); await loadSessions(page, search); showToast("Session added successfully."); }
    catch (mutationError) { showToast(mutationError instanceof Error ? mutationError.message : "Failed to add session.", "error"); throw mutationError; }
  };
  return (
    <div className="p-4">
      <div className="mb-3">
        <h1 className="text-2xl font-bold">Stock Opname</h1>
        <p>Welcome to the stock opname page!</p>
        <Separator className="mt-2" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sesi Stock Opname</CardTitle>
          <CardDescription>
            Kelola sesi stock opname. Buat sesi baru, lihat sesi yang sudah ada,
            dan pantau progresnya.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SessionTable columns={columns} data={sessions} addButton={<SessionAddBtn onSubmit={handleCreate} />} error={error} onSearch={setSearchInput} searchValue={searchInput} loading={loading} page={page} totalPages={totalPages} onPageChange={setPage} />
        </CardContent>
      </Card>
    </div>
  );
}
