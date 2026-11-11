import { useEffect, useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading";
import { Notice, RetryButton } from "@/components/ui/notice";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatQty } from "@/lib/format-currency";
import { getSellSummary } from "@/services/stock-opname.service";
import type { SellSummaryGroup } from "@/types/stock-opname";

type GroupBy = "coordinator" | "rack";

export default function SellSummaryCard({
  sessionId,
  refreshKey = 0,
}: {
  sessionId: number;
  refreshKey?: number;
}) {
  const [groupBy, setGroupBy] = useState<GroupBy>("coordinator");
  const [groups, setGroups] = useState<SellSummaryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(undefined);
      try {
        const result = await getSellSummary(sessionId, groupBy);
        if (!cancelled) setGroups(result.groups ?? []);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat rekapan jual.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [sessionId, groupBy, refreshKey, reloadKey]);

  const totalItems = groups.reduce((sum, group) => sum + group.item_count, 0);
  const totalQty = groups.reduce((sum, group) => sum + group.total_qty, 0);
  const totalSell = groups.reduce(
    (sum, group) => sum + group.total_sell_effective,
    0,
  );

  return (
    <Card className="my-5">
      <CardHeader>
        <CardTitle>Rekapan Harga Jual</CardTitle>
        <CardDescription>
          Qty dan nilai jual sudah termasuk faktor qty.
        </CardDescription>
        <CardAction>
          <select
            aria-label="Grouping rekapan"
            className="h-9 min-w-40 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            value={groupBy}
            onChange={(event) => {
              setGroups([]);
              setGroupBy(event.target.value as GroupBy);
            }}
          >
            <option value="coordinator">Koordinator</option>
            <option value="rack">Rak</option>
          </select>
        </CardAction>
      </CardHeader>
      <CardContent>
        {error ? (
          <Notice
            tone="error"
            message={error}
            action={
              <RetryButton
                onRetry={() => setReloadKey((value) => value + 1)}
                retrying={loading}
              />
            }
          />
        ) : null}
        {loading ? (
          <LoadingSpinner message="Memuat rekapan jual..." />
        ) : groups.length === 0 ? (
          error ? null : (
            <p className="text-muted-foreground text-sm">
              Belum ada hasil stock opname.
            </p>
          )
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grup</TableHead>
                <TableHead className="text-right">Item</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Nilai Jual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.key}>
                  <TableCell>{group.label}</TableCell>
                  <TableCell className="text-right">
                    {group.item_count}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatQty(group.total_qty)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(group.total_sell_effective)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {groups.length > 1 ? (
              <TableFooter>
                <TableRow>
                  <TableCell className="font-semibold">TOTAL</TableCell>
                  <TableCell className="text-right font-semibold">
                    {totalItems}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatQty(totalQty)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(totalSell)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            ) : null}
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
