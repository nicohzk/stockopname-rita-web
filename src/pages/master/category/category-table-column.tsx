import { createColumnHelper } from "@tanstack/react-table";
import type { DataTableFeatures } from "@/lib/data-table-features";
import CategoryTableButton from "./category-table-btn";
import type { Category, CategoryRequest } from "@/types/category";

const columnHelper = createColumnHelper<DataTableFeatures, Category>();

export const getColumns = (onDelete: (id: number) => void, onUpdate: (id: number, data: CategoryRequest) => Promise<void>) => columnHelper.columns([
  columnHelper.accessor("id", {
    header: "Category ID",
    size: 100,
  }),
  columnHelper.accessor("name", {
    header: "Name",
    size: 100,
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
      const category = row.original;

      return (
        <CategoryTableButton category={category} onDelete={onDelete} onUpdate={onUpdate} />
      );
    },
  }),
]);
