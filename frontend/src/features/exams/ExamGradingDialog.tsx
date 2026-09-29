import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTable } from "@/components/layout/DataTable"
import { apiClient } from "@/lib/api-client"
import {
  examGradingGridColumns,
  isFinalGradeInvalid,
  isPointsInvalid,
  type GradingMeta,
} from "@/features/exams/examGradingGridColumns"
import type { Exam, ExamGrade } from "@/types/api"

interface ExamGradingDialogProps {
  exam: Exam | null
  onClose: () => void
  canManageExams: boolean
}

export function ExamGradingDialog({ exam, onClose, canManageExams }: ExamGradingDialogProps) {
  const queryClient = useQueryClient()
  const [gradeDrafts, setGradeDrafts] = useState<Record<number, string>>({})
  const [finalPointDrafts, setFinalPointDrafts] = useState<Record<number, string>>({})
  const gradesQuery = useQuery({
    queryKey: ["exams", exam?.id, "grades"],
    queryFn: async () => (await apiClient.get<ExamGrade[]>(`/exams/${exam!.id}/grades`)).data,
    enabled: canManageExams && exam !== null,
  })

  useEffect(() => {
    if (!gradesQuery.data) return
    setGradeDrafts(
      Object.fromEntries(
        gradesQuery.data.map((result) => {
          const value = exam?.type === "FINAL" ? result.grade : result.points
          return [result.studentId, value === null ? "" : String(value)]
        }),
      ),
    )
    setFinalPointDrafts(
      Object.fromEntries(
        gradesQuery.data.map((result) => [
          result.studentId,
          result.points === null ? "" : String(result.points),
        ]),
      ),
    )
  }, [gradesQuery.data, exam?.type])

  const isFinal = exam?.type === "FINAL"

  const getGradePayload = (studentId: number): { points: number; grade?: number } | null => {
    const value = Number(gradeDrafts[studentId])
    const points = Number(isFinal ? finalPointDrafts[studentId] : gradeDrafts[studentId])
    const validPoints =
      (isFinal ? finalPointDrafts[studentId] : gradeDrafts[studentId]) !== "" &&
      Number.isFinite(points) &&
      exam?.maxPoints != null &&
      exam.maxPoints > 0 &&
      points >= 0 &&
      points <= exam.maxPoints
    const validResult =
      gradeDrafts[studentId] !== "" &&
      Number.isFinite(value) &&
      (isFinal ? validPoints && Number.isInteger(value) && value >= 5 && value <= 10 : validPoints)
    if (!validResult) return null
    return { points, grade: isFinal ? value : undefined }
  }

  const gradeMutation = useMutation({
    mutationFn: async (entries: { studentId: number; points: number; grade?: number }[]) => {
      const results = await Promise.allSettled(
        entries.map(({ studentId, points, grade }) =>
          apiClient.put<ExamGrade>(`/exams/${exam!.id}/grades/${studentId}`, {
            points,
            ...(grade === undefined ? {} : { grade }),
          }),
        ),
      )
      const failedRequest = results.find((result) => result.status === "rejected")
      if (failedRequest) throw failedRequest.reason
      return entries.length
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["exams", exam?.id, "grades"] })
      await queryClient.invalidateQueries({ queryKey: ["exams", "my-grades"] })
      onClose()
      setGradeDrafts({})
      setFinalPointDrafts({})
      toast.success(exam?.type === "FINAL" ? "Final exam grade saved." : "Exam points saved.")
    },
    onError: async () => {
      await queryClient.invalidateQueries({ queryKey: ["exams", exam?.id, "grades"] })
    },
  })
  const gradableEntries = (gradesQuery.data ?? [])
    .map((result) => ({ studentId: result.studentId, payload: getGradePayload(result.studentId) }))
    .filter(
      (entry): entry is { studentId: number; payload: { points: number; grade?: number } } =>
        entry.payload !== null,
    )
  const hasInvalidDrafts = (gradesQuery.data ?? []).some((result) => {
    const pointsDraft = isFinal ? finalPointDrafts[result.studentId] : gradeDrafts[result.studentId]
    if (isPointsInvalid(pointsDraft ?? "", exam?.maxPoints)) return true
    if (isFinal && isFinalGradeInvalid(gradeDrafts[result.studentId] ?? "")) return true
    return false
  })

  const gradingMeta: GradingMeta = {
    gradeDrafts,
    finalPointDrafts,
    setGradeDrafts,
    setFinalPointDrafts,
    isFinal,
    maxPoints: exam?.maxPoints,
  }

  const columns = examGradingGridColumns(isFinal)

  return (
    <Dialog open={exam !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-4xl"
        initialFocus={false}
      >
        <DialogHeader>
          <DialogTitle>{exam?.type === "FINAL" ? "Final exam grades" : "Exam points"}</DialogTitle>
          <p className="text-sm font-medium text-muted-foreground">{exam?.name}</p>
        </DialogHeader>
        {gradesQuery.isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : gradesQuery.data?.length === 0 ? (
          <p className="py-5 text-sm text-muted-foreground">
            No students are enrolled in this subject.
          </p>
        ) : (
          <>
            <DataTable
              data={gradesQuery.data ?? []}
              columns={columns}
              containerClassName="max-h-[23.5rem] overflow-y-auto"
              meta={gradingMeta}
            />
            <DialogFooter>
              <Button
                disabled={!gradableEntries.length || hasInvalidDrafts || gradeMutation.isPending}
                onClick={() =>
                  gradeMutation.mutate(
                    gradableEntries.map(({ studentId, payload }) => ({ studentId, ...payload })),
                  )
                }
              >
                {gradeMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
