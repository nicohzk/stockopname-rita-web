import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatQty } from "@/lib/format-currency";
import type { SellSummaryGroup } from "@/types/stock-opname";

type SummaryCardsProps = {
  progressFailed: boolean;
  progressPercent: number;
  rackCompleted?: number;
  rackAssigned?: number;
  totalItems?: number;
  /** Halaman sesi mengirim nilai jual; halaman koordinator tidak. */
  sellTotal?: SellSummaryGroup;
  sellTotalFailed?: boolean;
};

/** Kartu ringkasan di atas halaman: progres, status rak, total barang, nilai jual. */
export default function SummaryCards({
  progressFailed,
  progressPercent,
  rackCompleted,
  rackAssigned,
  totalItems,
  sellTotal,
  sellTotalFailed,
}: SummaryCardsProps) {
  const showSell = sellTotal !== undefined || sellTotalFailed !== undefined;

  return (
    <div
      className={
        showSell
          ? "mb-5 grid gap-3 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4"
          : "mb-5 grid gap-3 sm:gap-5 md:grid-cols-3"
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Progres</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{progressFailed ? "—" : `${progressPercent}%`}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Status Rak</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {progressFailed ? "—" : `${rackCompleted ?? 0}/${rackAssigned ?? 0}`}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Barang</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{progressFailed ? "—" : (totalItems ?? 0)}</p>
        </CardContent>
      </Card>
      {showSell ? (
        <Card>
          <CardHeader>
            <CardTitle>Nilai Jual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold tabular-nums">
              {sellTotalFailed || !sellTotal ? "—" : formatCurrency(sellTotal.total_sell_effective)}
            </p>
            <p className="text-muted-foreground text-xs">
              Qty {sellTotalFailed || !sellTotal ? "—" : formatQty(sellTotal.total_qty)}
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
