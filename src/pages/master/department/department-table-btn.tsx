import { MoreHorizontalIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import DepartmentAddForm from "./department-add-form";
import type { Department, DepartmentRequest } from "@/types/department";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DepartmentTableButton({ department, onDelete, onUpdate }: { department: Department; onDelete: (id: number) => void; onUpdate: (id: number, data: DepartmentRequest) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const handleSubmit = async (data: DepartmentRequest) => {
    try { await onUpdate(department.id, data); setOpen(false); } catch { }
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
        <DropdownMenuItem variant="destructive" onClick={() => void onDelete(department.id)}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Department</DialogTitle>
          <Separator />
        </DialogHeader>
        <DepartmentAddForm initialData={department} submitLabel="Update Department" onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}
