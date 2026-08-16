import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";

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
          add button, search, filter, table, pagination nanti disini.
        </CardContent>
      </Card>
    </TabsContent>
  );
}
