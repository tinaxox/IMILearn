import { useQuery } from "@tanstack/react-query"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import AssignmentDetailPage from "@/features/assignments/AssignmentDetailPage"
import { apiClient } from "@/lib/api-client"
import { formatDateTime } from "@/lib/utils"
import type { Assignment, AssignmentSubmission } from "@/types/api"

interface AssignmentRowProps {
  assignment: Assignment
  expanded: boolean
  isStudent: boolean
  onToggle: () => void
  onDeleted: () => void
}

export function AssignmentRow({ assignment, expanded, isStudent, onToggle, onDeleted }: AssignmentRowProps) {
  const submission = useQuery({
    queryKey: ["assignment-submission", String(assignment.id)],
    enabled: isStudent,
    queryFn: async () => {
      try { return (await apiClient.get<AssignmentSubmission>(`/assignments/${assignment.id}/submission`)).data }
      catch (error) { if (axiosStatus(error) === 404) return null; throw error }
    },
  })

  return (
    <div className="rounded-lg border border-border bg-white p-4 transition-shadow has-[.assignment-expanded]:shadow-[0_6px_20px_rgb(16_24_40/6%)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-semibold">{assignment.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Due {formatDateTime(assignment.dueDate)}
            {isStudent && <> · {submission.isLoading ? "Checking status..." : submission.isError ? "Status unavailable" : submission.data ? "Submitted" : "Not handed in"}</>}
          </p>
        </div>
        <Button className="self-start sm:self-auto" size="sm" variant="outline" onClick={onToggle}>
          {expanded ? <>Close <ChevronUp /></> : <>View assignment <ChevronDown /></>}
        </Button>
      </div>
      {expanded && <div className="assignment-expanded mt-4"><AssignmentDetailPage key={assignment.id} assignmentIdOverride={assignment.id} embedded onDeleted={onDeleted} /></div>}
    </div>
  )
}

function axiosStatus(error: unknown) {
  return (error as { response?: { status?: number } }).response?.status
}
