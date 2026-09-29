import { useQueries, useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/layout/DataTable"
import { apiClient } from "@/lib/api-client"
import {
  examGradeGridColumns,
  quizSubmissionGridColumns,
  type ExamGradeWithSubject,
} from "@/features/quizzes/quizScoresGridColumns"
import type { QuizSubmission, StudentExamGrade, Subject } from "@/types/api"

export default function QuizScoresPage() {
  const subjects = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => (await apiClient.get<Subject[]>("/subjects")).data,
  })
  const examGradeQueries = useQueries({
    queries: (subjects.data ?? []).map((subject) => ({
      queryKey: ["exams", "my-grades", subject.id],
      queryFn: async () =>
        (
          await apiClient.get<StudentExamGrade[]>("/exams/my-grades", {
            params: { subject: subject.id },
          })
        ).data,
    })),
  })
  const submissions = useQuery({
    queryKey: ["quiz-submissions", "mine"],
    queryFn: async () => (await apiClient.get<QuizSubmission[]>("/quizzes/submissions/mine")).data,
  })

  const examGrades = (subjects.data ?? [])
    .flatMap((subject, index) =>
      (examGradeQueries[index]?.data ?? []).map((grade) => ({ ...grade, subject })),
    )
    .sort(
      (a, b) =>
        a.subject.name.localeCompare(b.subject.name) ||
        Number(a.examType === "FINAL") - Number(b.examType === "FINAL") ||
        new Date(b.examDate).getTime() - new Date(a.examDate).getTime(),
    )
  const examGradesLoading = subjects.isLoading || examGradeQueries.some((query) => query.isLoading)
  const examGradesError = subjects.isError || examGradeQueries.some((query) => query.isError)
  return (
    <div className="flex flex-col gap-6">
      <div className="page-heading">
        <div>
          <h1>My scores</h1>
          <p>Exam grades and quiz attempts</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exam grades</CardTitle>
        </CardHeader>
        <CardContent>
          {examGradesLoading ? (
            <p className="text-sm text-muted-foreground">Loading exam grades...</p>
          ) : examGradesError ? (
            <p className="text-sm text-destructive">Unable to load exam grades.</p>
          ) : examGrades.length === 0 ? (
            <p className="text-sm text-muted-foreground">No exam grades yet.</p>
          ) : (
            <DataTable
              data={examGrades}
              columns={examGradeGridColumns}
              containerClassName="max-h-[23.5rem] overflow-y-auto"
            />
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
            <DataTable
              data={submissions.data ?? []}
              columns={quizSubmissionGridColumns}
              containerClassName="max-h-[23.5rem] overflow-y-auto"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
