import { Link } from "react-router-dom"
import type { DataTableColumnDef } from "@/components/layout/DataTable"
import { Button } from "@/components/ui/button"
import { formatDateTime } from "@/lib/utils"
import type { Quiz, QuizAttempt, QuizSubmission } from "@/types/api"

interface QuizzesGridColumnsOptions {
  latestSubmissionByQuiz: Map<number, QuizSubmission>
  inProgressAttemptByQuiz: Map<number, QuizAttempt>
}

export function quizzesGridColumns({
  latestSubmissionByQuiz,
  inProgressAttemptByQuiz,
}: QuizzesGridColumnsOptions): DataTableColumnDef<Quiz>[] {
  return [
    { accessorKey: "title", header: "Name", meta: { cellClassName: "font-medium" } },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
    { id: "questions", header: "Questions", cell: ({ row }) => row.original.questions.length },
    {
      id: "lastTaken",
      header: "Last taken",
      cell: ({ row }) => {
        const latestSubmission = latestSubmissionByQuiz.get(row.original.id)
        return latestSubmission ? formatDateTime(latestSubmission.createdAt) : "-"
      },
    },
    {
      id: "actions",
      header: "Actions",
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
      cell: ({ row }) => {
        const hasInProgressAttempt = inProgressAttemptByQuiz.has(row.original.id)
        const hasSubmission = latestSubmissionByQuiz.has(row.original.id)
        const label = hasInProgressAttempt ? "Continue quiz" : hasSubmission ? "Take again" : "Take quiz"
        return (
          <Button variant="outline" render={<Link to={`/quizzes/${row.original.id}/take`} />}>
            {label}
          </Button>
        )
      },
    },
  ]
}
