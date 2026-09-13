import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading";
import DepartmentTable from "./department-table";
import { useEffect, useState } from "react";
import type { DepartmentRequest } from "@/types/department";
import { createDepartment, deleteDepartment, getDepartments, updateDepartment } from "@/services/department.service";
import { getColumns } from "./department-table-column";
import DepartmentAddButton from "./department-add-btn";
import { useToast } from "@/components/ui/toast";

export default function DepartmentsTabs({ isActive }: { isActive: boolean }) {
  const [departments, setDepartments] = useState<Awaited<ReturnType<typeof getDepartments>>["data"]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadDepartments = async (nextPage = page, nextSearch = search) => {
    try {
      setLoading(true);
      setError(undefined);
      const result = await getDepartments(nextPage, 6, nextSearch);
      setDepartments(result.data);
      setPage(result.pagination.page);
      setTotalPages(result.pagination.total_pages || 1);
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Gagal memuat data department."); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => { setSearch(searchInput); setPage(1); }, 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => { if (isActive) void loadDepartments(); }, [isActive, page, search]);
  const handleCreate = async (data: DepartmentRequest) => {
    try { await createDepartment(data); await loadDepartments(); showToast("Department berhasil ditambahkan."); }
    catch (mutationError) { showToast(mutationError instanceof Error ? mutationError.message : "Gagal menambahkan department.", "error"); throw mutationError; }
  };
  const handleDelete = async (id: number) => {
    try { await deleteDepartment(id); await loadDepartments(); showToast("Department berhasil dihapus."); }
    catch (mutationError) { showToast(mutationError instanceof Error ? mutationError.message : "Gagal menghapus department.", "error"); }
  };
  const handleUpdate = async (id: number, data: DepartmentRequest) => {
    try { await updateDepartment(id, data); await loadDepartments(); showToast("Department berhasil diperbarui."); }
    catch (mutationError) { showToast(mutationError instanceof Error ? mutationError.message : "Gagal memperbarui department.", "error"); throw mutationError; }
  };
  return (
    <TabsContent value="departments">
      <Card>
        <CardHeader>
          <CardTitle>Department</CardTitle>
          <CardDescription>
            Kelola data department untuk organisasi produk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !departments.length ? (
            <div className="flex h-40 items-center justify-center">
              <LoadingSpinner message="Memuat data department..." />
            </div>
          ) : (
            <DepartmentTable
              columns={getColumns(handleDelete, handleUpdate)}
              data={departments}
              addButton={<DepartmentAddButton onSubmit={handleCreate} />}
              error={error}
              onSearch={setSearchInput}
              searchValue={searchInput}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              loading={loading}
            />
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
