import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DepartmentAddForm from "./department-add-form";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

export default function DepartmentAddButton({ onSubmit }: { onSubmit: (data: { code: string; name: string; description: string }) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const handleSubmit = async (data: { code: string; name: string; description: string }) => {
    try { await onSubmit(data); setOpen(false); } catch { }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Add Department</Button>} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Department</DialogTitle>
          <Separator></Separator>
        </DialogHeader>
        <DepartmentAddForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}
