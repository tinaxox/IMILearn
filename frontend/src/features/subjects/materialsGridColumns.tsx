import type { DataTableColumnDef } from "@/components/layout/DataTable"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import { materialCategoryLabels } from "@/lib/labels"
import type { Material } from "@/types/api"
import { MaterialDownload } from "@/features/subjects/MaterialDownload"

function isUrl(path: string): boolean {
  return /^https?:\/\//i.test(path)
}

interface MaterialsGridColumnsOptions {
  canManage: boolean
  onEdit: (material: Material) => void
  onDelete: (material: Material) => void
}

export function materialsGridColumns({
  canManage,
  onEdit,
  onDelete,
}: MaterialsGridColumnsOptions): DataTableColumnDef<Material>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Type",
      cell: ({ row }) =>
        row.original.category && row.original.category !== "OTHER" ? (
          <span className="text-muted-foreground">
            {materialCategoryLabels[row.original.category]}
          </span>
        ) : (
          "-"
        ),
    },
    {
      accessorKey: "path",
      header: "File",
      meta: { cellClassName: "max-w-xs truncate" },
      cell: ({ row }) =>
        isUrl(row.original.path) ? (
          <a
            className="text-primary underline"
            href={row.original.path}
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              void apiClient.get(`/materials/${row.original.id}`)
            }}
          >
            {row.original.path}
          </a>
        ) : (
          <MaterialDownload material={row.original} />
        ),
    },
    ...(canManage
      ? [
          {
            id: "actions",
            header: "Actions",
            meta: { headerClassName: "text-right", cellClassName: "text-right" },
            cell: ({ row }) => (
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(row.original)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onDelete(row.original)}>
                  Delete
                </Button>
              </div>
            ),
          } satisfies DataTableColumnDef<Material>,
        ]
      : []),
  ]
}
