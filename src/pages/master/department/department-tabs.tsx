import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import DepartmentTable from "./department-table";
import { departmentsDummy } from "@/data/department";
import { columns } from "./department-table-column";

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
          <DepartmentTable columns={columns} data={departmentsDummy} />
        </CardContent>
      </Card>
    </TabsContent>
  );
}
