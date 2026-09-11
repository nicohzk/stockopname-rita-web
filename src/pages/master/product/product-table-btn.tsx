import { MoreHorizontalIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import ProductAddForm, { type SelectOption } from "./product-add-form";
import type { Category } from "@/types/category";
import type { Department } from "@/types/department";
import type { Product, UpdateProductRequest } from "@/types/product";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ProductTableButton({ product, categories, departments, onDelete, onUpdate }: { product: Product; categories: Category[]; departments: Department[]; onDelete: (id: number) => void; onUpdate: (id: number, data: UpdateProductRequest) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const category = categories.find((item) => item.name === product.category);
  const department = departments.find((item) => item.code === product.department);
  const initialCategory: SelectOption | null = category ? { value: String(category.id), label: category.name } : null;
  const initialDepartment: SelectOption | null = department ? { value: String(department.id), label: department.name } : null;

  const handleSubmit = async (data: UpdateProductRequest) => {
    try { await onUpdate(product.id, data); setOpen(false); } catch { }
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
        <DropdownMenuItem variant="destructive" onClick={() => void onDelete(product.id)}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <Separator />
        </DialogHeader>
        <ProductAddForm
          categories={categories}
          departments={departments}
          initialData={product}
          initialCategory={initialCategory}
          initialDepartment={initialDepartment}
          submitLabel="Update Product"
          onSubmit={async (data) => handleSubmit(data)}
        />
      </DialogContent>
    </Dialog>
  );
}
