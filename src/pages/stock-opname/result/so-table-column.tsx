import { createColumnHelper } from "@tanstack/react-table";
import type { DataTableFeatures } from "@/lib/data-table-features";
import type { StockOpname } from "@/types/stock-opname";
import StockOpnameTableButton from "./so-table-btn";

const columnHelper = createColumnHelper<DataTableFeatures, StockOpname>();

export const columns = columnHelper.columns([
  columnHelper.accessor("barcode", {
    header: "Barcode",
    size: 90,
  }),
  columnHelper.accessor("name", {
    header: "Nama Barang",
    size: 160,
  }),
  columnHelper.accessor("quantity", {
    header: "Jumlah",
    size: 50,
  }),
  columnHelper.accessor("updatedAt", {
    header: "Tanggal Update",
    size: 130,
  }),
  columnHelper.accessor("rackName", {
    header: "Rak",
    size: 80    ,
  }),
  columnHelper.accessor("inspector", {
    header: "Inspektur",
    size: 80,
  }),
  columnHelper.accessor("coordinator", {
    header: "Koordinator",
    size: 80,
  }),
  columnHelper.display({
    id: "actions",
    header: "Aksi",
    size: 60,
    cell: ({ row }) => {
      return (
        <div className="flex">
          <StockOpnameTableButton product={row.original} />
        </div>
      );
    },
  }),
]);
