import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";

export default function DepartmentsTabs() {
  return (
    <TabsContent value="departments">
      <Card>
        <CardHeader>
          <CardTitle>Departments</CardTitle>
          <CardDescription>
            Manage your departments and organize your team.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          add button, search, filter, table, pagination nanti disini.
        </CardContent>
      </Card>
    </TabsContent>
  );
}
