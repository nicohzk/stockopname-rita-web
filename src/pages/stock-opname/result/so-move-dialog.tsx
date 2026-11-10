import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Coordinator } from "@/types/coordinator";
import type { Rack } from "@/types/rack";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceRack?: Rack;
  racks: Rack[];
  coordinators: Coordinator[];
  resultIds?: number[];
  itemCount?: number;
  onSubmit: (targetRakId: number, note: string) => Promise<void>;
};

export default function StockOpnameMoveDialog({
  open,
  onOpenChange,
  sourceRack,
  racks,
  coordinators,
  resultIds,
  itemCount,
  onSubmit,
}: Props) {
  const [targetRakId, setTargetRakId] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const inactiveCoordinatorIds = new Set(
    coordinators
      .filter((item) => item.status === "COMPLETED" || item.status === "CANCELLED")
      .map((item) => item.id),
  );
  const targetRacks = racks.filter(
    (rack) => rack.id !== sourceRack?.id && !inactiveCoordinatorIds.has(rack.coordinatorId),
  );
  const targetRack = targetRacks.find((rack) => rack.id === Number(targetRakId));
  const coordinatorCode = (id: number) => coordinators.find((item) => item.id === id)?.code ?? `#${id}`;
  const selectedCount = itemCount ?? (resultIds ? resultIds.length : undefined);

  const handleSubmit = async () => {
    if (!targetRack) {
      setError("Pilih rak tujuan.");
      return;
    }
    setSubmitting(true);
    setError(undefined);
    try {
      await onSubmit(targetRack.id, note.trim());
      onOpenChange(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Gagal memindahkan hasil SO.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pindahkan Hasil SO</DialogTitle>
          <DialogDescription>
            Riwayat upload tidak berubah. Laporan sesi/koordinator memakai data terkini.
            Perubahan dicatat di audit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
            <p><span className="font-medium">Sumber:</span> {sourceRack?.name ?? "-"}</p>
            {selectedCount !== undefined ? (
              <p><span className="font-medium">Item:</span> {selectedCount}</p>
            ) : (
              <p><span className="font-medium">Item:</span> seluruh isi rak</p>
            )}
          </div>

          {sourceRack?.uploadedAt ? (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Item tetap tercatat di riwayat upload rak asal, meskipun sudah dipindah.
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="move-target">Rak tujuan</Label>
            <select
              id="move-target"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-background [&>option]:text-foreground"
              value={targetRakId}
              onChange={(event) => setTargetRakId(event.target.value)}
              disabled={submitting}
            >
              <option value="">Pilih rak tujuan</option>
              {targetRacks.map((rack) => (
                <option key={rack.id} value={rack.id}>
                  {rack.name} · {coordinatorCode(rack.coordinatorId)}
                  {rack.uploadedAt ? " (sudah upload)" : ""}
                </option>
              ))}
            </select>
          </div>

          {targetRack?.uploadedAt ? (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Item akan masuk ke data terkini rak tujuan, tetapi tidak akan muncul di riwayat upload rak tujuan.
            </p>
          ) : null}

          <p className="text-sm text-muted-foreground">
            PLU yang sama di rak tujuan akan digabung qty-nya. Hasil dengan faktor qty berbeda tidak bisa digabung; samakan dulu faktornya.
          </p>

          <div className="space-y-2">
            <Label htmlFor="move-note">Catatan koreksi (opsional)</Label>
            <Textarea
              id="move-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Contoh: salah pilih rak saat scan"
              disabled={submitting}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Batal
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={submitting || !targetRack}>
            {submitting ? "Memindahkan..." : "Pindahkan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
