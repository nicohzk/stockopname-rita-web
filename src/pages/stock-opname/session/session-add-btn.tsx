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
    try { await onSubmit(data); setOpen(false); } catch { }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Add Sesi</Button>} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Sesi</DialogTitle>
          <Separator></Separator>
        </DialogHeader>
          <SessionAddForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}
