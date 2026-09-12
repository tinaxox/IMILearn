import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correct: number;
}

export function QuizRunner({
  questions,
  onFinish,
}: {
  questions: QuizQuestion[];
  onFinish: (score: number, max: number) => void;
}) {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.correct ? 1 : 0), 0);

  if (submitted) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <div className="text-sm text-muted-foreground">{t("quiz.yourScore")}</div>
        <div className="mt-2 text-5xl font-bold">
          {score}
          <span className="text-2xl text-muted-foreground"> / {questions.length}</span>
        </div>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={() => onFinish(score, questions.length)}>{t("quiz.done")}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <div key={q.id} className="rounded-xl border bg-card p-5">
          <div className="text-sm font-semibold text-muted-foreground">
            {t("quiz.questionOf", { current: i + 1, total: questions.length })}
          </div>
          <div className="mt-1 text-base font-medium">{q.prompt}</div>
          <div className="mt-3 space-y-2">
            {q.options.map((opt, idx) => {
              const checked = answers[q.id] === idx;
              return (
                <label
                  key={idx}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                    checked ? "border-primary bg-primary/5" : "hover:bg-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    className="accent-primary"
                    checked={checked}
                    onChange={() => setAnswers({ ...answers, [q.id]: idx })}
                  />
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {t("quiz.answeredCount", { answered: answeredCount, total: questions.length })}
        </span>
        <Button disabled={answeredCount < questions.length} onClick={() => setSubmitted(true)}>
          {t("quiz.submitQuiz")}
        </Button>
      </div>
    </div>
  );
}
