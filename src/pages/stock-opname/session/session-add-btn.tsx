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

export default function SessionAddBtn({ onSubmit }: { onSubmit: (data: SessionCreateRequest) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const handleSubmit = async (data: SessionCreateRequest) => {
    // Parent sudah toast error + rethrow; di sini cukup tahan dialog tetap terbuka.
    try { await onSubmit(data); setOpen(false); } catch { /* error sudah ditampilkan parent */ }
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
