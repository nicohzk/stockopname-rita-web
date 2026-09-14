import { MoreHorizontalIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading";
import ProductAddForm, { type SelectOption } from "./product-add-form";
import type { Product, UpdateProductRequest } from "@/types/product";
import { getCategories } from "@/services/category.service";
import { getDepartments } from "@/services/department.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LIMIT = 8;

export default function ProductTableButton({ product, onDelete, onUpdate }: { product: Product; onDelete: (id: number) => void; onUpdate: (id: number, data: UpdateProductRequest) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Awaited<ReturnType<typeof getCategories>>["data"]>([]);
  const [departments, setDepartments] = useState<Awaited<ReturnType<typeof getDepartments>>["data"]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      Promise.all([getCategories(1, LIMIT), getDepartments(1, LIMIT)])
        .then(async ([loadedCategories, loadedDepartments]) => {
          let finalCategories = loadedCategories.data;
          let finalDepartments = loadedDepartments.data;

          const categoryMissing = product.category && !finalCategories.some((c) => c.name === product.category);
          const departmentMissing = product.department && !finalDepartments.some((d) => d.code === product.department);

          const fetches: Promise<void>[] = [];
          if (categoryMissing) {
            fetches.push(
              getCategories(1, 1, product.category).then((res) => {
                if (res.data.length > 0) finalCategories = [res.data[0], ...finalCategories];
              })
            );
          }
          if (departmentMissing) {
            fetches.push(
              getDepartments(1, 1, product.department).then((res) => {
                if (res.data.length > 0) finalDepartments = [res.data[0], ...finalDepartments];
              })
            );
          }
          await Promise.all(fetches);

          setCategories(finalCategories);
          setDepartments(finalDepartments);
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
        <DropdownMenuItem variant="destructive" onClick={() => void onDelete(product.id)}>Hapus</DropdownMenuItem>
      </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Produk</DialogTitle>
          <Separator />
        </DialogHeader>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <LoadingSpinner message="Memuat data..." />
          </div>
        ) : (
          <ProductAddForm
            categories={categories}
            departments={departments}
            onSearchCategories={handleSearchCategories}
            onSearchDepartments={handleSearchDepartments}
            initialData={product}
            initialCategory={initialCategory}
            initialDepartment={initialDepartment}
            submitLabel="Perbarui Produk"
            onSubmit={async (data) => handleSubmit(data)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
