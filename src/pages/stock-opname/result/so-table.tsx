import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useTable,
  type ColumnFiltersState,
  type ColumnDef,
  type OnChangeFn,
  type RowData,
  type RowSelectionState,
} from "@tanstack/react-table";
import { features, type DataTableFeatures } from "@/lib/data-table-features";
import { Input } from "@/components/ui/input";
import { LoadingOverlay } from "@/components/ui/loading";

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[];
  data: TData[];
  onSearch?: (value: string) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  searchValue?: string;
  loading?: boolean;
  addButton?: ReactNode;
  filters?: ReactNode;
  selectable?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  getRowId?: (row: TData) => string;
}

export function StockOpnameTable<TData extends RowData>({
  columns,
  data,
  onSearch,
  page,
  totalPages,
  onPageChange,
  searchValue = "",
  loading = false,
  addButton,
  filters,
  selectable = false,
  rowSelection,
  onRowSelectionChange,
  getRowId,
}: DataTableProps<TData>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const selectionColumn: ColumnDef<DataTableFeatures, TData> = {
    id: "__select",
    header: ({ table }) => (
      <input
        type="checkbox"
        aria-label="Pilih semua item di halaman ini"
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        aria-label={`Pilih item ${row.id}`}
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
    size: 36,
    enableSorting: false,
    enableHiding: false,
  };

  const tableColumns = selectable ? [selectionColumn, ...columns] : columns;

  const table = useTable({
    features,
    data,
    columns: tableColumns,
    onColumnFiltersChange: setColumnFilters,
    ...(selectable
      ? {
          enableRowSelection: true,
          getRowId: (row: TData) => getRowId?.(row) ?? String((row as { id?: number }).id ?? ""),
          state: { columnFilters, rowSelection: rowSelection ?? {} },
          onRowSelectionChange,
        }
      : {
          state: { columnFilters },
        }),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 6,
      },
    },
  });

  return (
    <div className="relative">
      <div className="flex flex-col gap-2 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            placeholder="Cari barang..."
            value={onSearch ? searchValue : (table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) => onSearch ? onSearch(event.target.value) : table.getColumn("name")?.setFilterValue(event.target.value)}
            className="w-full sm:max-w-sm"
          />
          {filters}
        </div>
        {addButton}
      </div>
      <div className="relative overflow-hidden rounded-lg border">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: `${header.getSize()}px` }}
                    >
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{ width: `${cell.column.getSize()}px` }}
                    >
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center"
                >
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {loading ? <LoadingOverlay message="Memuat data..." /> : null}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2 pt-4">
        <div className="text-muted-foreground text-sm">
          Page {page ?? table.state.pagination.pageIndex + 1} of {totalPages ?? table.getPageCount()}
        </div>
        <Button
          variant="outline"
          size="sm"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onPageChange ? onPageChange(Math.max(1, (page ?? 1) - 1)) : table.previousPage()}
          disabled={onPageChange ? (page ?? 1) <= 1 : !table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onPageChange ? onPageChange(Math.min(totalPages ?? 1, (page ?? 1) + 1)) : table.nextPage()}
          disabled={onPageChange ? (page ?? 1) >= (totalPages ?? 1) : !table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
