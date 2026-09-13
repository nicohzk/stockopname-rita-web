import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import ProductTable from "./product-table";
import { useEffect, useState } from "react";
import { getProducts, createProduct, deleteProduct, updateProduct } from "@/services/product.service";
import type { CreateProductRequest, UpdateProductRequest } from "@/types/product";
import { getColumns } from "./product-table-column";
import ProductAddButton from "./product-add-btn";
import { useToast } from "@/components/ui/toast";

export default function ProductTabs({ isActive }: { isActive: boolean }) {
  const [products, setProducts] = useState<Awaited<ReturnType<typeof getProducts>>["data"]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadData = async (nextPage = page, nextSearch = search) => {
    try {
      setLoading(true);
      setError(undefined);
      const result = await getProducts(nextPage, 6, nextSearch);
      setProducts(result.data);
      setPage(result.pagination.page);
      setTotalPages(result.pagination.total_pages || 1);
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Gagal memuat data produk."); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => { setSearch(searchInput); setPage(1); }, 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => { if (isActive) void loadData(); }, [isActive, page, search]);
  const handleCreate = async (data: CreateProductRequest) => {
    try { await createProduct(data); await loadData(); showToast("Produk berhasil ditambahkan."); }
    catch (mutationError) { showToast(mutationError instanceof Error ? mutationError.message : "Gagal menambahkan produk.", "error"); throw mutationError; }
  };
  const handleDelete = async (id: number) => {
    try { await deleteProduct(id); await loadData(); showToast("Produk berhasil dihapus."); }
    catch (mutationError) { showToast(mutationError instanceof Error ? mutationError.message : "Gagal menghapus produk.", "error"); }
  };
  const handleUpdate = async (id: number, data: UpdateProductRequest) => {
    try { await updateProduct(id, data); await loadData(); showToast("Produk berhasil diperbarui."); }
    catch (mutationError) { showToast(mutationError instanceof Error ? mutationError.message : "Gagal memperbarui produk.", "error"); throw mutationError; }
  };
  return (
    <TabsContent value="products">
      <Card>
        <CardHeader>
          <CardTitle>Produk</CardTitle>
          <CardDescription>
            Kelola data produk yang terdaftar dalam sistem stock opname.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          {loading && !products.length ? <p>Memuat data produk...</p> : (
            <ProductTable
              columns={getColumns(handleDelete, handleUpdate)}
              data={products}
              addButton={<ProductAddButton onSubmit={handleCreate} />}
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
