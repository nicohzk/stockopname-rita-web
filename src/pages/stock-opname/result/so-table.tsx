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
  type RowData,
} from "@tanstack/react-table";
import { features, type DataTableFeatures } from "@/lib/data-table-features";
import { Input } from "@/components/ui/input";

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
}: DataTableProps<TData>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useTable({
    features,
    data,
    columns,
    onColumnFiltersChange: setColumnFilters,
    state: {
      columnFilters,
    },
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 6,
      },
    },
  });

  return (
    <div className="relative">
      <div className="flex items-center justify-between pb-2">
        <Input
          placeholder="Search barang..."
          value={onSearch ? searchValue : (table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => onSearch ? onSearch(event.target.value) : table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        {addButton}
      </div>
      <div className="overflow-hidden rounded-md border">
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
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {loading ? <div className="absolute inset-0 top-12 z-10 bg-background/60" aria-label="Loading stock opname results" /> : null}
      <div className="flex items-center justify-end space-x-2 pt-4">
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
