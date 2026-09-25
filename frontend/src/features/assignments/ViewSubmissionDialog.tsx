import { useEffect, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { FileText } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileDownload } from "@/features/assignments/FileDownload"
import { apiClient } from "@/lib/api-client"
import { truncateFileName } from "@/lib/utils"
import type { AssignmentSubmission, GradeSubmissionRequest } from "@/types/api"

interface ViewSubmissionDialogProps {
  submission: AssignmentSubmission | null
  onClose: () => void
  assignmentId: string | undefined
  maxPoints: number | null
}

export function ViewSubmissionDialog({ submission, onClose, assignmentId, maxPoints }: ViewSubmissionDialogProps) {
  const queryClient = useQueryClient()
  const [gradeValue, setGradeValue] = useState("")

  useEffect(() => {
    setGradeValue(submission?.points == null ? "" : String(submission.points))
  }, [submission])

  const gradeSubmission = useMutation({
    mutationFn: ({ submissionId, points }: { submissionId: number; points: number }) =>
      apiClient.put(`/assignments/submissions/${submissionId}/grade`, { points } satisfies GradeSubmissionRequest),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["assignment-submissions", assignmentId] })
      toast.success("Grade saved")
      onClose()
    },
  })

  const points = Number(gradeValue)
  const validPoints = gradeValue.trim() !== "" && Number.isFinite(points) && maxPoints != null && points >= 0 && points <= maxPoints

  return <Dialog open={submission !== null} onOpenChange={(open) => { if (!open) onClose() }}><DialogContent>{submission && <><DialogHeader><DialogTitle>View submission</DialogTitle><DialogDescription>{submission.studentName} {submission.studentSurname}</DialogDescription></DialogHeader><div className="flex flex-col gap-5"><div className="flex flex-col gap-2"><Label>Written response</Label><p className="whitespace-pre-wrap break-words rounded-lg border border-border bg-muted/30 p-3 text-sm leading-6">{submission.textContent?.trim() || "No written response."}</p></div><div className="flex flex-col gap-2"><Label>Submitted files</Label>{submission.files.length > 0 ? submission.files.map((file) => <div key={file.id} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm"><FileText className="size-4 text-primary" /><span className="min-w-0 flex-1 truncate font-medium" title={file.fileName}>{truncateFileName(file.fileName)}</span><FileDownload file={file} /></div>) : <p className="text-sm text-muted-foreground">No files submitted.</p>}</div><div className="flex flex-col gap-2"><Label htmlFor="submission-grade">Points</Label><Input id="submission-grade" type="number" min={0} max={maxPoints ?? undefined} step={0.5} value={gradeValue} disabled={maxPoints == null} onChange={(event) => setGradeValue(event.target.value)} />{maxPoints == null && <p className="text-sm text-muted-foreground">Set a maximum points value before grading.</p>}</div></div><DialogFooter><Button type="button" disabled={!validPoints || gradeSubmission.isPending} onClick={() => gradeSubmission.mutate({ submissionId: submission.id, points })}>{gradeSubmission.isPending ? "Saving..." : "Save grade"}</Button></DialogFooter></>}</DialogContent></Dialog>
}
