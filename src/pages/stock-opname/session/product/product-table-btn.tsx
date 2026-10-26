import { MoreHorizontalIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import ProductAddForm from "./product-add-form";
import type { Product, UpdateProductRequest } from "@/types/product";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function ProductTableButton({ product, onDelete, onUpdate }: { product: Product; onDelete: (id: number) => Promise<void>; onUpdate: (id: number, data: UpdateProductRequest) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = async (data: UpdateProductRequest) => {
    // Parent sudah toast error + rethrow; di sini cukup tahan dialog tetap terbuka.
    try { await onUpdate(product.id, data); setOpen(false); } catch { /* error sudah ditampilkan parent */ }
  };

  const handleDelete = async () => {
    // Parent toast sukses/gagal; tutup dialog setelah selesai apapun hasilnya.
    if (deleting) return;
    setDeleting(true);
    try { await onDelete(product.id); } finally { setDeleting(false); setConfirmOpen(false); }
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
        <DropdownMenuItem onClick={() => setOpen(true)}>Edit</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>Hapus</DropdownMenuItem>
      </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Produk</DialogTitle>
          <Separator />
        </DialogHeader>
        <ProductAddForm initialData={product} submitLabel="Perbarui Produk" onSubmit={async (data) => handleSubmit(data)} />
      </DialogContent>
      <AlertDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Hapus produk ${product.plu}?`}
        description="Produk dan barcode-nya akan dihapus permanen. Lanjut?"
        confirmLabel={deleting ? "Menghapus..." : "Ya, hapus"}
        cancelLabel="Batal"
        destructive
        onConfirm={() => void handleDelete()}
      />
    </Dialog>
  );
}
