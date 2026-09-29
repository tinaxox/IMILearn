import { Link } from "react-router-dom"
import type { DataTableColumnDef } from "@/components/layout/DataTable"
import { formatDateTime } from "@/lib/utils"
import type { QuizSubmission, StudentExamGrade, Subject } from "@/types/api"

export type ExamGradeWithSubject = StudentExamGrade & { subject: Subject }

function scoreTextClasses(score: number): string {
  if (score >= 70) return "text-emerald-700"
  if (score >= 40) return "text-amber-700"
  return "text-red-700"
}

export const examGradeGridColumns: DataTableColumnDef<ExamGradeWithSubject>[] = [
  {
    id: "subject",
    header: "Subject",
    meta: { cellClassName: "font-medium" },
    cell: ({ row }) => row.original.subject.name,
  },
  { accessorKey: "examName", header: "Exam" },
  {
    accessorKey: "examType",
    header: "Type",
    cell: ({ row }) =>
      row.original.examType === "MIDTERM" ? (
        <span className="text-amber-700">Midterm</span>
      ) : row.original.examType === "FINAL" ? (
        <span className="text-red-700">Final</span>
      ) : (
        "-"
      ),
  },
  {
    accessorKey: "examDate",
    header: "Date",
    meta: { cellClassName: "text-muted-foreground" },
    cell: ({ row }) => new Date(row.original.examDate).toLocaleDateString(),
  },
  {
    accessorKey: "points",
    header: "Points",
    cell: ({ row }) =>
      new Date(row.original.examDate).getTime() > Date.now() || row.original.points === null ? (
        "-"
      ) : (
        <span className="text-emerald-700">
          {row.original.points}/{row.original.maxPoints}
        </span>
      ),
  },
  {
    accessorKey: "grade",
    header: "Grade",
    cell: ({ row }) =>
      row.original.examType !== "FINAL" ||
      new Date(row.original.examDate).getTime() > Date.now() ||
      row.original.grade === null ? (
        "-"
      ) : (
        <span className="text-emerald-700">{row.original.grade}</span>
      ),
  },
]

export const quizSubmissionGridColumns: DataTableColumnDef<QuizSubmission>[] = [
  {
    id: "quiz",
    header: "Quiz",
    cell: ({ row }) => (
      <div>
        <Link
          className="font-semibold text-primary hover:underline"
          to={`/quizzes/${row.original.quizId}/take?submission=${row.original.id}`}
        >
          {row.original.quizTitle || `Quiz #${row.original.quizId}`}
        </Link>
        <p className="text-sm text-muted-foreground">
          Attempt on {new Date(row.original.createdAt).toLocaleDateString()}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "score",
    header: "Score",
    cell: ({ row }) => (
      <span className={scoreTextClasses(row.original.score)}>{row.original.score}%</span>
    ),
  },
  {
    id: "correct",
    header: "Correct",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.correctCount}/{row.original.totalQuestions}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Submitted",
    cell: ({ row }) => formatDateTime(row.original.createdAt),
  },
]
