import { Button } from "@/components/ui/button";
import ProductAddForm from "./product-add-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator"
import type { Category } from "@/types/category";
import type { Department } from "@/types/department";
import type { CreateProductRequest } from "@/types/product";
import { useState } from "react";

export default function ProductAddButton({ categories, departments, onSubmit }: { categories: Category[]; departments: Department[]; onSubmit: (data: CreateProductRequest) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const handleSubmit = async (data: CreateProductRequest) => {
    try { await onSubmit(data); setOpen(false); } catch { }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Add Product</Button>} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
          <Separator></Separator>
        </DialogHeader>
        <ProductAddForm categories={categories} departments={departments} onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}