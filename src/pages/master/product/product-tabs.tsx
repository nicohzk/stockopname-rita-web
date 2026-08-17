import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import ProductTable from "./product-table";
import { products } from "@/data/products";
import { columns } from "./product-table-column";

export default function ProductTabs() {
  return (
    <TabsContent value="products">
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            View your products and manage your inventory. Add new products,
            update existing ones, and track stock levels.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ProductTable columns={columns} data={products} />
        </CardContent>
      </Card>
    </TabsContent>
  );
}
