import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading";
import CategoryTable from "./category-table";
import { useEffect, useState } from "react";
import type { CategoryRequest } from "@/types/category";
import { createCategory, deleteCategory, getCategories, updateCategory } from "@/services/category.service";
import { getColumns } from "./category-table-column";
import CategoryAddButton from "./category-add-btn";
import { useToast } from "@/components/ui/toast";

export function CategoryTabs({ isActive }: { isActive: boolean }) {
  const [categories, setCategories] = useState<Awaited<ReturnType<typeof getCategories>>["data"]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadCategories = async (nextPage = page, nextSearch = search) => {
    try {
      setLoading(true);
      setError(undefined);
      const result = await getCategories(nextPage, 6, nextSearch);
      setCategories(result.data);
      setPage(result.pagination.page);
      setTotalPages(result.pagination.total_pages || 1);
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Gagal memuat data kategori."); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => { setSearch(searchInput); setPage(1); }, 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => { if (isActive) void loadCategories(); }, [isActive, page, search]);
  const handleCreate = async (data: CategoryRequest) => {
    try { await createCategory(data); await loadCategories(); showToast("Kategori berhasil ditambahkan."); }
    catch (mutationError) { showToast(mutationError instanceof Error ? mutationError.message : "Gagal menambahkan kategori.", "error"); throw mutationError; }
  };
  const handleDelete = async (id: number) => {
    try { await deleteCategory(id); await loadCategories(); showToast("Kategori berhasil dihapus."); }
    catch (mutationError) { showToast(mutationError instanceof Error ? mutationError.message : "Gagal menghapus kategori.", "error"); }
  };
  const handleUpdate = async (id: number, data: CategoryRequest) => {
    try { await updateCategory(id, data); await loadCategories(); showToast("Kategori berhasil diperbarui."); }
    catch (mutationError) { showToast(mutationError instanceof Error ? mutationError.message : "Gagal memperbarui kategori.", "error"); throw mutationError; }
  };
  return (
    <TabsContent value="categories">
      <Card>
        <CardHeader>
          <CardTitle>Kategori</CardTitle>
          <CardDescription>
            Kelola data kategori untuk mengelompokkan produk.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          {loading && !categories.length ? (
            <div className="flex h-40 items-center justify-center">
              <LoadingSpinner message="Memuat data kategori..." />
            </div>
          ) : (
            <CategoryTable
              columns={getColumns(handleDelete, handleUpdate)}
              data={categories}
              addButton={<CategoryAddButton onSubmit={handleCreate} />}
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
