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
import type { CreateProductRequest } from "@/types/product";
import { useEffect, useState } from "react";
import { getCategories } from "@/services/category.service";
import { getDepartments } from "@/services/department.service";

const LIMIT = 8;

export default function ProductAddButton({ onSubmit }: { onSubmit: (data: CreateProductRequest) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Awaited<ReturnType<typeof getCategories>>["data"]>([]);
  const [departments, setDepartments] = useState<Awaited<ReturnType<typeof getDepartments>>["data"]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      Promise.all([getCategories(1, LIMIT), getDepartments(1, LIMIT)])
        .then(([loadedCategories, loadedDepartments]) => {
          setCategories(loadedCategories.data);
          setDepartments(loadedDepartments.data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [open]);

  const handleSearchCategories = async (search: string) => {
    const result = await getCategories(1, LIMIT, search);
    setCategories(result.data);
  };

  const handleSearchDepartments = async (search: string) => {
    const result = await getDepartments(1, LIMIT, search);
    setDepartments(result.data);
  };

  const handleSubmit = async (data: CreateProductRequest) => {
    try { await onSubmit(data); setOpen(false); } catch { }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Tambah Produk</Button>} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Produk</DialogTitle>
          <Separator></Separator>
        </DialogHeader>
        {loading ? <p className="p-4">Memuat data...</p> : (
          <ProductAddForm
            categories={categories}
            departments={departments}
            onSearchCategories={handleSearchCategories}
            onSearchDepartments={handleSearchDepartments}
            onSubmit={handleSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}