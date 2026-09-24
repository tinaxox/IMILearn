import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { TabSectionCard } from "@/components/layout/TabSectionCard"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTable, type DataTableColumnDef } from "@/components/layout/DataTable"
import { useAuth } from "@/features/auth/AuthContext"
import { apiClient } from "@/lib/api-client"
import { formatDateTime } from "@/lib/utils"
import type { Exam, ExamRequest, Page, StudentExamGrade, Subject } from "@/types/api"
import { BackButton } from "@/components/layout/BackButton"
import { ExamGradingDialog } from "@/features/exams/ExamGradingDialog"

interface ExamFormValues {
  subjectId: string
  name: string
  date: string
  type: "MIDTERM" | "FINAL" | "OTHER"
}

const examTypeLabels = { MIDTERM: "Midterm", FINAL: "Final", OTHER: "Other" } as const

function toDateTimeLocal(date: string) {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return ""

  const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

export default function ExamsPage({ embedded = false }: { embedded?: boolean }) {
  const { subjectId: subjectIdParam } = useParams<{ subjectId: string }>()
  const subjectId = Number(subjectIdParam)
  const isAllExamsPage = !subjectIdParam
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const canManageExams = user?.type === "ADMIN" || user?.type === "PROFESSOR"
  const [formOpen, setFormOpen] = useState(searchParams.get("create") === "true")
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null)
  const [gradingExam, setGradingExam] = useState<Exam | null>(null)
  const [maxPointsExam, setMaxPointsExam] = useState<Exam | null>(null)
  const [maxPointsDraft, setMaxPointsDraft] = useState("")
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<ExamFormValues>({
    defaultValues: { subjectId: subjectIdParam ?? "", name: "", date: "", type: "MIDTERM" },
  })

  const subjectsQuery = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => (await apiClient.get<Subject[]>("/subjects")).data,
    enabled: isAllExamsPage,
  })

  const subjectExamQueries = useQueries({
    queries: isAllExamsPage ? (subjectsQuery.data ?? []).map((subject) => ({
      queryKey: ["exams", "subject", subject.id],
      queryFn: async () => (await apiClient.get<Page<Exam>>("/exams", { params: { subject: subject.id, size: 100 } })).data.content,
    })) : [],
  })

  const examsQuery = useQuery({
    queryKey: ["exams", "subject", subjectId],
    queryFn: async () => (await apiClient.get<Page<Exam>>(`/exams`, { params: { subject: subjectId, size: 100 } })).data.content,
    enabled: !isAllExamsPage && Number.isInteger(subjectId) && subjectId > 0,
  })

  const studentGradeSubjectIds = user?.type === "STUDENT"
    ? isAllExamsPage
      ? (subjectsQuery.data ?? []).map((subject) => subject.id)
      : Number.isInteger(subjectId) && subjectId > 0 ? [subjectId] : []
    : []
  const studentGradeQueries = useQueries({
    queries: studentGradeSubjectIds.map((gradeSubjectId) => ({
      queryKey: ["exams", "my-grades", gradeSubjectId],
      queryFn: async () => (await apiClient.get<StudentExamGrade[]>("/exams/my-grades", { params: { subject: gradeSubjectId } })).data,
    })),
  })
  const studentGradesByExam = new Map(
    studentGradeQueries.flatMap((query) => query.data ?? []).map((grade) => [grade.examId, grade]),
  )
  const studentGradesLoading = studentGradeQueries.some((query) => query.isLoading)

  const saveMutation = useMutation({
    mutationFn: async ({ id, request }: { id?: number; request: ExamRequest }) => {
      if (id === undefined) return (await apiClient.post<Exam>("/exams", request)).data
      return (await apiClient.put<Exam>(`/exams/${id}`, request)).data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["exams"] })
      toast.success(editingExam ? "Exam updated." : "Exam created.")
      setFormOpen(false)
      setEditingExam(null)
      reset({ subjectId: subjectIdParam ?? "", name: "", date: "", type: "MIDTERM" })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiClient.delete(`/exams/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["exams"] })
      toast.success("Exam deleted.")
      setExamToDelete(null)
    },
  })

  const maxPointsMutation = useMutation({
    mutationFn: ({ exam, maxPoints }: { exam: Exam; maxPoints: number }) => apiClient.put<Exam>(`/exams/${exam.id}/max-points`, { maxPoints }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["exams"] })
      setMaxPointsExam(null)
      setMaxPointsDraft("")
      toast.success("Maximum points saved.")
    },
  })

  function openCreateDialog() {
    setEditingExam(null)
    reset({ subjectId: subjectIdParam ?? "", name: "", date: "", type: "MIDTERM" })
    setFormOpen(true)
  }

  function openEditDialog(exam: Exam) {
    setEditingExam(exam)
    reset({ subjectId: String(exam.subjectId), name: exam.name, date: toDateTimeLocal(exam.date), type: exam.type })
    setFormOpen(true)
  }

  function onSubmit(values: ExamFormValues) {
    saveMutation.mutate({
      id: editingExam?.id,
      request: { name: values.name, date: new Date(values.date).toISOString(), type: values.type, maxPoints: editingExam?.maxPoints && editingExam.maxPoints > 0 ? editingExam.maxPoints : null, subjectId: isAllExamsPage ? Number(values.subjectId) : subjectId },
    })
  }

  const allExamData = isAllExamsPage ? subjectExamQueries.flatMap((query) => query.data ?? []) : (examsQuery.data ?? [])
  const examsLoading = isAllExamsPage ? subjectsQuery.isLoading || subjectExamQueries.some((query) => query.isLoading) : examsQuery.isLoading
  const examsError = isAllExamsPage ? subjectsQuery.isError || subjectExamQueries.some((query) => query.isError) : examsQuery.isError
  const exams = [...allExamData].sort(
    (a, b) => Number(a.type === "FINAL") - Number(b.type === "FINAL") || new Date(a.date).getTime() - new Date(b.date).getTime(),
  )
  const columns: DataTableColumnDef<Exam>[] = [
    { accessorKey: "name", header: "Name", meta: { cellClassName: "font-medium" } },
    ...(isAllExamsPage ? [{ accessorKey: "subjectName", header: "Subject", meta: { cellClassName: "text-muted-foreground" } } satisfies DataTableColumnDef<Exam>] : []),
    { accessorKey: "type", header: "Type", cell: ({ row }) => row.original.type && row.original.type !== "OTHER" ? <span className={row.original.type === "FINAL" ? "text-destructive" : "text-amber-600"}>{examTypeLabels[row.original.type]}</span> : "-" },
    {
      id: "points",
      header: "Points",
      cell: ({ row }) => canManageExams ? (new Date(row.original.date).getTime() <= Date.now() && row.original.maxPoints != null && row.original.maxPoints > 0 ? <Button variant="outline" size="sm" onClick={() => setGradingExam(row.original)}>View {row.original.type === "FINAL" ? "results" : "points"}</Button> : "-") : user?.type === "STUDENT" ? (studentGradesLoading ? <Skeleton className="h-5 w-12" /> : studentGradesByExam.get(row.original.id)?.points ?? "-") : "-",
    },
    {
      accessorKey: "maxPoints",
      header: "Max points",
      cell: ({ row }) => canManageExams ? (row.original.maxPoints == null || row.original.maxPoints <= 0 ? <Button variant="outline" size="sm" onClick={() => { setMaxPointsExam(row.original); setMaxPointsDraft("") }}>Add max points</Button> : row.original.maxPoints) : user?.type === "STUDENT" ? (row.original.maxPoints == null || row.original.maxPoints <= 0 ? "-" : row.original.maxPoints) : "-",
    },
    { accessorKey: "date", header: "Date", cell: ({ row }) => <span className={new Date(row.original.date).getTime() >= Date.now() ? "text-primary" : undefined}>{formatDateTime(row.original.date)}</span> },
    ...(canManageExams ? [{
      id: "actions",
      header: "Actions",
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
      cell: ({ row }) => <div className="flex justify-end gap-2"><Button variant="outline" size="sm" onClick={() => openEditDialog(row.original)}>Edit</Button><Button variant="destructive" size="sm" onClick={() => setExamToDelete(row.original)}>Delete</Button></div>,
    } satisfies DataTableColumnDef<Exam>] : []),
  ]

  return (
    <div className={embedded ? "flex flex-col gap-4" : "flex flex-col gap-6"}>
      {!embedded && <div className="page-heading">
        <div className="flex flex-col gap-2">
          {!isAllExamsPage && <BackButton />}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">Exams</h1>
          </div>
          <p className="text-muted-foreground">{isAllExamsPage ? (canManageExams ? "Manage exams for your subjects." : "View exams for your subjects.") : "Exams scheduled for this subject."}</p>
        </div>
        {canManageExams && <Button onClick={openCreateDialog}>Schedule exam</Button>}
      </div>}

      <TabSectionCard title="Scheduled exams" action={embedded && canManageExams && <Button size="sm" onClick={openCreateDialog}>Schedule exam</Button>}>
          {examsLoading && <Skeleton className="h-40 w-full" />}
          {examsError && <p className="text-sm text-destructive">Unable to load exams.</p>}
          {!examsLoading && !examsError && exams.length === 0 && (
            <p className="text-sm text-muted-foreground">No exams scheduled yet.</p>
          )}
          {!examsLoading && exams.length > 0 && (
            <DataTable data={exams} columns={columns} containerClassName="max-h-[23.5rem] overflow-y-auto" />
          )}
      </TabSectionCard>

      <Dialog open={canManageExams && formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExam ? "Edit exam" : "Schedule exam"}</DialogTitle>
            <DialogDescription>Set the exam name and scheduled date.</DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            {isAllExamsPage && <div className="flex flex-col gap-2">
              <Label htmlFor="exam-subject">Subject</Label>
              <Controller name="subjectId" control={control} rules={{ required: "Subject is required." }} render={({ field }) => <Select value={field.value} onValueChange={(value) => field.onChange(value ?? "")}><SelectTrigger id="exam-subject" className="w-full"><SelectValue>{(value: string | null) => subjectsQuery.data?.find((subject) => String(subject.id) === value)?.name ?? "Select a subject"}</SelectValue></SelectTrigger><SelectContent label="Subject">{subjectsQuery.data?.map((subject) => <SelectItem key={subject.id} value={String(subject.id)}>{subject.name}</SelectItem>)}</SelectContent></Select>} />
              {errors.subjectId && <p className="text-sm text-destructive">{errors.subjectId.message}</p>}
            </div>}
            <div className="flex flex-col gap-2">
              <Label htmlFor="exam-name">Name</Label>
              <Input id="exam-name" {...register("name", { required: "Name is required." })} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="exam-date">Date</Label>
              <Input id="exam-date" type="datetime-local" {...register("date", { required: "Date is required." })} />
              {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="exam-type">Type</Label>
              <Controller name="type" control={control} render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger id="exam-type" className="w-full"><SelectValue>{(value: keyof typeof examTypeLabels | null) => value ? examTypeLabels[value] : "Select type"}</SelectValue></SelectTrigger><SelectContent label="Type">{Object.entries(examTypeLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMutation.isPending}>{editingExam ? "Save changes" : "Schedule exam"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={maxPointsExam !== null} onOpenChange={(open) => { if (!open) { setMaxPointsExam(null); setMaxPointsDraft("") } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add maximum points</DialogTitle><DialogDescription>{maxPointsExam?.name}</DialogDescription></DialogHeader>
          <div className="flex flex-col gap-2"><Label htmlFor="maximum-points">Maximum points</Label><Input id="maximum-points" type="number" min={0.5} step={0.5} value={maxPointsDraft} onChange={(event) => setMaxPointsDraft(event.target.value)} placeholder="Enter maximum points" /></div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setMaxPointsExam(null)}>Cancel</Button><Button type="button" disabled={!maxPointsExam || !Number.isFinite(Number(maxPointsDraft)) || Number(maxPointsDraft) <= 0 || maxPointsMutation.isPending} onClick={() => maxPointsExam && maxPointsMutation.mutate({ exam: maxPointsExam, maxPoints: Number(maxPointsDraft) })}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <ExamGradingDialog exam={gradingExam} onClose={() => setGradingExam(null)} canManageExams={canManageExams} />

      <AlertDialog open={examToDelete !== null} onOpenChange={(open) => !open && setExamToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete exam?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete “{examToDelete?.name}”.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => examToDelete && deleteMutation.mutate(examToDelete.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
