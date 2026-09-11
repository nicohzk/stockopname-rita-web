import { createColumnHelper } from "@tanstack/react-table";
import type { DataTableFeatures } from "@/lib/data-table-features";
import type { Session } from "@/types/session";
import { SessionActionButton } from "./session-action-btn";
import { formatDateTime } from "@/lib/format-date";
import { StatusBadge } from "@/components/ui/status-badge";

const columnHelper = createColumnHelper<DataTableFeatures, Session>();

export const columns = columnHelper.columns([
  columnHelper.accessor("code", {
    header: "Kode Sesi",
    size: 170,
  }),
  columnHelper.accessor("location", {
    header: "Lokasi",
    size: 200,
  }),
  columnHelper.accessor("status", {
    header: "Status",
    size: 150,
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
  columnHelper.accessor("startedAt", {
    header: "Mulai",
    size: 180,
    cell: (info) => formatDateTime(info.getValue() ?? null),
  }),
  columnHelper.accessor("endedAt", {
    header: "Selesai",
    size: 180,
    cell: (info) => formatDateTime(info.getValue() ?? null),
  }),
  columnHelper.display({
    id: "actions",
    header: "Aksi",
    size: 100,
    cell: ({ row }) => {
      const session = row.original;

      return (
        <div className="flex">
          <SessionActionButton session={session} />
        </div>
      );
    },
  }),
]);
