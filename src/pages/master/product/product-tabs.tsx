import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import ProductTable from "./product-table";
import { productsDummy } from "@/data/products";
import { columns } from "./product-table-column";

export default function ProductTabs() {
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
          <ProductTable columns={columns} data={productsDummy} />
        </CardContent>
      </Card>
    </TabsContent>
  );
}
