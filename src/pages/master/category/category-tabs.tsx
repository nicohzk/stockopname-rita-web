import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import CategoryTable from "./category-table";
import {categoriesDummy} from "@/data/category";
import {columns} from "./category-table-column";

export function CategoryTabs() {
  return (
    <TabsContent value="categories">
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            Manage your product categories and organize your inventory.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <CategoryTable columns={columns} data={categoriesDummy} />
        </CardContent>
      </Card>
    </TabsContent>
  );
}
