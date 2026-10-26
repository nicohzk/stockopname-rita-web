import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getSession } from "@/services/session.service";
import { ProductImportCard, ProductClearCard } from "./session/product/product-master-tools";

export default function ProductPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const id = Number(sessionId);
  const [session, setSession] =
    useState<Awaited<ReturnType<typeof getSession>>>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

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
            <StatusBadge className="my-2" status={session.status} />
            <p className="text-muted-foreground text-sm">
              {session.code} · {session.location}
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate(`/stock-opname/sesi/${id}`)}>
            Kembali
          </Button>
        </div>
        <Separator className="mt-2" />
      </div>
      {session.status === "IN_PROGRESS" ? (
        <>
          <ProductImportCard sessionId={id} onImported={() => {}} />
          <ProductClearCard sessionId={id} onCleared={() => {}} />
        </>
      ) : (
        <p className="text-muted-foreground text-sm">
          Master produk terkunci karena sesi sudah selesai atau dibatalkan.
        </p>
      )}
    </div>
  );
}
