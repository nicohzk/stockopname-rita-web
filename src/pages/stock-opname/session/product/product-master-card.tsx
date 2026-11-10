import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading";
import ProductTable from "./product-table";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, createProduct, deleteProduct, updateProduct } from "@/services/product.service";
import type { CreateProductRequest, UpdateProductRequest } from "@/types/product";
import { getColumns } from "./product-table-column";
import ProductAddButton from "./product-add-btn";
import { useToast } from "@/components/ui/toast";
import { Notice, RetryButton } from "@/components/ui/notice";
import { errorMessage, refreshWarningMessage } from "@/lib/errors";

export default function ProductMasterCard({
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
  const [refreshWarning, setRefreshWarning] = useState<string>();
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const readOnly = sessionStatus !== "IN_PROGRESS";

  const loadData = async (nextPage = page, nextSearch = search) => {
    setLoading(true);
    setError(undefined);
    try {
      const result = await getProducts(sessionId, nextPage, 6, nextSearch);
      setProducts(result.data);
      setPage(result.pagination.page);
      setTotalPages(result.pagination.total_pages || 1);
      setError(undefined);
      setRefreshWarning(undefined);
    } catch (loadError) {
      setError(errorMessage(loadError, "Gagal memuat data produk."));
    } finally {
      setLoading(false);
    }
  };

  // Non-fatal reload used after a mutation that already succeeded: a failing
  // refresh must not turn that success into an error.
  const refreshProducts = async () => {
    try {
      const result = await getProducts(sessionId, page, 6, search);
      setProducts(result.data);
      setPage(result.pagination.page);
      setTotalPages(result.pagination.total_pages || 1);
      setError(undefined);
      setRefreshWarning(undefined);
    } catch (refreshError) {
      setRefreshWarning(refreshWarningMessage(refreshError));
    }
  };
  const handlePageChange = (nextPage: number) => {
    setLoading(true);
    setError(undefined);
    setPage(nextPage);
  };

  useEffect(() => {
    if (searchInput === search) return;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(undefined);
      setSearch(searchInput);
      setPage(1);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchInput, search]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const result = await getProducts(sessionId, page, 6, search);
        if (cancelled) return;
        setProducts(result.data);
        setPage(result.pagination.page);
        setTotalPages(result.pagination.total_pages || 1);
        setError(undefined);
      } catch (loadError) {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : "Gagal memuat data produk.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [sessionId, page, search]);
  const handleCreate = async (data: CreateProductRequest) => {
    try {
      await createProduct(sessionId, data);
    } catch (mutationError) {
      showToast(errorMessage(mutationError, "Gagal menambahkan produk."), "error");
      throw mutationError;
    }
    showToast("Produk berhasil ditambahkan.");
    onProductsChanged?.();
    await refreshProducts();
  };
  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id, sessionId);
    } catch (mutationError) {
      showToast(errorMessage(mutationError, "Gagal menghapus produk."), "error");
      return;
    }
    showToast("Produk berhasil dihapus.");
    onProductsChanged?.();
    await refreshProducts();
  };
  const handleUpdate = async (id: number, data: UpdateProductRequest) => {
    try {
      await updateProduct(id, sessionId, data);
    } catch (mutationError) {
      showToast(errorMessage(mutationError, "Gagal memperbarui produk."), "error");
      throw mutationError;
    }
    showToast("Produk berhasil diperbarui.");
    onProductsChanged?.();
    await refreshProducts();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Master Produk</CardTitle>
        <CardDescription>
          Kelola produk (PLU) dan barcode untuk sesi ini.
        </CardDescription>
        {!readOnly && (
          <CardAction>
            <Button variant="outline" onClick={() => navigate(`/stock-opname/sesi/${sessionId}/produk`)}>
              Kelola Master Produk
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {refreshWarning ? (
          <Notice
            message={refreshWarning}
            action={
              <RetryButton onRetry={() => void loadData()} retrying={loading} />
            }
          />
        ) : null}
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
            onPageChange={handlePageChange}
            loading={loading}
          />
        )}
      </CardContent>
    </Card>
  );
}
