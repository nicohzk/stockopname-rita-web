import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type SubmitEvent } from "react";
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


const categories: Category[] = [
  { id: 1, name: "Food", description: "Food items" },
  { id: 2, name: "Beverage", description: "Beverage items" },
  { id: 3, name: "Electronics", description: "Electronic items" },
];

const departments: Department[] = [
  { id: 1, code: "N001", name: "Nestle", description: "Nestle products" },
  { id: 2, code: "I001", name: "Indofood", description: "Indofood products" },
  { id: 3, code: "M001", name: "Mayora", description: "Mayora products" },
];

const categoryItems = categories.map((category) => ({
  value: String(category.id),
  label: category.name,
}));

const departmentItems = departments.map((department) => ({
  value: String(department.id),
  label: department.name,
}));

export default function ProductAddForm() {
  const onSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    //logical post data to backend
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="barcode">Barcode</Label>
        <Input id="barcode" name="barcode" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Combobox
          items={categoryItems}
          itemToStringValue={(item) => item.label}
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
          items={departmentItems}
          itemToStringValue={(item) => item.label}
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
        <Input id="buyPrice" name="buyPrice" type="number" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sellPrice">Sell Price</Label>
        <Input id="sellPrice" name="sellPrice" type="number" />
      </div>

      <Button type="submit" className="w-full">
        Add Product
      </Button>
    </form>
  );
}
