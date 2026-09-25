import { useQueries, useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable, type DataTableColumnDef } from "@/components/layout/DataTable"
import { apiClient } from "@/lib/api-client"
import { formatDateTime } from "@/lib/utils"
import type { QuizSubmission, StudentExamGrade, Subject } from "@/types/api"

type ExamGradeWithSubject = StudentExamGrade & { subject: Subject }

function scoreTextClasses(score: number): string {
  if (score >= 70) return "text-emerald-700"
  if (score >= 40) return "text-amber-700"
  return "text-red-700"
}

export default function QuizScoresPage() {
  const subjects = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => (await apiClient.get<Subject[]>("/subjects")).data,
  })
  const examGradeQueries = useQueries({
    queries: (subjects.data ?? []).map((subject) => ({
      queryKey: ["exams", "my-grades", subject.id],
      queryFn: async () => (
        await apiClient.get<StudentExamGrade[]>("/exams/my-grades", { params: { subject: subject.id } })
      ).data,
    })),
  })
  const submissions = useQuery({
    queryKey: ["quiz-submissions", "mine"],
    queryFn: async () => (await apiClient.get<QuizSubmission[]>("/quizzes/submissions/mine")).data,
  })

  const examGrades = (subjects.data ?? []).flatMap((subject, index) =>
    (examGradeQueries[index]?.data ?? []).map((grade) => ({ ...grade, subject })),
  ).sort((a, b) =>
    a.subject.name.localeCompare(b.subject.name)
      || Number(a.examType === "FINAL") - Number(b.examType === "FINAL")
      || new Date(b.examDate).getTime() - new Date(a.examDate).getTime(),
  )
  const examGradesLoading = subjects.isLoading || examGradeQueries.some((query) => query.isLoading)
  const examGradesError = subjects.isError || examGradeQueries.some((query) => query.isError)
  const examGradeColumns: DataTableColumnDef<ExamGradeWithSubject>[] = [
    { id: "subject", header: "Subject", meta: { cellClassName: "font-medium" }, cell: ({ row }) => row.original.subject.name },
    { accessorKey: "examName", header: "Exam" },
    { accessorKey: "examType", header: "Type", cell: ({ row }) => row.original.examType === "MIDTERM" ? <span className="text-amber-700">Midterm</span> : row.original.examType === "FINAL" ? <span className="text-red-700">Final</span> : "-" },
    { accessorKey: "examDate", header: "Date", meta: { cellClassName: "text-muted-foreground" }, cell: ({ row }) => new Date(row.original.examDate).toLocaleDateString() },
    { accessorKey: "points", header: "Points", cell: ({ row }) => new Date(row.original.examDate).getTime() > Date.now() || row.original.points === null ? "-" : <span className="text-emerald-700">{row.original.points}/{row.original.maxPoints}</span> },
    { accessorKey: "grade", header: "Grade", cell: ({ row }) => row.original.examType !== "FINAL" || new Date(row.original.examDate).getTime() > Date.now() || row.original.grade === null ? "-" : <span className="text-emerald-700">{row.original.grade}</span> },
  ]
  const submissionColumns: DataTableColumnDef<QuizSubmission>[] = [
    {
      id: "quiz",
      header: "Quiz",
      cell: ({ row }) => <div><Link className="font-semibold text-primary hover:underline" to={`/quizzes/${row.original.quizId}/take?submission=${row.original.id}`}>{row.original.quizTitle || `Quiz #${row.original.quizId}`}</Link><p className="text-sm text-muted-foreground">Attempt on {new Date(row.original.createdAt).toLocaleDateString()}</p></div>,
    },
    { accessorKey: "score", header: "Score", cell: ({ row }) => <span className={scoreTextClasses(row.original.score)}>{row.original.score}%</span> },
    { id: "correct", header: "Correct", cell: ({ row }) => <span className="text-muted-foreground">{row.original.correctCount}/{row.original.totalQuestions}</span> },
    { accessorKey: "createdAt", header: "Submitted", cell: ({ row }) => formatDateTime(row.original.createdAt) },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="page-heading">
        <div>
          <h1>My scores</h1>
          <p>Exam grades and quiz attempts</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Exam grades</CardTitle></CardHeader>
        <CardContent>
          {examGradesLoading ? (
            <p className="text-sm text-muted-foreground">Loading exam grades...</p>
          ) : examGradesError ? (
            <p className="text-sm text-destructive">Unable to load exam grades.</p>
          ) : examGrades.length === 0 ? (
            <p className="text-sm text-muted-foreground">No exam grades yet.</p>
          ) : (
            <DataTable data={examGrades} columns={examGradeColumns} containerClassName="max-h-[23.5rem] overflow-y-auto" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quiz attempts</CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading scores...</p>
          ) : submissions.data?.length === 0 ? (
            <p className="text-sm text-muted-foreground">You haven't taken any quizzes yet.</p>
          ) : (
            <DataTable data={submissions.data ?? []} columns={submissionColumns} containerClassName="max-h-[23.5rem] overflow-y-auto" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
