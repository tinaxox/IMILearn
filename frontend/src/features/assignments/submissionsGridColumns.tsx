import type { DataTableColumnDef } from "@/components/layout/DataTable"
import { Button } from "@/components/ui/button"
import type { AssignmentSubmission } from "@/types/api"

interface SubmissionsGridColumnsOptions {
  onView: (submission: AssignmentSubmission) => void
}

export function submissionsGridColumns({
  onView,
}: SubmissionsGridColumnsOptions): DataTableColumnDef<AssignmentSubmission>[] {
  return [
    {
      id: "student",
      header: "Student",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">
            {row.original.studentName} {row.original.studentSurname}
          </span>
          <span className="text-xs text-muted-foreground">
            {row.original.files.length} file{row.original.files.length === 1 ? "" : "s"}
          </span>
        </div>
      ),
    },
    {
      id: "submission",
      header: "Submission",
      cell: ({ row }) => (
        <Button type="button" variant="outline" size="sm" onClick={() => onView(row.original)}>
          View submission
        </Button>
      ),
    },
    {
      accessorKey: "points",
      header: "Points",
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
      cell: ({ row }) => row.original.points ?? "-",
    },
  ]
}
