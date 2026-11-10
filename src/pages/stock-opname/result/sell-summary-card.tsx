import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatQty } from "@/lib/format-currency";
import { getSellSummary } from "@/services/stock-opname.service";
import type { SellSummaryGroup } from "@/types/stock-opname";

type GroupBy = "session" | "coordinator" | "rack";

export default function SellSummaryCard({ sessionId, refreshKey = 0 }: { sessionId: number; refreshKey?: number }) {
  const [groupBy, setGroupBy] = useState<GroupBy>("session");
  const [groups, setGroups] = useState<SellSummaryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(undefined);
      try {
        const result = await getSellSummary(sessionId, groupBy);
        if (!cancelled) setGroups(result.groups ?? []);
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Gagal memuat rekapan jual.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [sessionId, groupBy, refreshKey]);

  return (
    <Card className="my-5">
      <CardHeader>
        <CardTitle>Rekapan Nilai Jual</CardTitle>
        <CardDescription>Total nilai jual asli dan efektif setelah faktor qty.</CardDescription>
        <div className="pt-2">
          <select
            aria-label="Grouping rekapan"
            className="h-9 min-w-40 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            value={groupBy}
            onChange={(event) => setGroupBy(event.target.value as GroupBy)}
          >
            <option value="session">Sesi</option>
            <option value="coordinator">Koordinator</option>
            <option value="rack">Rak</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingSpinner message="Memuat rekapan jual..." />
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada hasil stock opname.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group</TableHead>
                <TableHead className="text-right">Item</TableHead>
                <TableHead className="text-right">Qty Efektif</TableHead>
                <TableHead className="text-right">Total Jual Asli</TableHead>
                <TableHead className="text-right">Total Jual Efektif</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.key}>
                  <TableCell>{group.label}</TableCell>
                  <TableCell className="text-right">{group.item_count}</TableCell>
                  <TableCell className="text-right">{formatQty(group.total_qty)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(group.total_sell_original)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(group.total_sell_effective)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
