import { createColumnHelper } from "@tanstack/react-table";
import type { DataTableFeatures } from "@/lib/data-table-features";
import type { Coordinator } from "@/types/coordinator";
import { StatusBadge } from "@/components/ui/status-badge";
import { TruncatedText } from "@/components/ui/table";
import { formatRackRange } from "@/lib/rack-range";
import type { Rack } from "@/types/rack";
import CoordinatorDetailButton from "./coordinator-detail-button";

const columnHelper = createColumnHelper<DataTableFeatures, Coordinator>();

export const createColumns = (sessionId: string, racks: Rack[]) => {
  return columnHelper.columns([
  columnHelper.accessor("code", {
    header: "Kode Koordinator",
    size: 150,
    cell: (info) => <TruncatedText>{info.getValue()}</TruncatedText>,
  }),
  columnHelper.display({
    id: "rackRange",
    header: "Rak Ditugaskan",
    size: 180,
    cell: ({ row }) => (
      <TruncatedText>
        {formatRackRange(racks.filter((rack) => rack.coordinatorId === row.original.id))}
      </TruncatedText>
    ),
  }),
  columnHelper.accessor("rackFinished", {
    header: "Rak Selesai",
    size: 100,
  }),
  columnHelper.display({
    id: "progress",
    header: "Progress",
    size: 210,
    cell: ({ row }) => {
      const coordinator = row.original;

      const progress =
        coordinator.rackAssigned > 0
          ? (coordinator.rackFinished / coordinator.rackAssigned) * 100
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
  columnHelper.accessor("status", {
    header: "Status",
    size: 120,
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
  columnHelper.display({
    id: "actions",
    header: "Aksi",
    size: 80,
    cell: ({ row }) => {
      const coordinator = row.original;
      return (
        <div className="flex">
          <CoordinatorDetailButton sessionId={sessionId} coordinatorId={coordinator.id} />
        </div>
      );
    },
  }),
  ]);
};
