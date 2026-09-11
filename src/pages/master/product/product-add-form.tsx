import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState, type SubmitEvent } from "react";
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

export default function ProductAddForm({ categories, departments, onSubmit, initialData, initialCategory, initialDepartment, submitLabel = "Add Product" }: { categories: Category[]; departments: Department[]; onSubmit: (data: CreateProductRequest) => Promise<void>; initialData?: Product; initialCategory?: SelectOption | null; initialDepartment?: SelectOption | null; submitLabel?: string }) {
  const [selectedCategory, setSelectedCategory] = useState<SelectOption | null>(initialCategory ?? null);
  const [selectedDepartment, setSelectedDepartment] = useState<SelectOption | null>(initialDepartment ?? null);

  useEffect(() => {
    setSelectedCategory(initialCategory ?? null);
    setSelectedDepartment(initialDepartment ?? null);
  }, [initialCategory, initialDepartment]);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (!selectedCategory || !selectedDepartment) {
      throw new Error("Category and department are required.");
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
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={initialData?.name} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Combobox
          items={categories.map((category) => ({ value: String(category.id), label: category.name }))}
          value={selectedCategory}
          onValueChange={(value) => setSelectedCategory(value as SelectOption | null)}
          itemToStringValue={(item: { value: string; label: string }) => item.label}
        >
          <ComboboxInput placeholder="Select a category" name="category" />
          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
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
          itemToStringValue={(item: { value: string; label: string }) => item.label}
        >
          <ComboboxInput placeholder="Select a department" name="department" />
          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
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
        <Label htmlFor="buyPrice">Buy Price</Label>
        <Input id="buyPrice" name="buyPrice" type="number" defaultValue={initialData?.buyPrice} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sellPrice">Sell Price</Label>
        <Input id="sellPrice" name="sellPrice" type="number" defaultValue={initialData?.sellPrice} />
      </div>

      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
