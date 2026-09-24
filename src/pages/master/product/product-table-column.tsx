import { createColumnHelper } from "@tanstack/react-table";
import type { DataTableFeatures } from "@/lib/data-table-features";
import type { Product } from "@/types/product";
import type { UpdateProductRequest } from "@/types/product";
import ProductTableButton from "./product-table-btn";
import { formatDateTime } from "@/lib/format-date";
import { TruncatedText } from "@/components/ui/table";

const columnHelper = createColumnHelper<DataTableFeatures, Product>();

export const getColumns = (onDelete: (id: number) => void, onUpdate: (id: number, data: UpdateProductRequest) => Promise<void>) => columnHelper.columns([
  columnHelper.accessor("id", { header: "ID", size: 60 }),
  columnHelper.accessor("plu", {
    header: "PLU",
    size: 110,
    cell: (info) => <TruncatedText>{info.getValue()}</TruncatedText>,
  }),
  columnHelper.accessor("barcode", {
    header: "Barcode Utama",
    size: 130,
    cell: (info) => <TruncatedText>{info.getValue() || "-"}</TruncatedText>,
  }),
  columnHelper.accessor("name", {
    header: "Name",
    size: 200,
    cell: (info) => <TruncatedText>{info.getValue()}</TruncatedText>,
  }),
  columnHelper.accessor("department", {
    header: "Dept",
    size: 90,
    cell: (info) => <TruncatedText>{info.getValue()}</TruncatedText>,
  }),
  columnHelper.accessor("buyPrice", { header: "Buy Price", size: 100 }),
  columnHelper.accessor("sellPrice", { header: "Sell Price", size: 100 }),
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
          <ProductTableButton product={product} onDelete={onDelete} onUpdate={onUpdate}/>
        </div>
      );
    },
  }),
]);
