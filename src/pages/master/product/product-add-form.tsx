import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useRef, useState, type SubmitEvent } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import type { Category } from "@/types/category";
import type { Department } from "@/types/department";
import type { CreateProductRequest, Product } from "@/types/product";

export type SelectOption = { value: string; label: string };

export default function ProductAddForm({ categories, departments, onSearchCategories, onSearchDepartments, onSubmit, initialData, initialCategory, initialDepartment, submitLabel = "Tambah Produk" }: { categories: Category[]; departments: Department[]; onSearchCategories?: (search: string) => Promise<void>; onSearchDepartments?: (search: string) => Promise<void>; onSubmit: (data: CreateProductRequest) => Promise<void>; initialData?: Product; initialCategory?: SelectOption | null; initialDepartment?: SelectOption | null; submitLabel?: string }) {
  const [selectedCategory, setSelectedCategory] = useState<SelectOption | null>(initialCategory ?? null);
  const [selectedDepartment, setSelectedDepartment] = useState<SelectOption | null>(initialDepartment ?? null);
  const categorySearchRef = useRef("");
  const departmentSearchRef = useRef("");
  const categoryTimerRef = useRef<number | undefined>(undefined);
  const departmentTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    setSelectedCategory(initialCategory ?? null);
    setSelectedDepartment(initialDepartment ?? null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCategorySearch = (value: string) => {
    categorySearchRef.current = value;
    if (onSearchCategories) {
      if (categoryTimerRef.current) clearTimeout(categoryTimerRef.current);
      categoryTimerRef.current = window.setTimeout(() => {
        void onSearchCategories(value);
      }, 250);
    }
  };

  const handleDepartmentSearch = (value: string) => {
    departmentSearchRef.current = value;
    if (onSearchDepartments) {
      if (departmentTimerRef.current) clearTimeout(departmentTimerRef.current);
      departmentTimerRef.current = window.setTimeout(() => {
        void onSearchDepartments(value);
      }, 250);
    }
  };

  useEffect(() => {
    return () => {
      if (categoryTimerRef.current) clearTimeout(categoryTimerRef.current);
      if (departmentTimerRef.current) clearTimeout(departmentTimerRef.current);
    };
  }, []);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (!selectedCategory || !selectedDepartment) {
      throw new Error("Kategori dan department wajib diisi.");
    }

    await onSubmit({
      barcode: String(formData.get("barcode")),
      name: String(formData.get("name")),
      buyPrice: Number(formData.get("buyPrice")),
      sellPrice: Number(formData.get("sellPrice")),
      categoryId: Number(selectedCategory.value),
      departmentId: Number(selectedDepartment.value),
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="barcode">Barcode</Label>
        <Input id="barcode" name="barcode" defaultValue={initialData?.barcode} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nama</Label>
        <Input id="name" name="name" defaultValue={initialData?.name} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Kategori</Label>
        <Combobox
          items={categories.map((category) => ({ value: String(category.id), label: category.name }))}
          value={selectedCategory}
          onValueChange={(value) => setSelectedCategory(value as SelectOption | null)}
          onInputValueChange={(inputValue) => handleCategorySearch(inputValue)}
          itemToStringValue={(item: { value: string; label: string }) => item.label}
        >
          <ComboboxInput placeholder="Pilih atau cari kategori" name="category" showClear />
          <ComboboxContent>
            <ComboboxEmpty>Tidak ada data.</ComboboxEmpty>
            <ComboboxList>
              {(category) => (
                <ComboboxItem key={category.value} value={category}>
                  {category.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Combobox
          items={departments.map((department) => ({ value: String(department.id), label: department.name }))}
          value={selectedDepartment}
          onValueChange={(value) => setSelectedDepartment(value as SelectOption | null)}
          onInputValueChange={(inputValue) => handleDepartmentSearch(inputValue)}
          itemToStringValue={(item: { value: string; label: string }) => item.label}
        >
          <ComboboxInput placeholder="Pilih atau cari department" name="department" showClear />
          <ComboboxContent>
            <ComboboxEmpty>Tidak ada data.</ComboboxEmpty>
            <ComboboxList>
              {(department) => (
                <ComboboxItem key={department.value} value={department}>
                  {department.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      <div className="space-y-2">
        <Label htmlFor="buyPrice">Harga Beli</Label>
        <Input id="buyPrice" name="buyPrice" type="number" defaultValue={initialData?.buyPrice} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sellPrice">Harga Jual</Label>
        <Input id="sellPrice" name="sellPrice" type="number" defaultValue={initialData?.sellPrice} />
      </div>

      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
