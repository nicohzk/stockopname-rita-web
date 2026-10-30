import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getSession } from "@/services/session.service";
import { getProducts } from "@/services/product.service";
import ProductTable from "./session/product/product-table";
import { barcodeColumns } from "./session/product/product-table-column";
import { ProductImportCard, ProductClearCard } from "./session/product/product-master-tools";

export default function ProductPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const id = Number(sessionId);
  const [session, setSession] =
    useState<Awaited<ReturnType<typeof getSession>>>();
  const [products, setProducts] = useState<
    Awaited<ReturnType<typeof getProducts>>["data"]
  >([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [productsError, setProductsError] = useState<string>();

  useEffect(() => {
    if (!Number.isFinite(id)) return;
    const loadData = async () => {
      try {
        setLoading(true);
        setError(undefined);
        setSession(await getSession(id));
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
    void loadData();
  }, [id]);

  const loadProducts = async (nextPage = page, nextSearch = search) => {
    try {
      setProductsLoading(true);
      setProductsError(undefined);
      setSearchInput(nextSearch);
      const result = await getProducts(id, nextPage, 6, nextSearch);
      setProducts(result.data);
      setPage(result.pagination.page);
      setTotalPages(result.pagination.total_pages || 1);
    } catch (loadError) {
      setProductsError(
        loadError instanceof Error
          ? loadError.message
          : "Gagal memuat data produk.",
      );
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (Number.isFinite(id)) void loadProducts();
  }, [id, page, search]);

  if (!Number.isFinite(id)) {
    return <div className="p-4 text-destructive">ID sesi tidak valid.</div>;
  }
  if (loading && !session) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center">
        <LoadingSpinner message="Memuat data sesi..." />
      </div>
    );
  }
  if (error || !session) {
    return (
      <div className="p-4 text-destructive">
        {error ?? "Sesi tidak ditemukan."}
      </div>
    );
  }

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
                  <BreadcrumbLink
                    render={<Link to={`/stock-opname/sesi/${id}`} />}
                    className="text-xs"
                  >
                    {session.code}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-xs">Master Produk</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-2xl font-bold mt-2">Master Produk</h1>
            <p className="text-sm font-semibold mt-1">
              {session.code} · {session.location}
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate(`/stock-opname/sesi/${id}`)}>
            Kembali
          </Button>
        </div>
        <Separator className="mt-2" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Barcode</CardTitle>
        </CardHeader>
        <CardContent>
          {productsLoading && !products.length ? (
            <div className="flex h-40 items-center justify-center">
              <LoadingSpinner message="Memuat data produk..." />
            </div>
          ) : (
            <ProductTable
              columns={barcodeColumns}
              data={products}
              addButton={null}
              error={productsError}
              onSearch={setSearchInput}
              searchValue={searchInput}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              loading={productsLoading}
            />
          )}
        </CardContent>
      </Card>
      {session.status === "IN_PROGRESS" ? (
        <>
          <ProductImportCard sessionId={id} onImported={() => void loadProducts(1)} />
          <ProductClearCard sessionId={id} onCleared={() => void loadProducts(1)} />
        </>
      ) : (
        <p className="text-muted-foreground mt-5 text-sm">
          Master produk terkunci karena sesi sudah selesai atau dibatalkan.
        </p>
      )}
    </div>
  );
}
