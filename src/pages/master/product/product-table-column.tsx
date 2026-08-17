import { createColumnHelper } from "@tanstack/react-table";
import type { DataTableFeatures } from "@/types/data-table-features";
import type { Product } from "@/types/product";
import ProductTableButton from "./product-table-btn";

const columnHelper = createColumnHelper<DataTableFeatures, Product>();

export const columns = columnHelper.columns([
  columnHelper.accessor("id", {
    header: "Product ID",
  }),
  columnHelper.accessor("barcode", {
    header: "Barcode",
  }),
  columnHelper.accessor("name", {
    header: "Name",
  }),
  columnHelper.accessor("category", {
    header: "Category",
  }),
  columnHelper.accessor("department", {
    header: "Department",
  }),
  columnHelper.accessor("buyPrice", {
    header: "Buy Price",
  }),
  columnHelper.accessor("sellPrice", {
    header: "Sell Price",
  }),
  columnHelper.accessor("lastUpdate", {
    header: "Last Update",
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const product = row.original;

      return (
        <ProductTableButton product={product} />
      );
    },
  }),
]);
