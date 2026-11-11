import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorState, Notice, RetryButton } from "@/components/ui/notice";
import type { StockOpname } from "@/types/stock-opname";
import type { useResultTable } from "../hooks/use-result-table";
import { StockOpnameTable } from "./so-table";
import { createColumns as createResultColumns } from "./so-table-column";
import ResultSelectionBar from "./result-selection-bar";

type ResultTable = ReturnType<typeof useResultTable>;

type ResultCardProps = {
  table: ResultTable;
  /**
   * Aturan read-only: halaman sesi menghitung per koordinator lewat fungsi,
   * halaman koordinator memakai satu status untuk semua baris.
   */
  isRowReadOnly: boolean | ((item: StockOpname) => boolean);
  /** Filter khas halaman: sesi punya filter koordinator, koordinator tidak. */
  filters: ReactNode;
  /** Tombol tambah item yang sudah dikonfigurasi halaman. */
  addButton: ReactNode;
};

/** Kartu hasil stock opname: pencarian, filter, seleksi, tabel, dan paginasi. */
export default function ResultCard({
  table,
  isRowReadOnly,
  filters,
  addButton,
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
          filtered={table.filterActive}
          count={table.selectionMode === "filter" ? table.totalItems : table.selectedCount}
          onFactor={table.selectionMode === "filter" ? table.openBulkFactor : table.openSelectedFactor}
          onMove={table.openSelectedMove}
          moveDisabledReason={
            table.selectionMode === "filter"
              ? "Mode filter bisa mencakup banyak rak. Pindahkan hanya tersedia untuk pilihan manual dari satu rak."
              : table.moveDisabledReason
          }
          onClear={table.clearSelection}
        />
        {table.failed && table.results.length === 0 ? (
          <ErrorState
            message="Daftar hasil gagal dimuat."
            onRetry={table.reload}
            retrying={table.loading}
          />
        ) : (
          <>
            {table.failed ? (
              <Notice
                message="Gagal memperbarui daftar hasil. Menampilkan data terakhir yang berhasil dimuat."
                action={<RetryButton onRetry={table.reload} retrying={table.loading} />}
              />
            ) : null}
            <StockOpnameTable
              columns={createResultColumns(
                table.handleResultUpdate,
                table.handleResultDelete,
                table.handleMoveRequest,
                isRowReadOnly,
                table.openItemFactor,
              )}
              data={table.results}
              selectable
              rowSelection={table.rowSelection}
              onRowSelectionChange={table.handleRowSelectionChange}
              getRowId={(item) => String(item.id)}
              filters={filters}
              addButton={addButton}
              onSearch={table.setSearchInput}
              searchValue={table.searchInput}
              loading={table.loading}
              page={table.page}
              totalPages={table.totalPages}
              onPageChange={table.handlePageChange}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
