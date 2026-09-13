import { createColumnHelper } from "@tanstack/react-table";
import type { DataTableFeatures } from "@/lib/data-table-features";
import DepartmentTableButton from "./department-table-btn";
import type { Department, DepartmentRequest } from "@/types/department";
import { TruncatedText } from "@/components/ui/table";

const columnHelper = createColumnHelper<DataTableFeatures, Department>();

export const getColumns = (onDelete: (id: number) => void, onUpdate: (id: number, data: DepartmentRequest) => Promise<void>) => columnHelper.columns([
  columnHelper.accessor("id", {
    header: "Department ID",
    size: 100,
  }),
  columnHelper.accessor("code", {
    header: "Code",
    size: 100,
  }),
  columnHelper.accessor("name", {
    header: "Name",
    size: 200,
    cell: (info) => <TruncatedText>{info.getValue()}</TruncatedText>,
  }),
  columnHelper.accessor("description", {
    header: "Description",
    size: 300,
    cell: (info) => <TruncatedText>{info.getValue()}</TruncatedText>,
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    size: 60,
    cell: ({ row }) => {
      const department = row.original;

      return (
        <DepartmentTableButton department={department} onDelete={onDelete} onUpdate={onUpdate} />
      );
    },
  }),
]);
