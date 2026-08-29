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
            Kelola data master bagian department untuk kebutuhan stock opname.
            Tambahkan, perbarui, dan kelola data yang digunakan dalam
            pelaksanaan setiap sesi stock opname.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          <DepartmentTable columns={columns} data={departmentsDummy} />
        </CardContent>
      </Card>
    </TabsContent>
  );
}
