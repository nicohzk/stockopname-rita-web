import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog } from "@/components/ui/alert-dialog";
import type { Rack } from "@/types/rack";

export default function RackTableButton({
  item,
  onDelete,
}: {
  item: Rack;
  onDelete: (rakId: number) => Promise<void>;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (item.uploadedAt) return null;

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

  return (
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
  );
}
