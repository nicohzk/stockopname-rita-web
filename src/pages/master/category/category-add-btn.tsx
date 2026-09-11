import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import CategoryAddForm from "./category-add-form";
import { useState } from "react";

export default function CategoryAddButton({ onSubmit }: { onSubmit: (data: { name: string; description: string }) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const handleSubmit = async (data: { name: string; description: string }) => {
    try { await onSubmit(data); setOpen(false); } catch { }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Add Category</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
        </DialogHeader>
        <Separator />
        <CategoryAddForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}