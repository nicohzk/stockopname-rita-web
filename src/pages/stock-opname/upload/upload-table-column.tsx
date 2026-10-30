import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createColumnHelper } from "@tanstack/react-table";
import type { DataTableFeatures } from "@/lib/data-table-features";
import type { Upload } from "@/types/upload";
import { formatDateTime } from "@/lib/format-date";

const columnHelper = createColumnHelper<DataTableFeatures, Upload>();

export const createColumns = (
  onOpenPdf: (uploadId: number) => Promise<void>,
) =>
  columnHelper.columns([
    columnHelper.accessor("uploadNumber", {
      header: "No.",
      size: 60,
    }),
    columnHelper.accessor("createdAt", {
      header: "Waktu Upload",
      size: 160,
      cell: (info) => formatDateTime(info.getValue()),
    }),
    columnHelper.accessor("rackCount", {
      header: "Jumlah Rak",
      size: 100,
    }),
    columnHelper.accessor("itemCount", {
      header: "Jumlah Item",
      size: 100,
    }),
    columnHelper.display({
      id: "actions",
      header: "Aksi",
      size: 100,
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => void onOpenPdf(row.original.uploadId)}
        >
          <FileText />
          PDF
        </Button>
      ),
    }),
  ]);
