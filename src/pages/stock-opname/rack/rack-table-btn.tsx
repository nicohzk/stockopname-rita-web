import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog } from "@/components/ui/alert-dialog";
import type { Rack } from "@/types/rack";

export default function RackTableButton({
  item,
  onDelete,
  onMove,
}: {
  item: Rack;
  onDelete: (rakId: number) => Promise<void>;
  onMove?: (rack: Rack) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await onDelete(item.id);
    } catch {
      // Parent sudah toast error; dialog tetap ditutup.
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  if (!onMove && item.uploadedAt) return null;

  return (
    <div className="flex gap-1">
      {onMove ? (
        <Button variant="outline" size="sm" onClick={() => onMove(item)}>
          Pindahkan
        </Button>
      ) : null}
      {!item.uploadedAt ? (
        <>
          <Button variant="destructive" size="sm" onClick={() => setConfirmOpen(true)}>
            Hapus
          </Button>
          <AlertDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title={`Hapus ${item.name}?`}
            description="Rak ini belum diupload dan tidak berisi item. Tindakan ini tidak dapat dibatalkan."
            confirmLabel={deleting ? "Menghapus..." : "Ya, hapus"}
            cancelLabel="Batal"
            destructive
            onConfirm={() => void handleDelete()}
          />
        </>
      ) : null}
    </div>
  );
}
