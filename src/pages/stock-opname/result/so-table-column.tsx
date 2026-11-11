import { createColumnHelper } from "@tanstack/react-table";
import type { DataTableFeatures } from "@/lib/data-table-features";
import type { StockOpname } from "@/types/stock-opname";
import StockOpnameTableButton from "./so-table-btn";
import type { StockOpnameUpdateRequest } from "@/types/stock-opname";
import { formatDateTime } from "@/lib/format-date";
import { TruncatedText } from "@/components/ui/table";

const columnHelper = createColumnHelper<DataTableFeatures, StockOpname>();

const quantityFormatter = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 });

export const createColumns = (onUpdate: (id: number, data: StockOpnameUpdateRequest) => Promise<void>, onDelete: (id: number) => Promise<void>, onMove?: (item: StockOpname) => void, readOnly: boolean | ((item: StockOpname) => boolean) = false, onFactor?: (item: StockOpname) => void) => columnHelper.columns([
  columnHelper.accessor("barcode", {
    header: "Barcode",
    size: 90,
    cell: (info) => <TruncatedText>{info.getValue()}</TruncatedText>,
  }),
  columnHelper.accessor("plu", {
    header: "PLU",
    size: 70,
    cell: (info) => <TruncatedText>{info.getValue()}</TruncatedText>,
  }),
  columnHelper.accessor("name", {
    header: "Nama Barang",
    size: 220,
    cell: (info) => <TruncatedText>{info.getValue()}</TruncatedText>,
  }),
  columnHelper.accessor("effectiveQuantity", {
    header: "Jumlah",
    size: 64,
    cell: (info) => <span className="tabular-nums">{quantityFormatter.format(info.getValue())}</span>,
  }),
  columnHelper.accessor("rackName", {
    header: "Rak",
    size: 80,
  }),
  columnHelper.accessor("coordinator", {
    header: "Koordinator",
    size: 90,
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
      const isReadOnly = typeof readOnly === "function" ? readOnly(row.original) : readOnly;
      if (isReadOnly && !onFactor) return null;
      return (
        <div className="flex">
          <StockOpnameTableButton
            item={row.original}
            onUpdate={(id, quantity) => onUpdate(id, { quantity })}
            onDelete={onDelete}
            onMove={onMove}
            onFactor={onFactor}
            readOnly={isReadOnly}
          />
        </div>
      );
    },
  }),
]);
