import { MoreHorizontalIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import CategoryAddForm from "./category-add-form";
import type { Category, CategoryRequest } from "@/types/category";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CategoryTableButton({ category, onDelete, onUpdate }: { category: Category; onDelete: (id: number) => void; onUpdate: (id: number, data: CategoryRequest) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const handleSubmit = async (data: CategoryRequest) => {
    try { await onUpdate(category.id, data); setOpen(false); } catch { }
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
        <DropdownMenuItem variant="destructive" onClick={() => void onDelete(category.id)}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <Separator />
        </DialogHeader>
        <CategoryAddForm initialData={category} submitLabel="Update Category" onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}