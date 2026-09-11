import { createColumnHelper } from "@tanstack/react-table";
import type { DataTableFeatures } from "@/lib/data-table-features";
import type { Product } from "@/types/product";
import type { UpdateProductRequest } from "@/types/product";
import type { Category } from "@/types/category";
import type { Department } from "@/types/department";
import ProductTableButton from "./product-table-btn";
import { formatDateTime } from "@/lib/format-date";

const columnHelper = createColumnHelper<DataTableFeatures, Product>();

export const getColumns = (onDelete: (id: number) => void, onUpdate: (id: number, data: UpdateProductRequest) => Promise<void>, categories: Category[], departments: Department[]) => columnHelper.columns([
  columnHelper.accessor("id", {
    header: "ID",
    size: 40,
  }),
  columnHelper.accessor("barcode", {
    header: "Barcode",
    size: 130,
  }),
  columnHelper.accessor("name", {
    header: "Name",
    size: 250,
  }),
  columnHelper.accessor("category", {
    header: "Category",
    size: 130,
  }),
  columnHelper.accessor("department", {
    header: "Department",
    size: 130,
  }),
  columnHelper.accessor("buyPrice", {
    header: "Buy Price",
    size: 100,
  }),
  columnHelper.accessor("sellPrice", {
    header: "Sell Price",
    size: 100,
  }),
  columnHelper.accessor("lastUpdate", {
    header: "Last Update",
    size: 130,
    cell: (info) => formatDateTime(info.getValue()),
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    size: 60,
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex justify-center">
          <ProductTableButton product={product} categories={categories} departments={departments} onDelete={onDelete} onUpdate={onUpdate}/>
        </div>
      );
    },
  }),
]);
