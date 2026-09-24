import { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api-client"
import type { Material, Page, QuizGenerationRequestBody, QuizGenerationStatus } from "@/types/api"

interface GenerateQuizDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subjectId: number
  onGenerated: () => void
}

export function GenerateQuizDialog({ open, onOpenChange, subjectId, onGenerated }: GenerateQuizDialogProps) {
  const [generateTitle, setGenerateTitle] = useState("")
  const [questionCount, setQuestionCount] = useState(5)
  const [selectedMaterials, setSelectedMaterials] = useState<number[]>([])
  const [selectionSubjectId, setSelectionSubjectId] = useState(subjectId)
  if (selectionSubjectId !== subjectId) {
    setSelectionSubjectId(subjectId)
    setSelectedMaterials([])
  }

  const materials = useQuery({
    queryKey: ["materials", "by-subject", subjectId],
    queryFn: async () => (await apiClient.get<Page<Material>>(`/materials`, { params: { subject: subjectId, size: 100 } })).data.content,
    enabled: Number.isInteger(subjectId) && subjectId > 0,
  })
  const generateQuiz = useMutation({
    mutationFn: async (body: QuizGenerationRequestBody) => (await apiClient.post<QuizGenerationStatus>("/quizzes/generate", body)).data,
    onSuccess: () => {
      onGenerated()
      toast.success("Generation started — it'll appear in this list once it's ready")
      onOpenChange(false)
      setGenerateTitle("")
      setQuestionCount(5)
      setSelectedMaterials([])
    },
  })
  const submitGenerate = () => {
    if (!generateTitle.trim() || selectedMaterials.length === 0 || questionCount < 1) return
    generateQuiz.mutate({ materialIds: selectedMaterials, questionCount, title: generateTitle.trim() })
  }

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
      <DialogHeader><DialogTitle>Generate quiz with AI</DialogTitle><DialogDescription>Pick materials to generate multiple-choice questions from.</DialogDescription></DialogHeader>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2"><Label htmlFor="generate-title">Title</Label><Input id="generate-title" value={generateTitle} onChange={(e) => setGenerateTitle(e.target.value)} placeholder="Generated quiz title" /></div>
        <div className="flex flex-col gap-2"><Label htmlFor="question-count">Question count</Label><Input id="question-count" type="number" min={1} value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))} /></div>
        <div className="flex flex-col gap-2">
          <Label>Materials</Label>
          {materials.isLoading && <p className="text-sm text-muted-foreground">Loading materials...</p>}
          {materials.data?.length === 0 && <p className="text-sm text-muted-foreground">No materials found for this subject.</p>}
          {materials.data?.map((material) => <label key={material.id} className="flex items-center gap-3 rounded-md border p-3"><Checkbox checked={selectedMaterials.includes(material.id)} onCheckedChange={(checked) => setSelectedMaterials((old) => (checked === true ? [...old, material.id] : old.filter((id) => id !== material.id)))} /><span>{material.name}</span></label>)}
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button onClick={submitGenerate} disabled={!generateTitle.trim() || selectedMaterials.length === 0 || questionCount < 1 || generateQuiz.isPending}>{generateQuiz.isPending ? "Starting..." : "Generate"}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
}
