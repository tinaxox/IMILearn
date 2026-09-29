import type { Dispatch, SetStateAction } from "react"
import type { DataTableCellContext, DataTableColumnDef } from "@/components/layout/DataTable"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { ExamGrade } from "@/types/api"

export interface GradingMeta {
  gradeDrafts: Record<number, string>
  finalPointDrafts: Record<number, string>
  setGradeDrafts: Dispatch<SetStateAction<Record<number, string>>>
  setFinalPointDrafts: Dispatch<SetStateAction<Record<number, string>>>
  isFinal: boolean
  maxPoints: number | null | undefined
}

function IndexCell({ row }: DataTableCellContext<ExamGrade>) {
  return <>{row.original.studentIndex || "-"}</>
}

export function isPointsInvalid(draft: string, maxPoints: number | null | undefined) {
  if (draft === "") return false
  const value = Number(draft)
  return !Number.isFinite(value) || value < 0 || (maxPoints != null && maxPoints > 0 && value > maxPoints)
}

export function isFinalGradeInvalid(draft: string) {
  if (draft === "") return false
  const value = Number(draft)
  return !Number.isFinite(value) || !Number.isInteger(value) || value < 5 || value > 10
}

function PointsCell({ row, table }: DataTableCellContext<ExamGrade>) {
  const { gradeDrafts, finalPointDrafts, setGradeDrafts, setFinalPointDrafts, isFinal, maxPoints } =
    table.options.meta as unknown as GradingMeta
  const studentId = row.original.studentId
  const drafts = isFinal ? finalPointDrafts : gradeDrafts
  const setDrafts = isFinal ? setFinalPointDrafts : setGradeDrafts
  const draft = drafts[studentId] ?? ""
  const invalid = isPointsInvalid(draft, maxPoints)
  return (
    <div className="flex flex-col gap-1">
      <Input
        type="number"
        min={0}
        max={maxPoints ?? undefined}
        step={0.5}
        value={draft}
        onChange={(event) =>
          setDrafts((current) => ({ ...current, [studentId]: event.target.value }))
        }
        placeholder="Enter points"
        className={cn(invalid && "border-destructive focus-visible:ring-destructive")}
      />
      {invalid && (
        <p className="text-xs text-destructive">
          {maxPoints != null && maxPoints > 0 ? `Max ${maxPoints} points` : "Invalid points"}
        </p>
      )}
    </div>
  )
}

function GradeCell({ row, table }: DataTableCellContext<ExamGrade>) {
  const { gradeDrafts, setGradeDrafts } = table.options.meta as unknown as GradingMeta
  const studentId = row.original.studentId
  const draft = gradeDrafts[studentId] ?? ""
  const invalid = isFinalGradeInvalid(draft)
  return (
    <div className="flex flex-col gap-1">
      <Input
        type="number"
        min={5}
        max={10}
        step={1}
        value={draft}
        onChange={(event) =>
          setGradeDrafts((current) => ({ ...current, [studentId]: event.target.value }))
        }
        placeholder="5–10"
        className={cn(invalid && "border-destructive focus-visible:ring-destructive")}
      />
      {invalid && <p className="text-xs text-destructive">Grade must be 5–10</p>}
    </div>
  )
}

export function examGradingGridColumns(isFinal: boolean): DataTableColumnDef<ExamGrade>[] {
  return [
    { accessorKey: "studentName", header: "Name", meta: { cellClassName: "font-medium" } },
    { accessorKey: "studentSurname", header: "Surname" },
    {
      id: "index",
      header: "Index",
      meta: { cellClassName: "text-muted-foreground" },
      cell: IndexCell,
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
