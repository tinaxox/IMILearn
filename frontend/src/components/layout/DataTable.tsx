import { tableFeatures, useTable, type CellContext, type ColumnDef, type RowData, type TableMeta } from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface DataTableColumnMeta {
  headerClassName?: string
  cellClassName?: string
}

const dataTableFeatures = tableFeatures({
  columnMeta: {} as DataTableColumnMeta,
})

export type DataTableColumnDef<TData extends RowData> = ColumnDef<typeof dataTableFeatures, TData>
export type DataTableCellContext<TData extends RowData> = CellContext<typeof dataTableFeatures, TData>

export interface DataTableProps<TData extends RowData, TMeta = unknown> {
  columns: DataTableColumnDef<TData>[]
  data: TData[]
  containerClassName?: string
  getRowClassName?: (row: TData) => string | undefined
  /** Arbitrary shared data/callbacks, readable in any cell via `context.table.options.meta`. Use this instead of closing over component state in a `cell` renderer, since that would give the renderer a new identity every render and reset input focus. */
  meta?: TMeta
}

export function DataTable<TData extends RowData, TMeta = unknown>({
  columns,
  data,
  containerClassName,
  getRowClassName,
  meta,
}: DataTableProps<TData, TMeta>) {
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    meta: meta as TableMeta<typeof dataTableFeatures, TData> | undefined,
  })

  return (
    <Table containerClassName={containerClassName}>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id} className={header.column.columnDef.meta?.headerClassName}>
                {header.isPlaceholder ? null : <table.FlexRender header={header} />}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id} className={getRowClassName?.(row.original)}>
            {row.getAllCells().map((cell) => (
              <TableCell key={cell.id} className={cell.column.columnDef.meta?.cellClassName}>
                <table.FlexRender cell={cell} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
