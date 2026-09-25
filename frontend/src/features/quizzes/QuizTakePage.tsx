import { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { apiClient } from "@/lib/api-client"
import type { Quiz, QuizQuestion, QuizSubmission, SubmitQuizRequest } from "@/types/api"
import { BackButton } from "@/components/layout/BackButton"

type QuizSubmitResult = Pick<QuizSubmission, "score" | "correctCount" | "totalQuestions" | "result">

function optionLabel(question: QuizQuestion, optionIndex: number | null): string {
  if (optionIndex === null) return "Not answered"
  return question.options.find((option) => option.index === optionIndex)?.label ?? "Not answered"
}

export default function QuizTakePage() {
  const { quizId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const id = Number(quizId)
  const submissionId = Number(searchParams.get("submission"))
  const isReviewMode = Number.isInteger(submissionId) && submissionId > 0
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [result, setResult] = useState<QuizSubmitResult | null>(null)

  const quiz = useQuery({
    queryKey: ["quiz", id],
    queryFn: async () => (await apiClient.get<Quiz>(`/quizzes/${id}`)).data,
    enabled: Number.isFinite(id),
  })

  const reviewedSubmission = useQuery({
    queryKey: ["quiz-submission", submissionId],
    queryFn: async () => (await apiClient.get<QuizSubmission>(`/quizzes/submissions/${submissionId}`)).data,
    enabled: isReviewMode,
  })

  const submit = useMutation({
    mutationFn: async (body: SubmitQuizRequest) => (await apiClient.post<QuizSubmitResult>(`/quizzes/${id}/submit`, body)).data,
    onSuccess: setResult,
  })

  if (quiz.isLoading || (isReviewMode && reviewedSubmission.isLoading)) return <p className="text-muted-foreground">Loading quiz...</p>
  if (!quiz.data) return <p className="text-muted-foreground">Quiz not found.</p>
  if (isReviewMode && (!reviewedSubmission.data || reviewedSubmission.data.quizId !== id)) {
    return <p className="text-muted-foreground">Quiz attempt not found.</p>
  }
  const currentQuiz = quiz.data
  const displayedResult = isReviewMode ? reviewedSubmission.data : result

  const handleSubmit = () => {
    const submittedOptionIndexes = currentQuiz.questions.map((_, index) => answers[index] ?? null)
    submit.mutate({ submittedOptionIndexes })
  }

  const answeredCount = Object.keys(answers).length

  const startAgain = () => {
    setAnswers({})
    setResult(null)
    navigate(`/quizzes/${id}/take`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="page-heading">
        <div className="w-full">
          <BackButton label={isReviewMode ? "Back to scores" : "Back to quizzes"} />
          <h1>{currentQuiz.title}</h1>
          <p>{currentQuiz.questions.length} questions</p>
          {!displayedResult && (
            <div className="mt-4 flex max-w-xl items-center gap-3">
              <Progress value={currentQuiz.questions.length ? (answeredCount / currentQuiz.questions.length) * 100 : 0} className="flex-1" />
              <span className="text-sm text-muted-foreground">{answeredCount} of {currentQuiz.questions.length} answered</span>
            </div>
          )}
        </div>
      </div>

      {displayedResult ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Results: {displayedResult.correctCount}/{displayedResult.totalQuestions} ({displayedResult.score}%)</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Points: {displayedResult.correctCount} / {displayedResult.totalQuestions}</p>
            </div>
            <Button onClick={startAgain}>Start again</Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {displayedResult.result.map((entry) => {
              const question = currentQuiz.questions[entry.questionIndex]
              return (
                <div key={entry.questionIndex} className="rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">{entry.questionIndex + 1}. {question?.text ?? `Question ${entry.questionIndex + 1}`}</p>
                    <span className={entry.correct ? "text-emerald-700" : "text-red-700"}>
                      {entry.correct ? "1 point" : "0 points"}
                    </span>
                  </div>
                  {question && (
                    <RadioGroup className="mt-3" value={entry.submittedOptionIndex === null ? "" : String(entry.submittedOptionIndex)} disabled>
                      {question.options.map((option) => {
                        const isCorrectAnswer = option.index === entry.correctOptionIndex
                        const isSubmittedAnswer = option.index === entry.submittedOptionIndex
                        const optionId = `result-q${entry.questionIndex}-o${option.index}`
                        return (
                          <div key={optionId} className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${isCorrectAnswer ? "border-emerald-300 bg-emerald-50" : isSubmittedAnswer ? "border-red-300 bg-red-50" : "border-transparent"}`}>
                            <RadioGroupItem value={String(option.index)} id={optionId} />
                            <Label htmlFor={optionId} className="flex-1">{option.label}</Label>
                            {isCorrectAnswer && <span className="text-xs font-medium text-emerald-700">Correct answer</span>}
                            {isSubmittedAnswer && !isCorrectAnswer && <span className="text-xs font-medium text-red-700">Your answer</span>}
                          </div>
                        )
                      })}
                      {entry.submittedOptionIndex === null && <p className="text-sm text-muted-foreground">Your answer: {optionLabel(question, null)}</p>}
                    </RadioGroup>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {currentQuiz.questions.map((question, questionIndex) => (
              <Card key={questionIndex}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {questionIndex + 1}. {question.text}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={answers[questionIndex] !== undefined ? String(answers[questionIndex]) : ""}
                    onValueChange={(value) =>
                      setAnswers((old) => ({ ...old, [questionIndex]: Number(value) }))
                    }
                  >
                    {question.options.map((option) => {
                      const optionId = `q${questionIndex}-o${option.index}`
                      return (
                        <div key={optionId} className="flex items-center gap-2">
                          <RadioGroupItem value={String(option.index)} id={optionId} />
                          <Label htmlFor={optionId}>{option.label}</Label>
                        </div>
                      )
                    })}
                  </RadioGroup>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button className="self-start" onClick={handleSubmit} disabled={submit.isPending}>
            {submit.isPending ? "Submitting..." : "Submit quiz"}
          </Button>
        </>
      )}
    </div>
  )
}
