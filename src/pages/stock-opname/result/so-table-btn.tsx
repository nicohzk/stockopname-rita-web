import { MoreHorizontalIcon } from "lucide-react";
import { useState, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const quantity = Number(new FormData(event.currentTarget).get("quantity"));
    await onUpdate(item.id, quantity);
    setOpen(false);
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
        <DropdownMenuItem variant="destructive" onClick={() => void onDelete(item.id)}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Stock Opname</DialogTitle></DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2"><Label htmlFor={`quantity-${item.id}`}>Quantity</Label><Input id={`quantity-${item.id}`} name="quantity" type="number" defaultValue={item.quantity} /></div>
          <Button type="submit" className="w-full">Update Stock Opname</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
