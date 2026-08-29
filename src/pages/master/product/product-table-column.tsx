import { createColumnHelper } from "@tanstack/react-table";
import type { DataTableFeatures } from "@/lib/data-table-features";
import type { Product } from "@/types/product";
import ProductTableButton from "./product-table-btn";

const columnHelper = createColumnHelper<DataTableFeatures, Product>();

export const columns = columnHelper.columns([
  columnHelper.accessor("id", {
    header: "Product ID",
    size: 90,
  }),
  columnHelper.accessor("barcode", {
    header: "Barcode",
    size: 130,
  }),
  columnHelper.accessor("name", {
    header: "Name",
    size: 300,
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
    size: 100,
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    size: 60,
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex justify-center">
          <ProductTableButton product={product}/>
        </div>
      );
    },
  }),
]);
