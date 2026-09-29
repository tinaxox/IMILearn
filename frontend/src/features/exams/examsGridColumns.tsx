import type { DataTableColumnDef } from "@/components/layout/DataTable"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { examTypeLabels } from "@/lib/labels"
import { formatDateTime } from "@/lib/utils"
import type { Exam, StudentExamGrade, UserType } from "@/types/api"

interface ExamsGridColumnsOptions {
  isAllExamsPage: boolean
  canManageExams: boolean
  userType: UserType | undefined
  studentGradesLoading: boolean
  studentGradesByExam: Map<number, StudentExamGrade>
  onViewGrading: (exam: Exam) => void
  onEdit: (exam: Exam) => void
  onDelete: (exam: Exam) => void
}

export function examsGridColumns({
  isAllExamsPage,
  canManageExams,
  userType,
  studentGradesLoading,
  studentGradesByExam,
  onViewGrading,
  onEdit,
  onDelete,
}: ExamsGridColumnsOptions): DataTableColumnDef<Exam>[] {
  return [
    { accessorKey: "name", header: "Name", meta: { cellClassName: "font-medium" } },
    ...(isAllExamsPage
      ? [
          {
            accessorKey: "subjectName",
            header: "Subject",
            meta: { cellClassName: "text-muted-foreground" },
          } satisfies DataTableColumnDef<Exam>,
        ]
      : []),
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) =>
        row.original.type && row.original.type !== "OTHER" ? (
          <span className={row.original.type === "FINAL" ? "text-destructive" : "text-amber-600"}>
            {examTypeLabels[row.original.type]}
          </span>
        ) : (
          "-"
        ),
    },
    {
      id: "points",
      header: "Points",
      cell: ({ row }) =>
        canManageExams ? (
          new Date(row.original.date).getTime() <= Date.now() &&
          row.original.maxPoints != null &&
          row.original.maxPoints > 0 ? (
            <Button variant="outline" size="sm" onClick={() => onViewGrading(row.original)}>
              View {row.original.type === "FINAL" ? "results" : "points"}
            </Button>
          ) : (
            "-"
          )
        ) : userType === "STUDENT" ? (
          studentGradesLoading ? (
            <Skeleton className="h-5 w-12" />
          ) : (
            (studentGradesByExam.get(row.original.id)?.points ?? "-")
          )
        ) : (
          "-"
        ),
    },
    {
      accessorKey: "maxPoints",
      header: "Max",
      meta: { headerClassName: "w-16", cellClassName: "w-16" },
      cell: ({ row }) =>
        canManageExams ? (
          row.original.maxPoints != null && row.original.maxPoints > 0 ? (
            row.original.maxPoints
          ) : (
            "-"
          )
        ) : userType === "STUDENT" ? (
          row.original.maxPoints == null || row.original.maxPoints <= 0 ? (
            "-"
          ) : (
            row.original.maxPoints
          )
        ) : (
          "-"
        ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <span
          className={
            new Date(row.original.date).getTime() >= Date.now() ? "text-primary" : undefined
          }
        >
          {formatDateTime(row.original.date)}
        </span>
      ),
    },
    ...(canManageExams
      ? [
          {
            id: "actions",
            header: "Actions",
            meta: { headerClassName: "text-right", cellClassName: "text-right" },
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
          } satisfies DataTableColumnDef<Exam>,
        ]
      : []),
  ]
}
