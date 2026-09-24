import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading";
import { useEffect, useState } from "react";
import { getProducts } from "@/services/product.service";
import { getSessions } from "@/services/session.service";
import { getRackProgress } from "@/services/rack.service";
import { getProductsLastSession } from "@/services/dashboard.service";
import type { Session } from "@/types/session";
import type { ProductLastSession } from "@/types/dashboard";
import DashboardSummaryCards from "./dashboard-summary-cards";
import DashboardSessionTable from "./dashboard-session-table";
import DashboardProducts from "./dashboard-products";

type SessionWithProgress = Session & { progress: number | null };

type DashboardData = {
  totalProducts: number;
  totalSessions: number;
  completedSessions: number;
  inProgressSessions: number;
  recentSessions: SessionWithProgress[];
  oldProducts: ProductLastSession[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    totalProducts: 0,
    totalSessions: 0,
    completedSessions: 0,
    inProgressSessions: 0,
    recentSessions: [],
    oldProducts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(undefined);

        const [productsResult, sessionsResult, oldProducts] = await Promise.all([
          getProducts(1, 1),
          getSessions(1, 100),
          getProductsLastSession(20),
        ]);

        const allSessions = sessionsResult.data;
        const completedSessions = allSessions.filter((s) => s.status === "COMPLETED").length;
        const inProgressSessions = allSessions.filter((s) => s.status === "IN_PROGRESS").length;

        const last5 = allSessions.slice(0, 5);
        const sessionsWithProgress: SessionWithProgress[] = await Promise.all(
          last5.map(async (session) => {
            try {
              const racks = await getRackProgress({ sessionId: session.id });
              const totalAssigned = racks.reduce((acc, r) => acc + r.rackAssigned, 0);
              const totalCompleted = racks.reduce((acc, r) => acc + r.rackCompleted, 0);
              if (totalAssigned === 0) return { ...session, progress: null };
              return { ...session, progress: Math.round((totalCompleted / totalAssigned) * 100) };
            } catch {
              return { ...session, progress: null };
            }
          })
        );

        if (!cancelled) {
          setData({
            totalProducts: productsResult.pagination.total_items,
            totalSessions: sessionsResult.pagination.total_items,
            completedSessions,
            inProgressSessions,
            recentSessions: sessionsWithProgress,
            oldProducts,
          });
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Gagal memuat data dashboard.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadDashboard();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center">
        <LoadingSpinner message="Memuat data dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-w-0 p-0 sm:p-2">
        <div className="mb-3">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p>Ringkasan dan informasi utama sistem stock opname</p>
          <Separator className="mt-2" />
        </div>
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-w-0 p-0 sm:p-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p>Ringkasan dan informasi utama sistem stock opname</p>
        <Separator className="mt-2" />
      </div>
      <DashboardSummaryCards
        totalProducts={data.totalProducts}
        totalSessions={data.totalSessions}
        completedSessions={data.completedSessions}
        inProgressSessions={data.inProgressSessions}
      />
      <div className="grid gap-4 lg:grid-cols-2 mt-4">
        <DashboardSessionTable sessions={data.recentSessions} />
        <DashboardProducts products={data.oldProducts} />
      </div>
    </div>
  );
}
