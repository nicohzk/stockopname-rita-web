import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { QtyFactor, QtyFactorScope } from "@/types/stock-opname";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scope: QtyFactorScope;
  label: string;
  itemCount: number;
  currentFactor?: QtyFactor;
  mixed?: boolean;
  onSubmit: (factor: QtyFactor, note: string) => Promise<void>;
  disabled?: boolean;
};

const factors: QtyFactor[] = [1, 0, -1];

function factorLabel(value: QtyFactor) {
  if (value === -1) return "-1 Retur";
  if (value === 0) return "0 Void";
  return "1 Normal";
}

export default function QtyFactorDialog({
  open,
  onOpenChange,
  scope,
  label,
  itemCount,
  currentFactor,
  mixed = false,
  onSubmit,
  disabled = false,
}: Props) {
  const [factor, setFactor] = useState<QtyFactor>(currentFactor ?? 1);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const handleSubmit = async () => {
    if (disabled) return;
    setSubmitting(true);
    setError(undefined);
    try {
      await onSubmit(factor, note.trim());
      onOpenChange(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Gagal mengubah faktor qty.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Faktor Qty</DialogTitle>
          <DialogDescription>
            {label}. Qty efektif = qty × faktor. Faktor -1 retur, 0 void, 1 normal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
            <p><span className="font-medium">Cakupan:</span> {label}</p>
            <p><span className="font-medium">Jumlah item:</span> {itemCount}</p>
            {mixed ? <p className="text-muted-foreground">Faktor item terpilih saat ini campuran.</p> : null}
            {scope !== "item" ? (
              <p className="text-amber-700 dark:text-amber-300">
                Semua item dalam cakupan ini akan ditimpa dengan faktor yang dipilih.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Faktor Qty</Label>
            <div className="grid grid-cols-3 gap-2">
              {factors.map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant={factor === value ? "default" : "outline"}
                  onClick={() => setFactor(value)}
                  disabled={submitting}
                >
                  {factorLabel(value)}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qty-factor-note">Catatan (opsional)</Label>
            <Textarea
              id="qty-factor-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Contoh: koreksi item rusak"
              disabled={submitting}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Batal
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={submitting || disabled || itemCount === 0}>
            {submitting ? "Menyimpan..." : "Terapkan Faktor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
