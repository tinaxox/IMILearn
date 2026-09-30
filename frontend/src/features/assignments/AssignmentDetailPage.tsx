import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FileUpload, type FileUploadHandle } from "@/components/layout/FileUpload"
import { ConfirmDeleteDialog } from "@/components/layout/ConfirmDeleteDialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTable } from "@/components/layout/DataTable"
import { submissionsGridColumns } from "@/features/assignments/submissionsGridColumns"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/features/auth/AuthContext"
import { apiClient } from "@/lib/api-client"
import { truncateFileName } from "@/lib/utils"
import type { Assignment, AssignmentRequest, AssignmentSubmission } from "@/types/api"
import { toast } from "sonner"
import { FileText, X } from "lucide-react"
import { FileDownload } from "@/features/assignments/FileDownload"
import { ViewSubmissionDialog } from "@/features/assignments/ViewSubmissionDialog"

type AssignmentForm = Omit<AssignmentRequest, "subjectId" | "dueDate" | "maxPoints"> & {
  dueDate: string
  maxPoints: string
}

function localDateTime(isoDate: string) {
  const date = new Date(isoDate)
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

export default function AssignmentDetailPage({
  assignmentId: assignmentIdProp,
  onDeleted,
}: {
  assignmentId: number
  onDeleted?: () => void
}) {
  const assignmentId = String(assignmentIdProp)
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [viewingSubmission, setViewingSubmission] = useState<AssignmentSubmission | null>(null)
  const [submissionText, setSubmissionText] = useState("")
  const [hasSelectedFiles, setHasSelectedFiles] = useState(false)
  const [removedFileIds, setRemovedFileIds] = useState<number[]>([])
  const fileUploadRef = useRef<FileUploadHandle>(null)
  const canManage = user?.type === "ADMIN" || user?.type === "PROFESSOR"

  const assignment = useQuery({
    queryKey: ["assignment", assignmentId],
    enabled: Boolean(assignmentId),
    queryFn: async () => (await apiClient.get<Assignment>(`/assignments/${assignmentId}`)).data,
  })
  const submission = useQuery({
    queryKey: ["assignment-submission", assignmentId],
    enabled: Boolean(assignmentId) && user?.type === "STUDENT",
    queryFn: async () => {
      try {
        return (
          await apiClient.get<AssignmentSubmission>(`/assignments/${assignmentId}/submission`)
        ).data
      } catch (error) {
        if (axiosStatus(error) === 404) return null
        throw error
      }
    },
  })
  const submissions = useQuery({
    queryKey: ["assignment-submissions", assignmentId],
    enabled: Boolean(assignmentId) && canManage,
    queryFn: async () =>
      (await apiClient.get<AssignmentSubmission[]>(`/assignments/${assignmentId}/submissions`))
        .data,
  })
  const visibleSubmittedFiles = (submission.data?.files ?? []).filter(
    (file) => !removedFileIds.includes(file.id),
  )

  useEffect(() => {
    setSubmissionText(submission.data?.textContent ?? "")
  }, [submission.data?.textContent])

  const form = useForm<AssignmentForm>()
  const openEdit = () => {
    if (!assignment.data) return
    form.reset({
      title: assignment.data.title,
      description: assignment.data.description,
      dueDate: localDateTime(assignment.data.dueDate),
      maxPoints:
        assignment.data.maxPoints != null && assignment.data.maxPoints > 0
          ? String(assignment.data.maxPoints)
          : "",
    })
    setEditOpen(true)
  }
  const editAssignment = useMutation({
    mutationFn: (values: AssignmentForm) =>
      apiClient.put<Assignment>(`/assignments/${assignmentId}`, {
        title: values.title,
        description: values.description,
        dueDate: new Date(values.dueDate).toISOString(),
        maxPoints:
          values.maxPoints && Number(values.maxPoints) > 0 ? Number(values.maxPoints) : null,
        subjectId: assignment.data!.subjectId,
      } satisfies AssignmentRequest),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["assignment", assignmentId] })
      await queryClient.invalidateQueries({ queryKey: ["assignments", "subject"] })
      toast.success("Assignment updated")
      setEditOpen(false)
    },
  })
  const deleteAssignment = useMutation({
    mutationFn: () => apiClient.delete(`/assignments/${assignmentId}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["assignments", "subject"] })
      toast.success("Assignment deleted")
      onDeleted?.()
    },
  })
  const submitAssignment = useMutation({
    mutationFn: async () => {
      const uploaded = (await fileUploadRef.current?.upload()) ?? []
      const existing = visibleSubmittedFiles.map((file) => ({
        storageKey: file.storageKey,
        fileName: file.fileName,
        contentType: file.contentType,
        sizeBytes: file.sizeBytes,
      }))
      await apiClient.put(`/assignments/${assignmentId}/submission`, {
        files: [...existing, ...uploaded],
        textContent: submissionText.trim() || null,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["assignment-submission", assignmentId] })
      toast.success("Submission updated")
      fileUploadRef.current?.clear()
      setRemovedFileIds([])
    },
  })

  if (assignment.isLoading) return <Skeleton className="h-48 w-full" />
  if (assignment.isError || !assignment.data)
    return <p className="text-destructive">Unable to load this assignment.</p>
  const currentAssignment = assignment.data

  const submissionColumns = submissionsGridColumns({
    onView: (submission) => setViewingSubmission(submission),
  })
  const submissionFileUpload = (
    <FileUpload
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
  )

  return (
    <div className="flex flex-col gap-4 border-t border-border pt-4">
      <div className="flex flex-col gap-4">
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {currentAssignment.description || "No instructions provided."}
        </p>
      </div>

      {user?.type === "STUDENT" && (
        <div className="flex flex-col gap-5">
          {submission.data &&
            (submission.data.points !== null ? (
              <span className="text-sm text-emerald-700">{submission.data.points} points</span>
            ) : (
              <span className="text-sm text-muted-foreground">Not graded</span>
            ))}
          {submission.isLoading && <Skeleton className="h-12 w-full" />}
          <div className="flex flex-col gap-2">
            <Label htmlFor="submission-text">Written response</Label>
            <Textarea
              id="submission-text"
              value={submissionText}
              onChange={(event) => setSubmissionText(event.target.value)}
              placeholder="Write your answer or add a note for your professor..."
            />
          </div>
          {visibleSubmittedFiles.length > 0 ? (
            <div className="flex flex-col gap-2">
              <Label>Submitted files</Label>
              {visibleSubmittedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm"
                >
                  <FileText className="size-4 text-primary" />
                  <span className="min-w-0 flex-1 truncate font-medium" title={file.fileName}>
                    {truncateFileName(file.fileName)}
                  </span>
                  <FileDownload file={file} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove ${file.fileName}`}
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => setRemovedFileIds((current) => [...current, file.id])}
                  >
                    <X />
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor="submission-files">Attachments</Label>
            {submissionFileUpload}
          </div>
          <div className="flex justify-end">
            <Button
              disabled={
                submitAssignment.isPending ||
                (!submissionText.trim() &&
                  !hasSelectedFiles &&
                  visibleSubmittedFiles.length === 0)
              }
              onClick={() => submitAssignment.mutate()}
            >
              {submitAssignment.isPending
                ? "Submitting..."
                : submission.data
                  ? "Update submission"
                  : "Submit assignment"}
            </Button>
          </div>
        </div>
      )}

      {canManage && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Submissions</CardTitle>
            {currentAssignment.maxPoints != null && currentAssignment.maxPoints > 0 && (
              <span className="text-sm text-muted-foreground">
                Max points: {currentAssignment.maxPoints}
              </span>
            )}
          </CardHeader>
          <CardContent>
            {submissions.isLoading && <Skeleton className="h-16 w-full" />}
            {!submissions.isLoading && submissions.data?.length === 0 && (
              <p className="text-sm text-muted-foreground">No submissions yet.</p>
            )}
            {submissions.data && submissions.data.length > 0 && (
              <DataTable
                data={submissions.data}
                columns={submissionColumns}
                containerClassName="max-h-[23.5rem] overflow-y-auto"
              />
            )}
          </CardContent>
        </Card>
      )}

      {canManage && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={openEdit}>
            Edit assignment
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            Delete assignment
          </Button>
        </div>
      )}

      <ViewSubmissionDialog
        submission={viewingSubmission}
        onClose={() => setViewingSubmission(null)}
        assignmentId={assignmentId}
        maxPoints={currentAssignment.maxPoints}
      />
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit assignment</DialogTitle>
            <DialogDescription>Update the assignment details.</DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit((values) => editAssignment.mutate(values))}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input id="edit-title" {...form.register("title", { required: true })} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea id="edit-description" {...form.register("description")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-due-date">Due date</Label>
              <Input
                id="edit-due-date"
                type="datetime-local"
                {...form.register("dueDate", { required: true })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-max-points">Maximum points</Label>
              <Input
                id="edit-max-points"
                type="number"
                min={0.5}
                step={0.5}
                {...form.register("maxPoints")}
                placeholder="Optional"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={editAssignment.isPending}>
                {editAssignment.isPending ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete assignment?"
        pending={deleteAssignment.isPending}
        onConfirm={() => deleteAssignment.mutate()}
      />
    </div>
  )
}

function axiosStatus(error: unknown) {
  return (error as { response?: { status?: number } }).response?.status
}
