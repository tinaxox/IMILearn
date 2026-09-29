import { useState } from "react"
import { useForm } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import { TabSectionCard } from "@/components/layout/TabSectionCard"
import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/features/auth/AuthContext"
import { apiClient, getErrorMessage } from "@/lib/api-client"
import type { Assignment, AssignmentRequest, Page } from "@/types/api"
import { toast } from "sonner"
import { AssignmentRow } from "@/features/assignments/AssignmentRow"
import { BackButton } from "@/components/layout/BackButton"

type AssignmentForm = Omit<AssignmentRequest, "subjectId" | "dueDate" | "maxPoints"> & {
  dueDate: string
  maxPoints: string
}

export default function AssignmentsPage({ embedded = false }: { embedded?: boolean }) {
  const { subjectId } = useParams<{ subjectId: string }>()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [expandedAssignmentId, setExpandedAssignmentId] = useState<number | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssignmentForm>({ defaultValues: { title: "", description: "", dueDate: "", maxPoints: "" } })
  const canManage = user?.type === "ADMIN" || user?.type === "PROFESSOR"

  const assignments = useQuery({
    queryKey: ["assignments", "subject", subjectId],
    enabled: Boolean(subjectId),
    queryFn: async () =>
      (
        await apiClient.get<Page<Assignment>>(`/assignments`, {
          params: { subject: subjectId, size: 100 },
        })
      ).data.content,
  })

  const createAssignment = useMutation({
    mutationFn: (form: AssignmentForm) =>
      apiClient.post<Assignment>("/assignments", {
        title: form.title,
        description: form.description,
        dueDate: new Date(form.dueDate).toISOString(),
        maxPoints: form.maxPoints && Number(form.maxPoints) > 0 ? Number(form.maxPoints) : null,
        subjectId: Number(subjectId),
      } satisfies AssignmentRequest),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["assignments", "subject", subjectId] })
      toast.success("Assignment created")
      reset()
      setDialogOpen(false)
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <div className={embedded ? "flex flex-col gap-4" : "flex flex-col gap-6"}>
      {!embedded && (
        <div className="page-heading">
          <div className="flex flex-col gap-2">
            <BackButton />
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold">Assignments</h1>
              <span className="text-muted-foreground">{assignments.data?.length ?? 0} total</span>
            </div>
            <p className="text-muted-foreground">View and submit work for this subject.</p>
          </div>
          {canManage && <Button onClick={() => setDialogOpen(true)}>Create assignment</Button>}
        </div>
      )}

      <TabSectionCard
        title="All assignments"
        action={
          embedded &&
          canManage && (
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              Create assignment
            </Button>
          )
        }
      >
        {assignments.isLoading && <Skeleton className="h-16 w-full" />}
        {assignments.isError && (
          <p className="text-sm text-destructive">Unable to load assignments.</p>
        )}
        {!assignments.isLoading && assignments.data?.length === 0 && (
          <p className="text-sm text-muted-foreground">No assignments yet.</p>
        )}
        {assignments.data && assignments.data.length > 0 && (
          <div className="flex flex-col gap-3">
            {assignments.data.map((assignment) => (
              <AssignmentRow
                key={assignment.id}
                assignment={assignment}
                expanded={expandedAssignmentId === assignment.id}
                isStudent={user?.type === "STUDENT"}
                onToggle={() =>
                  setExpandedAssignmentId((current) =>
                    current === assignment.id ? null : assignment.id,
                  )
                }
                onDeleted={() => setExpandedAssignmentId(null)}
              />
            ))}
          </div>
        )}
      </TabSectionCard>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create assignment</DialogTitle>
            <DialogDescription>Add an assignment for this subject.</DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit((form) => createAssignment.mutate(form))}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="assignment-title">Title</Label>
              <Input id="assignment-title" {...register("title", { required: true })} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="assignment-description">Description</Label>
              <Textarea
                id="assignment-description"
                {...register("description", { required: "Description is required." })}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="assignment-due-date">Due date</Label>
              <Input
                id="assignment-due-date"
                type="datetime-local"
                {...register("dueDate", { required: true })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="assignment-max-points">Maximum points</Label>
              <Input
                id="assignment-max-points"
                type="number"
                min={0.5}
                step={0.5}
                {...register("maxPoints")}
                placeholder="Optional"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createAssignment.isPending}>
                {createAssignment.isPending ? "Creating..." : "Create assignment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
