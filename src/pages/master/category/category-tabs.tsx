import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import CategoryTable from "./category-table";
import { useEffect, useState } from "react";
import type { CategoryRequest } from "@/types/category";
import { createCategory, deleteCategory, getCategories, updateCategory } from "@/services/category.service";
import { getColumns } from "./category-table-column";
import CategoryAddButton from "./category-add-btn";
import { useToast } from "@/components/ui/toast";

export function CategoryTabs({ isActive }: { isActive: boolean }) {
  const [categories, setCategories] = useState<Awaited<ReturnType<typeof getCategories>>>([]);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const loadCategories = async () => {
    setLoading(true);
    try { setError(undefined); setCategories(await getCategories()); }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Failed to load categories."); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    if (isActive) void loadCategories();
  }, [isActive]);
  const handleCreate = async (data: CategoryRequest) => {
    try { await createCategory(data); await loadCategories(); showToast("Category added successfully."); }
    catch (mutationError) { showToast(mutationError instanceof Error ? mutationError.message : "Failed to add category.", "error"); throw mutationError; }
  };
  const handleDelete = async (id: number) => {
    try { await deleteCategory(id); await loadCategories(); showToast("Category deleted successfully."); }
    catch (mutationError) { showToast(mutationError instanceof Error ? mutationError.message : "Failed to delete category.", "error"); }
  };
  const handleUpdate = async (id: number, data: CategoryRequest) => {
    try { await updateCategory(id, data); await loadCategories(); showToast("Category updated successfully."); }
    catch (mutationError) { showToast(mutationError instanceof Error ? mutationError.message : "Failed to update category.", "error"); throw mutationError; }
  };
  return (
    <TabsContent value="categories">
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            Kelola data master bagian kategori untuk kebutuhan stock opname.
            Tambahkan, perbarui, dan kelola data yang digunakan dalam
            pelaksanaan setiap sesi stock opname.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          {loading ? <p>Loading categories...</p> : <CategoryTable columns={getColumns(handleDelete, handleUpdate)} data={categories} addButton={<CategoryAddButton onSubmit={handleCreate} />} error={error} />}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
