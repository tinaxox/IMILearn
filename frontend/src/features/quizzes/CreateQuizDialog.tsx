import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api-client"
import type { Quiz, QuizRequest } from "@/types/api"

type DraftQuestion = { id: string; text: string; options: string[]; correctIndex: number }
const newQuestion = (): DraftQuestion => ({ id: `q-${Date.now()}-${Math.random()}`, text: "", options: ["", ""], correctIndex: 0 })

interface CreateQuizDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subjectId: number
  onCreated: () => void
}

export function CreateQuizDialog({ open, onOpenChange, subjectId, onCreated }: CreateQuizDialogProps) {
  const [title, setTitle] = useState("")
  const [questions, setQuestions] = useState<DraftQuestion[]>([newQuestion()])
  const createQuiz = useMutation({
    mutationFn: async (body: QuizRequest) => (await apiClient.post<Quiz>("/quizzes", body)).data,
    onSuccess: () => {
      onCreated()
      toast.success("Quiz created")
      onOpenChange(false)
      setTitle("")
      setQuestions([newQuestion()])
    },
  })

  const updateQuestion = (id: string, update: Partial<DraftQuestion>) =>
    setQuestions((items2) => items2.map((q) => (q.id === id ? { ...q, ...update } : q)))
  const updateOption = (questionId: string, index: number, value: string) =>
    setQuestions((items2) => items2.map((q) => (q.id === questionId ? { ...q, options: q.options.map((option, i) => (i === index ? value : option)) } : q)))
  const canSubmitCreate = title.trim() && questions.length > 0 && questions.every((q) => q.text.trim() && q.options.length >= 2 && q.options.every((option) => option.trim()) && q.correctIndex < q.options.length)
  const submitCreate = () => {
    if (!canSubmitCreate) return
    createQuiz.mutate({
      title: title.trim(),
      subjectId,
      questions: questions.map(({ text, options }) => ({ text: text.trim(), options: options.map((label, index) => ({ index, label: label.trim() })) })),
      correctOptionIndexes: questions.map((q) => q.correctIndex),
    })
  }

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
      <DialogHeader><DialogTitle>Create quiz</DialogTitle><DialogDescription>Write questions and mark the correct option for each one.</DialogDescription></DialogHeader>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2"><Label htmlFor="quiz-title">Title</Label><Input id="quiz-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Quiz title" /></div>
        {questions.map((question, questionIndex) => (
          <div key={question.id} className="flex flex-col gap-3 rounded-lg border p-4">
            <div className="flex items-center justify-between gap-2"><Label>Question {questionIndex + 1}</Label><Button type="button" variant="ghost" size="sm" disabled={questions.length === 1} onClick={() => setQuestions((items2) => items2.filter((q) => q.id !== question.id))}>Remove</Button></div>
            <Input value={question.text} onChange={(e) => updateQuestion(question.id, { text: e.target.value })} placeholder="Question text" />
            <div className="flex flex-col gap-2">
              {question.options.map((option, optionIndex) => (
                <div key={`${question.id}-${optionIndex}`} className="flex items-center gap-2">
                  <input type="radio" name={`correct-${question.id}`} checked={question.correctIndex === optionIndex} onChange={() => updateQuestion(question.id, { correctIndex: optionIndex })} aria-label={`Mark option ${optionIndex + 1} correct`} />
                  <Input value={option} onChange={(e) => updateOption(question.id, optionIndex, e.target.value)} placeholder={`Option ${optionIndex + 1}`} />
                  <Button type="button" variant="ghost" size="sm" disabled={question.options.length <= 2} onClick={() => updateQuestion(question.id, { options: question.options.filter((_, i) => i !== optionIndex), correctIndex: question.correctIndex === optionIndex ? 0 : question.correctIndex > optionIndex ? question.correctIndex - 1 : question.correctIndex })}>Remove</Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => updateQuestion(question.id, { options: [...question.options, ""] })}>Add option</Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => setQuestions((items2) => [...items2, newQuestion()])}>Add question</Button>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button onClick={submitCreate} disabled={!canSubmitCreate || createQuiz.isPending}>{createQuiz.isPending ? "Creating..." : "Create quiz"}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
}
