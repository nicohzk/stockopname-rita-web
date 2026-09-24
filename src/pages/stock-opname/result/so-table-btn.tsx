import { MoreHorizontalIcon } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog } from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { StockOpname } from "@/types/stock-opname";

export default function StockOpnameTableButton({ item, onUpdate, onDelete }: { item: StockOpname; onUpdate: (id: number, quantity: number) => Promise<void>; onDelete: (id: number) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string>();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const quantity = Number(new FormData(event.currentTarget).get("quantity"));
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setValidationError("Jumlah harus angka lebih dari 0.");
      return;
    }
    setValidationError(undefined);
    setSubmitting(true);
    try {
      await onUpdate(item.id, quantity);
      setOpen(false);
    } catch {
      // Parent sudah toast error + rethrow; di sini cukup tahan dialog tetap terbuka.
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    // Parent toast sukses/gagal; tutup dialog setelah selesai apapun hasilnya.
    if (deleting) return;
    setDeleting(true);
    try { await onDelete(item.id); } finally { setDeleting(false); setConfirmOpen(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontalIcon strokeWidth={3.5} />
            <span className="sr-only">Open menu</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => { setValidationError(undefined); setOpen(true); }}>Edit</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Stock Opname</DialogTitle></DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2"><Label htmlFor={`quantity-${item.id}`}>Quantity</Label><Input id={`quantity-${item.id}`} name="quantity" type="number" min="1" required defaultValue={item.quantity} />{validationError ? <p className="text-sm text-destructive">{validationError}</p> : null}</div>
          <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Menyimpan..." : "Update Stock Opname"}</Button>
        </form>
      </DialogContent>
      <AlertDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Hapus item ${item.barcode}?`}
        description="Hasil hitung item ini akan dihapus permanen. Lanjut?"
        confirmLabel={deleting ? "Menghapus..." : "Ya, hapus"}
        cancelLabel="Batal"
        destructive
        onConfirm={() => void handleDelete()}
      />
    </Dialog>
  );
}
