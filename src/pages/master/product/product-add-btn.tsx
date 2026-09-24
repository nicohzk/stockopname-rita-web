import { Button } from "@/components/ui/button";
import ProductAddForm from "./product-add-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator"
import type { CreateProductRequest } from "@/types/product";
import { useState } from "react";

export default function ProductAddButton({ onSubmit }: { onSubmit: (data: CreateProductRequest) => Promise<void> }) {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (data: CreateProductRequest) => {
    try { await onSubmit(data); setOpen(false); } catch { }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Tambah Produk</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Produk</DialogTitle>
          <Separator></Separator>
        </DialogHeader>
        <ProductAddForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}
