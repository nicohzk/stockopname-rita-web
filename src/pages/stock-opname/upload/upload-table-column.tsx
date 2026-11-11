import { createColumnHelper } from "@tanstack/react-table";
import type { DataTableFeatures } from "@/lib/data-table-features";
import type { Upload } from "@/types/upload";
import { formatDateTime } from "@/lib/format-date";
import UploadPdfMenu from "./upload-pdf-menu";

const columnHelper = createColumnHelper<DataTableFeatures, Upload>();

export const createColumns = (
  onOpenPdf: (uploadId: number, includeCarton: boolean) => Promise<void>,
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
      size: 120,
      cell: ({ row }) => (
        <UploadPdfMenu uploadId={row.original.uploadId} onOpen={onOpenPdf} />
      ),
    }),
  ]);
