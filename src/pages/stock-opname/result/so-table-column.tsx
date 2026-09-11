import { createColumnHelper } from "@tanstack/react-table";
import type { DataTableFeatures } from "@/lib/data-table-features";
import type { StockOpname } from "@/types/stock-opname";
import StockOpnameTableButton from "./so-table-btn";
import type { StockOpnameUpdateRequest } from "@/types/stock-opname";
import { formatDateTime } from "@/lib/format-date";

const columnHelper = createColumnHelper<DataTableFeatures, StockOpname>();

export const createColumns = (onUpdate: (id: number, data: StockOpnameUpdateRequest) => Promise<void>, onDelete: (id: number) => Promise<void>) => columnHelper.columns([
  columnHelper.accessor("barcode", {
    header: "Barcode",
    size: 90,
  }),
  columnHelper.accessor("name", {
    header: "Nama Barang",
    size: 150,
  }),
  columnHelper.accessor("quantity", {
    header: "Jumlah",
    size: 80,
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
  columnHelper.accessor("updatedAt", {
    header: "Tanggal Update",
    size: 130,
    cell: (info) => formatDateTime(info.getValue()),
  }),
  columnHelper.display({
    id: "actions",
    header: "Aksi",
    size: 60,
    cell: ({ row }) => {
      return (
        <div className="flex">
          <StockOpnameTableButton item={row.original} onUpdate={(id, quantity) => onUpdate(id, { quantity })} onDelete={onDelete} />
        </div>
      );
    },
  }),
]);
