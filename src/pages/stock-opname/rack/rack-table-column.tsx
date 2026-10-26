import { createColumnHelper } from "@tanstack/react-table";
import type { DataTableFeatures } from "@/lib/data-table-features";
import type { Rack } from "@/types/rack";
import { TruncatedText } from "@/components/ui/table";
import RackTableButton from "./rack-table-btn";

const columnHelper = createColumnHelper<DataTableFeatures, Rack>();

export const createColumns = (
  onDelete: (rakId: number) => Promise<void>,
  readOnly = false,
) =>
  columnHelper.columns([
    columnHelper.accessor("name", {
      header: "Rak",
      size: 160,
      cell: (info) => <TruncatedText>{info.getValue()}</TruncatedText>,
    }),
    columnHelper.display({
      id: "status",
      header: "Status",
      size: 120,
      cell: ({ row }) => (row.original.uploadedAt ? "Terupload" : "Belum"),
    }),
    columnHelper.display({
      id: "actions",
      header: "Aksi",
      size: 100,
      cell: ({ row }) => {
        if (readOnly) return null;
        return <RackTableButton item={row.original} onDelete={onDelete} />;
      },
    }),
  ]);
