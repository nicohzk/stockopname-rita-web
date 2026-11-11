import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorState } from "@/components/ui/notice";
import type { StockOpname } from "@/types/stock-opname";
import type { useResultTable } from "../hooks/use-result-table";
import { StockOpnameTable } from "./so-table";
import { createColumns as createResultColumns } from "./so-table-column";
import ResultSelectionBar from "./result-selection-bar";

type ResultTable = ReturnType<typeof useResultTable>;

type ResultCardProps = {
  table: ResultTable;
  results: StockOpname[];
  totalItems: number;
  filterActive: boolean;
  resultsFailed: boolean;
  loading: boolean;
  onRetry: () => void;
  /**
   * Aturan read-only: halaman sesi menghitung per koordinator lewat fungsi,
   * halaman koordinator memakai satu status untuk semua baris.
   */
  isRowReadOnly: boolean | ((item: StockOpname) => boolean);
  /** Filter khas halaman: sesi punya filter koordinator, koordinator tidak. */
  filters: ReactNode;
  /** Tombol tambah item yang sudah dikonfigurasi halaman. */
  addButton: ReactNode;
  searchValue: string;
  onSearch: (value: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

/** Kartu hasil stock opname: pencarian, filter, seleksi, tabel, dan paginasi. */
export default function ResultCard({
  table,
  results,
  totalItems,
  filterActive,
  resultsFailed,
  loading,
  onRetry,
  isRowReadOnly,
  filters,
  addButton,
  searchValue,
  onSearch,
  page,
  totalPages,
  onPageChange,
}: ResultCardProps) {
  return (
    <Card className="my-5" id="stock-opname-results">
      <CardHeader>
        <CardTitle>Data Barang Stock Opname</CardTitle>
        <CardDescription>Data terkini hasil koreksi admin</CardDescription>
      </CardHeader>
      <CardContent>
        <ResultSelectionBar
          mode={table.selectionMode}
          filtered={filterActive}
          count={table.selectionMode === "filter" ? totalItems : table.selectedCount}
          onFactor={table.selectionMode === "filter" ? table.openBulkFactor : table.openSelectedFactor}
          onMove={table.openSelectedMove}
          moveDisabledReason={
            table.selectionMode === "filter"
              ? "Mode filter bisa mencakup banyak rak. Pindahkan hanya tersedia untuk pilihan manual dari satu rak."
              : table.moveDisabledReason
          }
          onClear={table.clearSelection}
        />
        {resultsFailed && results.length === 0 ? (
          <ErrorState
            message="Daftar hasil gagal dimuat."
            onRetry={onRetry}
            retrying={loading}
          />
        ) : (
          <StockOpnameTable
            columns={createResultColumns(
              table.handleResultUpdate,
              table.handleResultDelete,
              table.handleMoveRequest,
              isRowReadOnly,
              table.openItemFactor,
            )}
            data={results}
            selectable
            rowSelection={table.rowSelection}
            onRowSelectionChange={table.handleRowSelectionChange}
            getRowId={(item) => String(item.id)}
            filters={filters}
            addButton={addButton}
            onSearch={onSearch}
            searchValue={searchValue}
            loading={loading}
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </CardContent>
    </Card>
  );
}
