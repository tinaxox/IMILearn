import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { apiClient } from "@/lib/api-client"
import type { User } from "@/types/api"

interface AddMembersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subjectId: number
  candidates: User[]
}

export function AddMembersDialog({ open, onOpenChange, subjectId, candidates }: AddMembersDialogProps) {
  const queryClient = useQueryClient()
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<number>>(new Set())
  const addSubjectMembers = useMutation({
    mutationFn: async (userIds: number[]) => {
      const results = await Promise.allSettled(userIds.map((userId) => apiClient.post<User[]>(`/subjects/${subjectId}/members/${userId}`)))
      const failedRequest = results.find((result) => result.status === "rejected")
      if (failedRequest) throw failedRequest.reason
      return userIds.length
    },
    onSuccess: async (count) => {
      await queryClient.invalidateQueries({ queryKey: ["subjects", subjectId, "members"] })
      toast.success(`${count} member${count === 1 ? "" : "s"} added`)
      onOpenChange(false)
      setSelectedMemberIds(new Set())
    },
    onError: async () => {
      await queryClient.invalidateQueries({ queryKey: ["subjects", subjectId, "members"] })
      setSelectedMemberIds(new Set())
    },
  })

  const handleOpenChange = (nextOpen: boolean) => {
    if (addSubjectMembers.isPending) return
    onOpenChange(nextOpen)
    if (!nextOpen) setSelectedMemberIds(new Set())
  }

  return <Dialog open={open} onOpenChange={handleOpenChange}>
    <DialogContent className="sm:max-w-lg" showCloseButton={!addSubjectMembers.isPending}>
      <DialogHeader><DialogTitle>Add members</DialogTitle></DialogHeader>
      {candidates.length === 0 ? (
        <p className="text-sm text-muted-foreground">No students available to add.</p>
      ) : (
        <div className="max-h-80 divide-y divide-border overflow-y-auto rounded-lg border border-border">
          {candidates.map((candidate) => {
            const checkboxId = `member-candidate-${candidate.id}`
            return <label key={candidate.id} htmlFor={checkboxId} className="flex cursor-pointer items-center gap-3 px-3 py-3">
              <Checkbox id={checkboxId} checked={selectedMemberIds.has(candidate.id)} disabled={addSubjectMembers.isPending} onCheckedChange={() => setSelectedMemberIds((current) => {
                const next = new Set(current)
                if (next.has(candidate.id)) next.delete(candidate.id)
                else next.add(candidate.id)
                return next
              })} />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{candidate.name} {candidate.surname}</span>
                <span className="block text-xs text-muted-foreground">{candidate.index || "-"} / Year {candidate.year ?? "-"}</span>
              </span>
            </label>
          })}
        </div>
      )}
      <DialogFooter>
        <Button variant="outline" disabled={addSubjectMembers.isPending} onClick={() => { onOpenChange(false); setSelectedMemberIds(new Set()) }}>Cancel</Button>
        <Button disabled={!selectedMemberIds.size || addSubjectMembers.isPending} onClick={() => addSubjectMembers.mutate([...selectedMemberIds])}>{addSubjectMembers.isPending ? "Adding…" : `Add (${selectedMemberIds.size})`}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
}
