import type { DataTableColumnDef } from "@/components/layout/DataTable"
import { Button } from "@/components/ui/button"
import { userTypeLabels } from "@/lib/labels"
import type { User, UserType } from "@/types/api"

function typeTextClass(type: UserType): string {
  if (type === "ADMIN") return "text-primary"
  if (type === "PROFESSOR") return "text-emerald-700"
  return "text-amber-700"
}

interface UsersGridColumnsOptions {
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

export function usersGridColumns({ onEdit, onDelete }: UsersGridColumnsOptions): DataTableColumnDef<User>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">
            {row.original.name} {row.original.surname}
          </span>
          <span className="text-xs text-muted-foreground">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className={typeTextClass(row.original.type)}>{userTypeLabels[row.original.type]}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "Actions",
      meta: { headerClassName: "text-right" },
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(row.original)}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(row.original)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]
}
