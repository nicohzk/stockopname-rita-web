import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";

export function CategoriesTabs() {
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
          add button, search, filter, table, pagination nanti disini.
        </CardContent>
      </Card>
    </TabsContent>
  );
}
