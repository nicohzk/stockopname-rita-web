import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading";
import ProductTable from "./product-table";
import ProductBarcodeTable from "./product-barcode-table";
import { ProductImportCard, ProductClearCard } from "./product-master-tools";
import { useEffect, useState } from "react";
import { getProducts, createProduct, deleteProduct, updateProduct, updateProductBarcodes } from "@/services/product.service";
import type { CreateProductRequest, UpdateProductRequest } from "@/types/product";
import { getColumns } from "./product-table-column";
import ProductAddButton from "./product-add-btn";
import { useToast } from "@/components/ui/toast";

export default function ProductTabs({
  sessionId,
  sessionStatus,
  onProductsChanged,
}: {
  sessionId: number;
  sessionStatus: string;
  onProductsChanged?: () => void;
}) {
  const [products, setProducts] = useState<Awaited<ReturnType<typeof getProducts>>["data"]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const readOnly = sessionStatus !== "IN_PROGRESS";

  const loadData = async (nextPage = page, nextSearch = search) => {
    try {
      setLoading(true);
      setError(undefined);
      setSearchInput(nextSearch);
      const result = await getProducts(sessionId, nextPage, 6, nextSearch);
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

  useEffect(() => { void loadData(); }, [sessionId, page, search]);
  const handleCreate = async (data: CreateProductRequest) => {
    try {
      await createProduct(sessionId, data);
      await loadData();
      onProductsChanged?.();
      showToast("Produk berhasil ditambahkan.");
    } catch (mutationError) { showToast(mutationError instanceof Error ? mutationError.message : "Gagal menambahkan produk.", "error"); throw mutationError; }
  };
  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id, sessionId);
      await loadData();
      onProductsChanged?.();
      showToast("Produk berhasil dihapus.");
    } catch (mutationError) { showToast(mutationError instanceof Error ? mutationError.message : "Gagal menghapus produk.", "error"); }
  };
  const handleUpdate = async (id: number, data: UpdateProductRequest) => {
    try {
      await updateProduct(id, sessionId, data);
      await loadData();
      onProductsChanged?.();
      showToast("Produk berhasil diperbarui.");
    } catch (mutationError) { showToast(mutationError instanceof Error ? mutationError.message : "Gagal memperbarui produk.", "error"); throw mutationError; }
  };
  const handleUpdateBarcodes = async (id: number, barcodes: string[]) => {
    try {
      await updateProductBarcodes(id, sessionId, barcodes);
      await loadData();
      onProductsChanged?.();
    } catch (mutationError) { showToast(mutationError instanceof Error ? mutationError.message : "Gagal memperbarui barcode.", "error"); throw mutationError; }
  };

  const handleChanged = () => {
    void loadData();
    onProductsChanged?.();
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Master Produk</CardTitle>
          <CardDescription>
            Kelola produk (PLU) dan barcode untuk sesi ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !products.length ? (
            <div className="flex h-40 items-center justify-center">
              <LoadingSpinner message="Memuat data produk..." />
            </div>
          ) : (
            <ProductTable
              columns={getColumns(handleDelete, handleUpdate, readOnly)}
              data={products}
              addButton={readOnly ? null : <ProductAddButton onSubmit={handleCreate} />}
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
      <ProductBarcodeTable products={products} onUpdateBarcodes={handleUpdateBarcodes} readOnly={readOnly} />
      {!readOnly && (
        <>
          <ProductImportCard sessionId={sessionId} onImported={handleChanged} />
          <ProductClearCard sessionId={sessionId} onCleared={handleChanged} />
        </>
      )}
    </div>
  );
}
