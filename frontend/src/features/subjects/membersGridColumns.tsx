import type { DataTableColumnDef } from "@/components/layout/DataTable"
import { Button } from "@/components/ui/button"
import { userTypeLabels } from "@/lib/labels"
import type { User } from "@/types/api"

interface MembersGridColumnsOptions {
  canManage: boolean
  onRemove: (userId: number) => void
  removePending: boolean
}

export function membersGridColumns({
  canManage,
  onRemove,
  removePending,
}: MembersGridColumnsOptions): DataTableColumnDef<User>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.name} {row.original.surname}
        </span>
      ),
    },
    { accessorKey: "email", header: "Email", meta: { cellClassName: "text-muted-foreground" } },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{userTypeLabels[row.original.type]}</span>
      ),
    },
    ...(canManage
      ? [
          {
            id: "actions",
            header: "Actions",
            meta: { headerClassName: "text-right", cellClassName: "text-right" },
            cell: ({ row }) => (
              <Button
                size="sm"
                variant="destructive"
                disabled={removePending}
                onClick={() => onRemove(row.original.id)}
              >
                Delete
              </Button>
            ),
          } satisfies DataTableColumnDef<User>,
        ]
      : []),
  ]
}
