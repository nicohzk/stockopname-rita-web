import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import DepartmentTable from "./department-table";
import { useEffect, useState } from "react";
import type { DepartmentRequest } from "@/types/department";
import { createDepartment, deleteDepartment, getDepartments, updateDepartment } from "@/services/department.service";
import { getColumns } from "./department-table-column";
import DepartmentAddButton from "./department-add-btn";
import { useToast } from "@/components/ui/toast";

export default function DepartmentsTabs({ isActive }: { isActive: boolean }) {
  const [departments, setDepartments] = useState<Awaited<ReturnType<typeof getDepartments>>>([]);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const loadDepartments = async () => { setLoading(true); try { setError(undefined); setDepartments(await getDepartments()); } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Failed to load departments."); } finally { setLoading(false); } };
  useEffect(() => {
    if (isActive) void loadDepartments();
  }, [isActive]);
  const handleCreate = async (data: DepartmentRequest) => {
    try { await createDepartment(data); await loadDepartments(); showToast("Department added successfully."); }
    catch (mutationError) { showToast(mutationError instanceof Error ? mutationError.message : "Failed to add department.", "error"); throw mutationError; }
  };
  const handleDelete = async (id: number) => {
    try { await deleteDepartment(id); await loadDepartments(); showToast("Department deleted successfully."); }
    catch (mutationError) { showToast(mutationError instanceof Error ? mutationError.message : "Failed to delete department.", "error"); }
  };
  const handleUpdate = async (id: number, data: DepartmentRequest) => {
    try { await updateDepartment(id, data); await loadDepartments(); showToast("Department updated successfully."); }
    catch (mutationError) { showToast(mutationError instanceof Error ? mutationError.message : "Failed to update department.", "error"); throw mutationError; }
  };
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
          {loading ? <p>Loading departments...</p> : <DepartmentTable columns={getColumns(handleDelete, handleUpdate)} data={departments} addButton={<DepartmentAddButton onSubmit={handleCreate} />} error={error} />}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
