import { ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SelectionMode } from "@/types/stock-opname";

type Props = {
  mode: SelectionMode;
  filtered: boolean;
  count: number;
  onFactor: () => void;
  onMove?: () => void;
  moveDisabledReason?: string;
  onClear: () => void;
};

export default function ResultSelectionBar({
  mode,
  filtered,
  count,
  onFactor,
  onMove,
  moveDisabledReason,
  onClear,
}: Props) {
  if (count === 0) return null;

  // Dua keadaan ini sering tertukar kalau gayanya sama: "memilih semua hasil"
  // bukan sekadar pilihan manual yang lebih banyak.
  const allSelected = mode === "filter";

  return (
    <div
      role="status"
      className={cn(
        "mb-3 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm",
        allSelected
          ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-50"
          : "bg-muted/40",
      )}
    >
      {allSelected ? <ListChecks className="h-4 w-4 shrink-0" /> : null}

      <span className="font-semibold">
        {allSelected
          ? `Semua ${count} baris dipilih${filtered ? " (sesuai filter)" : ""}`
          : `${count} baris dipilih`}
      </span>

      <span className={allSelected ? "text-emerald-700 dark:text-emerald-300/80" : "text-muted-foreground"}>
        {allSelected ? "Termasuk baris di halaman lain." : "Centang baris lain untuk menambah."}
      </span>

      <div className="ml-auto flex flex-wrap gap-2">
        <Button size="sm" onClick={onFactor}>
          Faktor Qty
        </Button>
        {onMove ? (
          <Button
            size="sm"
            variant="outline"
            onClick={onMove}
            disabled={Boolean(moveDisabledReason)}
            title={moveDisabledReason}
          >
            Pindahkan
          </Button>
        ) : null}
        <Button size="sm" variant="ghost" onClick={onClear}>
          Batalkan pilihan
        </Button>
      </div>
    </div>
  );
}
