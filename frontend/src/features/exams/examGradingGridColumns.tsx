import type { Dispatch, SetStateAction } from "react"
import type { DataTableCellContext, DataTableColumnDef } from "@/components/layout/DataTable"
import { Input } from "@/components/ui/input"
import type { ExamGrade } from "@/types/api"

export interface GradingMeta {
  gradeDrafts: Record<number, string>
  finalPointDrafts: Record<number, string>
  setGradeDrafts: Dispatch<SetStateAction<Record<number, string>>>
  setFinalPointDrafts: Dispatch<SetStateAction<Record<number, string>>>
  isFinal: boolean
  maxPoints: number | null | undefined
}

function IndexYearCell({ row }: DataTableCellContext<ExamGrade>) {
  return (
    <>
      {row.original.studentIndex || "-"} / {row.original.studentYear ?? "-"}
    </>
  )
}

function PointsCell({ row, table }: DataTableCellContext<ExamGrade>) {
  const { gradeDrafts, finalPointDrafts, setGradeDrafts, setFinalPointDrafts, isFinal, maxPoints } =
    table.options.meta as unknown as GradingMeta
  const studentId = row.original.studentId
  const drafts = isFinal ? finalPointDrafts : gradeDrafts
  const setDrafts = isFinal ? setFinalPointDrafts : setGradeDrafts
  return (
    <Input
      type="number"
      min={0}
      max={maxPoints ?? undefined}
      step={0.5}
      value={drafts[studentId] ?? ""}
      onChange={(event) =>
        setDrafts((current) => ({ ...current, [studentId]: event.target.value }))
      }
      placeholder="Enter points"
    />
  )
}

function GradeCell({ row, table }: DataTableCellContext<ExamGrade>) {
  const { gradeDrafts, setGradeDrafts } = table.options.meta as unknown as GradingMeta
  const studentId = row.original.studentId
  return (
    <Input
      type="number"
      min={5}
      max={10}
      step={1}
      value={gradeDrafts[studentId] ?? ""}
      onChange={(event) =>
        setGradeDrafts((current) => ({ ...current, [studentId]: event.target.value }))
      }
      placeholder="5–10"
    />
  )
}

export function examGradingGridColumns(isFinal: boolean): DataTableColumnDef<ExamGrade>[] {
  return [
    { accessorKey: "studentName", header: "Name", meta: { cellClassName: "font-medium" } },
    { accessorKey: "studentSurname", header: "Surname" },
    {
      id: "indexYear",
      header: "Index / Year",
      meta: { cellClassName: "text-muted-foreground" },
      cell: IndexYearCell,
    },
    {
      id: "points",
      header: "Points",
      meta: { headerClassName: "w-40" },
      cell: PointsCell,
    },
    ...(isFinal
      ? [
          {
            id: "grade",
            header: "Grade",
            meta: { headerClassName: "w-40" },
            cell: GradeCell,
          } satisfies DataTableColumnDef<ExamGrade>,
        ]
      : []),
  ]
}
