import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import SessionAddForm from "./session-add-form";
import { useState } from "react";
import type { SessionCreateRequest } from "@/types/session";

export default function SessionAddBtn({ onSubmit }: { onSubmit: (data: SessionCreateRequest, produk: File, barcode: File) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const handleSubmit = async (data: SessionCreateRequest, produk: File, barcode: File) => {
    try { await onSubmit(data, produk, barcode); setOpen(false); } catch { /* error sudah ditampilkan parent */ }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Tambah Sesi</Button>} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Sesi</DialogTitle>
          <Separator></Separator>
        </DialogHeader>
          <SessionAddForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}
