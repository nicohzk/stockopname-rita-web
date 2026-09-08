import { createColumnHelper } from "@tanstack/react-table";
import type { DataTableFeatures } from "@/lib/data-table-features";
import type { Inspector } from "@/types/inspector";

const columnHelper = createColumnHelper<DataTableFeatures, Inspector>();

export const columns = columnHelper.columns([
  columnHelper.accessor("code", {
    header: "Kode Inspektur",
    size: 150,
  }),
  columnHelper.accessor("rackAssigned", {
    header: "Rak Ditugaskan",
    size: 100,
  }),
  columnHelper.accessor("rackFinished", {
    header: "Rak Selesai",
    size: 100,
  }),
  columnHelper.accessor("totalItem", {
    header: "Total Barang",
    size: 100,
  }),
  columnHelper.display({
    id: "progress",
    header: "Progress",
    size: 210,
    cell: ({ row }) => {
      const inspector = row.original;

      const progress =
        inspector.rackAssigned > 0
          ? (inspector.rackFinished / inspector.rackAssigned) * 100
          : 0;

      return (
        <div className="flex items-center gap-2">
          <div className="h-2 w-3/5 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>

          <span className="w-10 text-right text-sm">
            {progress.toFixed(0)}%
          </span>
        </div>
      );
    },
  }),
]);
