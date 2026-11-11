import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog } from "@/components/ui/alert-dialog";
import type { Rack } from "@/types/rack";

export default function RackTableButton({
  item,
  onDelete,
  onMove,
  onFactor,
  readOnly = false,
}: {
  item: Rack;
  onDelete: (rakId: number) => Promise<void>;
  onMove?: (rack: Rack) => void;
  onFactor?: (rack: Rack) => void;
  readOnly?: boolean;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const finalReason = "Sesi atau koordinator sudah final.";

  return (
    <div className="flex gap-1">
      {onFactor ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onFactor(item)}
          disabled={item.itemCount === 0 || item.itemCount > 1000}
          title={
            item.itemCount === 0
              ? "Belum ada hasil."
              : item.itemCount > 1000
                ? "Lebih dari 1000 hasil; pecah per item."
                : undefined
          }
        >
          Faktor Qty
        </Button>
      ) : null}
      {onMove ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMove(item)}
          disabled={readOnly || item.itemCount === 0}
          title={
            readOnly
              ? finalReason
              : item.itemCount === 0
                ? "Belum ada hasil untuk dipindah."
                : undefined
          }
        >
          Pindahkan
        </Button>
      ) : null}
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setConfirmOpen(true)}
        disabled={readOnly || Boolean(item.uploadedAt) || item.itemCount > 0}
        title={
          readOnly
            ? finalReason
            : item.uploadedAt
              ? "Sudah upload."
              : item.itemCount > 0
                ? `Rak masih berisi ${item.itemCount} item.`
                : undefined
        }
      >
        Hapus
      </Button>
      <AlertDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Hapus ${item.name}?`}
        description="Rak ini belum diupload dan tidak berisi item. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, hapus"
        pendingLabel="Menghapus..."
        cancelLabel="Batal"
        destructive
        onConfirm={() => onDelete(item.id)}
      />
    </div>
  );
}
