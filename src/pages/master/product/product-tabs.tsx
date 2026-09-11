import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import ProductTable from "./product-table";
import { useEffect, useState } from "react";
import { getProducts, createProduct, deleteProduct, updateProduct } from "@/services/product.service";
import { getCategories } from "@/services/category.service";
import { getDepartments } from "@/services/department.service";
import type { CreateProductRequest, UpdateProductRequest } from "@/types/product";
import { getColumns } from "./product-table-column";
import ProductAddButton from "./product-add-btn";
import { useToast } from "@/components/ui/toast";

export default function ProductTabs({ isActive }: { isActive: boolean }) {
  const [products, setProducts] = useState<Awaited<ReturnType<typeof getProducts>>>([]);
  const [categories, setCategories] = useState<Awaited<ReturnType<typeof getCategories>>>([]);
  const [departments, setDepartments] = useState<Awaited<ReturnType<typeof getDepartments>>>([]);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const loadData = async () => {
    setLoading(true);
    try {
      setError(undefined);
      const [loadedProducts, loadedCategories, loadedDepartments] = await Promise.all([getProducts(), getCategories(), getDepartments()]);
      setProducts(loadedProducts); setCategories(loadedCategories); setDepartments(loadedDepartments);
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Failed to load products."); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    if (isActive) void loadData();
  }, [isActive]);
  const handleCreate = async (data: CreateProductRequest) => {
    try { await createProduct(data); await loadData(); showToast("Product added successfully."); }
    catch (mutationError) { showToast(mutationError instanceof Error ? mutationError.message : "Failed to add product.", "error"); throw mutationError; }
  };
  const handleDelete = async (id: number) => {
    try { await deleteProduct(id); await loadData(); showToast("Product deleted successfully."); }
    catch (mutationError) { showToast(mutationError instanceof Error ? mutationError.message : "Failed to delete product.", "error"); }
  };
  const handleUpdate = async (id: number, data: UpdateProductRequest) => {
    try { await updateProduct(id, data); await loadData(); showToast("Product updated successfully."); }
    catch (mutationError) { showToast(mutationError instanceof Error ? mutationError.message : "Failed to update product.", "error"); throw mutationError; }
  };
  return (
    <TabsContent value="products">
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Kelola data master bagian produk untuk kebutuhan stock opname.
            Tambahkan, perbarui, dan kelola data yang digunakan dalam
            pelaksanaan setiap sesi stock opname.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          {loading ? <p>Loading products...</p> : <ProductTable columns={getColumns(handleDelete, handleUpdate, categories, departments)} data={products} addButton={<ProductAddButton categories={categories} departments={departments} onSubmit={handleCreate} />} error={error} />}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
