import { Button } from "@/components/ui/button";
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

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
      <span className="font-medium">
        {count} item {mode === "filter" ? `(semua hasil${filtered ? " filter" : ""})` : "dipilih"}
      </span>
      {mode === "filter" ? (
        <span className="text-muted-foreground">Centang baris untuk memilih manual.</span>
      ) : null}
      <div className="ml-auto flex flex-wrap gap-2">
        <Button size="sm" onClick={onFactor}>
          Faktor Qty
        </Button>
        {mode === "manual" && onMove ? (
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
          Bersihkan
        </Button>
      </div>
    </div>
  );
}
