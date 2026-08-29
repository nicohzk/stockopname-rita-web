import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import CategoryTable from "./category-table";
import { categoriesDummy } from "@/data/category";
import { columns } from "./category-table-column";

export function CategoryTabs() {
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
          <CategoryTable columns={columns} data={categoriesDummy} />
        </CardContent>
      </Card>
    </TabsContent>
  );
}
