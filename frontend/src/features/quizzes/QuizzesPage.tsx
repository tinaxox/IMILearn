import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable, type DataTableColumnDef } from "@/components/layout/DataTable"
import { apiClient } from "@/lib/api-client"
import { formatDateTime } from "@/lib/utils"
import type { Page, Quiz, QuizGenerationStatus, QuizSubmission, Subject } from "@/types/api"
import { CreateQuizDialog } from "@/features/quizzes/CreateQuizDialog"
import { GenerateQuizDialog } from "@/features/quizzes/GenerateQuizDialog"

const statusClasses: Record<QuizGenerationStatus["status"], string> = {
  PENDING: "text-amber-700",
  RUNNING: "text-amber-700",
  FAILED: "text-red-700",
  SUCCESS: "text-emerald-700",
}

export default function QuizzesPage() {
  const { subjectId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedSubjectId, setSelectedSubjectId] = useState(searchParams.get("subject") ?? subjectId ?? "")
  const numericSubjectId = Number(selectedSubjectId)
  const hasSubject = Number.isInteger(numericSubjectId) && numericSubjectId > 0
  const queryClient = useQueryClient()

  const [createOpen, setCreateOpen] = useState(false)
  const [generateOpen, setGenerateOpen] = useState(false)

  const subjects = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => (await apiClient.get<Subject[]>("/subjects")).data,
  })

  const quizzes = useQuery({
    queryKey: ["quizzes", "subject", numericSubjectId],
    queryFn: async () =>
      (await apiClient.get<Page<Quiz>>(`/quizzes`, { params: { subject: numericSubjectId, size: 100 } })).data.content,
    enabled: hasSubject,
    refetchInterval: 5000,
  })

  const submissions = useQuery({
    queryKey: ["quiz-submissions", "mine"],
    queryFn: async () => (await apiClient.get<QuizSubmission[]>("/quizzes/submissions/mine")).data,
  })

  const generationRequests = useQuery({
    queryKey: ["quiz-generation-requests", "mine"],
    queryFn: async () => (await apiClient.get<QuizGenerationStatus[]>("/quizzes/generate")).data,
    enabled: hasSubject,
    refetchInterval: 5000,
  })

  const inFlightRequests = (generationRequests.data ?? []).filter(
    (request) => request.subjectId === numericSubjectId && request.status !== "SUCCESS",
  )
  const latestSubmissionByQuiz = (submissions.data ?? []).reduce<Map<number, QuizSubmission>>((latest, submission) => {
    const previous = latest.get(submission.quizId)
    if (!previous || new Date(submission.createdAt).getTime() > new Date(previous.createdAt).getTime()) {
      latest.set(submission.quizId, submission)
    }
    return latest
  }, new Map())
  const columns: DataTableColumnDef<Quiz>[] = [
    { accessorKey: "title", header: "Name", meta: { cellClassName: "font-medium" } },
    { accessorKey: "createdAt", header: "Date", cell: ({ row }) => formatDateTime(row.original.createdAt) },
    { id: "questions", header: "Questions", cell: ({ row }) => row.original.questions.length },
    { id: "lastTaken", header: "Last taken", cell: ({ row }) => { const latestSubmission = latestSubmissionByQuiz.get(row.original.id); return latestSubmission ? formatDateTime(latestSubmission.createdAt) : "-" } },
    { id: "actions", header: "Actions", meta: { headerClassName: "text-right", cellClassName: "text-right" }, cell: ({ row }) => <Button variant="outline" render={<Link to={`/quizzes/${row.original.id}/take`} />}>Take quiz</Button> },
  ]

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["quizzes", "subject", numericSubjectId] })
    queryClient.invalidateQueries({ queryKey: ["quiz-generation-requests", "mine"] })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="page-heading">
        <div>
          <h1>Quizzes</h1>
          <p>Select a subject, create a quiz, or generate one from its materials.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={!hasSubject} onClick={() => setGenerateOpen(true)}>Generate with AI</Button>
          <Button disabled={!hasSubject} onClick={() => setCreateOpen(true)}>Create quiz</Button>
        </div>
      </div>

      <Card size="sm">
        <CardContent className="grid gap-2">
          <Label htmlFor="quiz-subject">Subject</Label>
          <Select
            value={selectedSubjectId}
            onValueChange={(value) => {
              setSelectedSubjectId(value ?? "")
              setSearchParams((params) => { if (value) params.set("subject", value); else params.delete("subject"); return params }, { replace: true })
            }}
          >
            <SelectTrigger id="quiz-subject" className="w-full max-w-md">
              <SelectValue placeholder="Select a subject">
                {(value: string | null) => subjects.data?.find((subject) => String(subject.id) === value)?.name ?? "Select a subject"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent label="Subject">{subjects.data?.map((subject) => <SelectItem key={subject.id} value={String(subject.id)}>{subject.name}</SelectItem>)}</SelectContent>
          </Select>
        </CardContent>
      </Card>

      {inFlightRequests.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Generation requests</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3">
            {inFlightRequests.map((request) => (
              <div key={request.id} className="flex flex-col gap-2 rounded-xl border border-dashed p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-muted-foreground">{request.title}</span>
                  <span className={statusClasses[request.status]}>{request.status}</span>
                </div>
                {request.errorMessage && <p className="text-sm text-destructive">{request.errorMessage}</p>}
                <Progress
                  value={
                    request.materialSteps.length
                      ? (request.materialSteps.filter((s) => s.status === "SUCCESS").length / request.materialSteps.length) * 100
                      : 0
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Available quizzes</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2">
          {!hasSubject && <p className="py-5 text-sm text-muted-foreground">Select a subject to see its quizzes and materials.</p>}
          {quizzes.isLoading && <p className="text-sm text-muted-foreground">Loading quizzes...</p>}
          {quizzes.data?.length === 0 && !quizzes.isLoading && (
            <p className="text-sm text-muted-foreground">No quizzes yet — create one or generate one from materials.</p>
          )}
          {quizzes.data && quizzes.data.length > 0 && (
            <DataTable data={quizzes.data} columns={columns} containerClassName="max-h-[23.5rem] overflow-y-auto" getRowClassName={() => "hover:bg-transparent"} />
          )}
        </CardContent>
      </Card>

      <CreateQuizDialog open={createOpen} onOpenChange={setCreateOpen} subjectId={numericSubjectId} onCreated={invalidateAll} />
      <GenerateQuizDialog open={generateOpen} onOpenChange={setGenerateOpen} subjectId={numericSubjectId} onGenerated={invalidateAll} />
    </div>
  )
}
