import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { FileUpload, type FileUploadHandle } from "@/components/layout/FileUpload"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTable, type DataTableColumnDef } from "@/components/layout/DataTable"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/features/auth/AuthContext"
import { apiClient } from "@/lib/api-client"
import { formatDateTime, truncateFileName } from "@/lib/utils"
import type { Assignment, AssignmentRequest, AssignmentSubmission } from "@/types/api"
import { toast } from "sonner"
import { FileText, X } from "lucide-react"
import { BackButton } from "@/components/layout/BackButton"
import { FileDownload } from "@/features/assignments/FileDownload"
import { ViewSubmissionDialog } from "@/features/assignments/ViewSubmissionDialog"

type AssignmentForm = Omit<AssignmentRequest, "subjectId" | "dueDate"> & { dueDate: string }

function localDateTime(isoDate: string) {
  const date = new Date(isoDate)
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

export default function AssignmentDetailPage({ assignmentIdOverride, embedded = false, onDeleted }: { assignmentIdOverride?: number; embedded?: boolean; onDeleted?: () => void }) {
  const { assignmentId: routeAssignmentId } = useParams<{ assignmentId: string }>()
  const assignmentId = assignmentIdOverride ? String(assignmentIdOverride) : routeAssignmentId
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [maxPointsOpen, setMaxPointsOpen] = useState(false)
  const [maxPointsDraft, setMaxPointsDraft] = useState("")
  const [viewingSubmission, setViewingSubmission] = useState<AssignmentSubmission | null>(null)
  const [submissionText, setSubmissionText] = useState("")
  const [hasSelectedFiles, setHasSelectedFiles] = useState(false)
  const [removedFileIds, setRemovedFileIds] = useState<number[]>([])
  const fileUploadRef = useRef<FileUploadHandle>(null)
  const canManage = user?.type === "ADMIN" || user?.type === "PROFESSOR"

  const assignment = useQuery({
    queryKey: ["assignment", assignmentId], enabled: Boolean(assignmentId),
    queryFn: async () => (await apiClient.get<Assignment>(`/assignments/${assignmentId}`)).data,
  })
  const submission = useQuery({
    queryKey: ["assignment-submission", assignmentId], enabled: Boolean(assignmentId) && user?.type === "STUDENT",
    queryFn: async () => {
      try { return (await apiClient.get<AssignmentSubmission>(`/assignments/${assignmentId}/submission`)).data }
      catch (error) { if (axiosStatus(error) === 404) return null; throw error }
    },
  })
  const submissions = useQuery({
    queryKey: ["assignment-submissions", assignmentId], enabled: Boolean(assignmentId) && canManage,
    queryFn: async () => (await apiClient.get<AssignmentSubmission[]>(`/assignments/${assignmentId}/submissions`)).data,
  })
  const visibleSubmittedFiles = (submission.data?.files ?? []).filter((file) => !removedFileIds.includes(file.id))

  useEffect(() => {
    setSubmissionText(submission.data?.textContent ?? "")
  }, [submission.data?.textContent])

  const form = useForm<AssignmentForm>()
  const openEdit = () => {
    if (!assignment.data) return
    form.reset({ title: assignment.data.title, description: assignment.data.description, dueDate: localDateTime(assignment.data.dueDate) })
    setEditOpen(true)
  }
  const editAssignment = useMutation({
    mutationFn: (values: AssignmentForm) => apiClient.put<Assignment>(`/assignments/${assignmentId}`, { ...values, dueDate: new Date(values.dueDate).toISOString(), subjectId: assignment.data!.subjectId } satisfies AssignmentRequest),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["assignment", assignmentId] }); await queryClient.invalidateQueries({ queryKey: ["assignments", "subject"] }); toast.success("Assignment updated"); setEditOpen(false) },
  })
  const deleteAssignment = useMutation({
    mutationFn: () => apiClient.delete(`/assignments/${assignmentId}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["assignments", "subject"] })
      toast.success("Assignment deleted")
      if (embedded) onDeleted?.()
      else navigate(-1)
    },
  })
  const maxPointsMutation = useMutation({
    mutationFn: (maxPoints: number) => apiClient.put<Assignment>(`/assignments/${assignmentId}/max-points`, { maxPoints }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["assignment", assignmentId] })
      toast.success("Maximum points saved.")
      setMaxPointsOpen(false)
      setMaxPointsDraft("")
    },
  })
  const submitAssignment = useMutation({
    mutationFn: async () => {
      const uploaded = await fileUploadRef.current?.upload() ?? []
      const existing = visibleSubmittedFiles.map((file) => ({
        storageKey: file.storageKey, fileName: file.fileName, contentType: file.contentType, sizeBytes: file.sizeBytes,
      }))
      await apiClient.put(`/assignments/${assignmentId}/submission`, { files: [...existing, ...uploaded], textContent: submissionText.trim() || null })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["assignment-submission", assignmentId] })
      toast.success("Submission updated")
      fileUploadRef.current?.clear()
      setRemovedFileIds([])
    },
  })

  if (assignment.isLoading) return <Skeleton className="h-48 w-full" />
  if (assignment.isError || !assignment.data) return <p className="text-destructive">Unable to load this assignment.</p>
  const currentAssignment = assignment.data

  const isPastDue = new Date(currentAssignment.dueDate).getTime() < Date.now()
  const submissionColumns: DataTableColumnDef<AssignmentSubmission>[] = [
    {
      id: "student",
      header: "Student",
      cell: ({ row }) => <div className="flex flex-col"><span className="font-medium">{row.original.studentName} {row.original.studentSurname}</span><span className="text-xs text-muted-foreground">{row.original.files.length} file{row.original.files.length === 1 ? "" : "s"}</span></div>,
    },
    { id: "submission", header: "Submission", cell: ({ row }) => <Button type="button" variant="outline" size="sm" onClick={() => setViewingSubmission(row.original)}>View submission</Button> },
    { accessorKey: "points", header: "Points", meta: { headerClassName: "text-right", cellClassName: "text-right" }, cell: ({ row }) => row.original.points ?? "-" },
  ]
  const submissionFileUpload = <FileUpload
    ref={fileUploadRef}
    id="submission-files"
    uploadUrlEndpoint={`/assignments/${assignmentId}/submission/upload-url`}
    variant="dropzone"
    multiple
    deferred
    disabled={submitAssignment.isPending}
    selectedIcon="paperclip"
    showErrorToast={false}
    showUploading={false}
    resetInputOnError={false}
    useContentTypeFallback={false}
    onSelectionChange={setHasSelectedFiles}
  />

  return (
    <div className={embedded ? "flex flex-col gap-4 border-t border-border pt-4" : "flex flex-col gap-6"}>
      {!embedded && <div className="page-heading">
        <div className="flex flex-col gap-2">
          <BackButton />
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">{currentAssignment.title}</h1>
            <span className={isPastDue ? "text-muted-foreground" : "text-primary"}>{isPastDue ? "Past due" : "Open"}</span>
          </div>
          <p className="text-muted-foreground">Due {formatDateTime(currentAssignment.dueDate)}</p>
        </div>
      </div>}
      {embedded ? <div className="flex flex-col gap-4">
        <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{currentAssignment.description || "No instructions provided."}</p>
      </div> : <Card size="sm"><CardHeader><CardTitle>Description</CardTitle></CardHeader><CardContent><p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{currentAssignment.description || "No description provided."}</p></CardContent></Card>}

      {user?.type === "STUDENT" && (embedded ? <div className="flex flex-col gap-5">
        {submission.data && (submission.data.points !== null ? <span className="text-sm text-emerald-700">{submission.data.points} points</span> : <span className="text-sm text-muted-foreground">Not graded</span>)}
          {submission.isLoading && <Skeleton className="h-12 w-full" />}
          <div className="flex flex-col gap-2"><Label htmlFor="submission-text">Written response</Label><Textarea id="submission-text" value={submissionText} onChange={(event) => setSubmissionText(event.target.value)} placeholder="Write your answer or add a note for your professor..." /></div>
          {visibleSubmittedFiles.length > 0 ? <div className="flex flex-col gap-2"><Label>Submitted files</Label>{visibleSubmittedFiles.map((file) => <div key={file.id} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm"><FileText className="size-4 text-primary" /><span className="min-w-0 flex-1 truncate font-medium" title={file.fileName}>{truncateFileName(file.fileName)}</span><FileDownload file={file} /><Button type="button" variant="ghost" size="icon-sm" aria-label={`Remove ${file.fileName}`} className="text-muted-foreground hover:text-destructive" onClick={() => setRemovedFileIds((current) => [...current, file.id])}><X /></Button></div>)}</div> : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor="submission-files">Attachments</Label>
            {submissionFileUpload}
          </div>
        <div className="flex justify-end"><Button disabled={submitAssignment.isPending || (!submissionText.trim() && !hasSelectedFiles && visibleSubmittedFiles.length === 0)} onClick={() => submitAssignment.mutate()}>{submitAssignment.isPending ? "Submitting..." : submission.data ? "Update submission" : "Submit assignment"}</Button></div>
      </div> : <Card><CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4"><CardTitle>My work</CardTitle>{submission.data && (submission.data.points !== null ? <span className="text-emerald-700">{submission.data.points} points</span> : <span className="text-muted-foreground">Not graded</span>)}</CardHeader><CardContent className="flex flex-col gap-5">
        {submission.isLoading && <Skeleton className="h-12 w-full" />}
        <div className="flex flex-col gap-2"><Label htmlFor="submission-text">Written response</Label><Textarea id="submission-text" value={submissionText} onChange={(event) => setSubmissionText(event.target.value)} placeholder="Write your answer or add a note for your professor..." /></div>
        {visibleSubmittedFiles.length > 0 ? <div className="flex flex-col gap-2"><Label>Submitted files</Label>{visibleSubmittedFiles.map((file) => <div key={file.id} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm"><FileText className="size-4 text-primary" /><span className="min-w-0 flex-1 truncate font-medium" title={file.fileName}>{truncateFileName(file.fileName)}</span><FileDownload file={file} /><Button type="button" variant="ghost" size="icon-sm" aria-label={`Remove ${file.fileName}`} className="text-muted-foreground hover:text-destructive" onClick={() => setRemovedFileIds((current) => [...current, file.id])}><X /></Button></div>)}</div> : null}
        <div className="flex flex-col gap-2">
          <Label htmlFor="submission-files">Attachments</Label>
          {submissionFileUpload}
        </div>
        <div className="flex justify-end"><Button disabled={submitAssignment.isPending || (!submissionText.trim() && !hasSelectedFiles && visibleSubmittedFiles.length === 0)} onClick={() => submitAssignment.mutate()}>{submitAssignment.isPending ? "Submitting..." : submission.data ? "Update submission" : "Submit assignment"}</Button></div>
      </CardContent></Card>)}

      {canManage && <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Submissions</CardTitle>{currentAssignment.maxPoints == null ? <Button type="button" variant="outline" size="sm" onClick={() => { setMaxPointsDraft(""); setMaxPointsOpen(true) }}>Add max points</Button> : <span className="text-sm text-muted-foreground">Max points: {currentAssignment.maxPoints}</span>}</CardHeader><CardContent>
        {submissions.isLoading && <Skeleton className="h-16 w-full" />}
        {!submissions.isLoading && submissions.data?.length === 0 && <p className="text-sm text-muted-foreground">No submissions yet.</p>}
        {submissions.data && submissions.data.length > 0 && (
          <DataTable data={submissions.data} columns={submissionColumns} containerClassName="max-h-[23.5rem] overflow-y-auto" />
        )}
      </CardContent></Card>}

      {canManage && <div className="flex justify-end gap-2"><Button variant="outline" onClick={openEdit}>{embedded ? "Edit assignment" : "Edit"}</Button><Button variant="destructive" onClick={() => setDeleteOpen(true)}>{embedded ? "Delete assignment" : "Delete"}</Button></div>}

      <ViewSubmissionDialog submission={viewingSubmission} onClose={() => setViewingSubmission(null)} assignmentId={assignmentId} maxPoints={currentAssignment.maxPoints} />
      <Dialog open={maxPointsOpen} onOpenChange={(open) => { setMaxPointsOpen(open); if (!open) setMaxPointsDraft("") }}><DialogContent><DialogHeader><DialogTitle>Add maximum points</DialogTitle><DialogDescription>{currentAssignment.title}</DialogDescription></DialogHeader><div className="flex flex-col gap-2"><Label htmlFor="assignment-maximum-points">Maximum points</Label><Input id="assignment-maximum-points" type="number" min={0.5} step={0.5} value={maxPointsDraft} onChange={(event) => setMaxPointsDraft(event.target.value)} placeholder="Enter maximum points" /></div><DialogFooter><Button type="button" variant="outline" onClick={() => setMaxPointsOpen(false)}>Cancel</Button><Button type="button" disabled={!Number.isFinite(Number(maxPointsDraft)) || Number(maxPointsDraft) <= 0 || maxPointsMutation.isPending} onClick={() => maxPointsMutation.mutate(Number(maxPointsDraft))}>Save</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={editOpen} onOpenChange={setEditOpen}><DialogContent><DialogHeader><DialogTitle>Edit assignment</DialogTitle><DialogDescription>Update the assignment details.</DialogDescription></DialogHeader><form className="flex flex-col gap-4" onSubmit={form.handleSubmit((values) => editAssignment.mutate(values))}><div className="flex flex-col gap-2"><Label htmlFor="edit-title">Title</Label><Input id="edit-title" {...form.register("title", { required: true })} /></div><div className="flex flex-col gap-2"><Label htmlFor="edit-description">Description</Label><Textarea id="edit-description" {...form.register("description")} /></div><div className="flex flex-col gap-2"><Label htmlFor="edit-due-date">Due date</Label><Input id="edit-due-date" type="datetime-local" {...form.register("dueDate", { required: true })} /></div><DialogFooter><Button type="submit" disabled={editAssignment.isPending}>{editAssignment.isPending ? "Saving..." : "Save changes"}</Button></DialogFooter></form></DialogContent></Dialog>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete assignment?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteAssignment.mutate()} disabled={deleteAssignment.isPending}>{deleteAssignment.isPending ? "Deleting..." : "Delete"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  )
}

function axiosStatus(error: unknown) {
  return (error as { response?: { status?: number } }).response?.status
}
