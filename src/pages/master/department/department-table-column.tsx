import { createColumnHelper } from "@tanstack/react-table";
import type { DataTableFeatures } from "@/lib/data-table-features";
import DepartmentTableButton from "./department-table-btn";
import type { Department } from "@/types/department";

const columnHelper = createColumnHelper<DataTableFeatures, Department>();

export const columns = columnHelper.columns([
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
  }),
  columnHelper.accessor("description", {
    header: "Description",
    size: 300,
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    size: 60,
    cell: ({ row }) => {
      const department = row.original;

      return (
        <DepartmentTableButton department={department} />
      );
    },
  }),
]);
