import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, FolderOpen, Loader2 } from "lucide-react";
import { RequireAuth } from "@/components/app/RequireAuth";
import { useAuth } from "@/lib/auth";
import { EmptyState } from "@/components/app/EmptyState";
import { QuizRunner, type QuizQuestion } from "@/components/app/QuizRunner";
import { getUserSubjects, exams, finalQuestionFiles, quizAttempts } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/quiz")({
  component: () => (
    <RequireAuth>
      <QuizPage />
    </RequireAuth>
  ),
});

function QuizPage() {
  const { user } = useAuth();
  if (!user) return null;

  if (user.role !== "student") {
    return <EmptyState title="Quizzes are for students" description="Only student accounts can take practice quizzes." />;
  }

  const subjects = getUserSubjects(user.id, user.role);
  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id ?? "");
  const [examType, setExamType] = useState<"midterm" | "final">("midterm");
  const [source, setSource] = useState<"folder" | "ai">("ai");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);

  if (subjects.length === 0) {
    return <EmptyState title="Nothing to quiz on yet" description="Enroll in a subject to start practicing." />;
  }

  const folderPoolEmpty = examType === "midterm"
    ? exams.filter((e) => e.subjectId === subjectId && e.type === "midterm").length === 0
    : finalQuestionFiles.filter((f) => f.subjectId === subjectId).length === 0;

  const start = () => {
    setLoading(true);
    setTimeout(() => {
      setQuestions(generateMockQuestions());
      setLoading(false);
    }, 900);
  };

  if (questions) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 text-2xl font-bold">Practice quiz</h1>
        <QuizRunner
          questions={questions}
          onFinish={(score, max) => {
            quizAttempts.unshift({
              id: `q_${Date.now()}`, studentId: user.id, subjectId, examType, source,
              score, maxScore: max, date: new Date().toISOString().slice(0, 10),
            });
            setQuestions(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Practice quiz</h1>
        <p className="text-sm text-muted-foreground">Set up a quick session. Results only count as practice.</p>
      </div>

      <Step n={1} title="Subject">
        <Select value={subjectId} onValueChange={setSubjectId}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </Step>

      <Step n={2} title="Exam type">
        <div className="grid grid-cols-2 gap-2">
          {(["midterm", "final"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setExamType(t)}
              className={`rounded-lg border px-3 py-2 text-sm capitalize transition ${examType === t ? "border-primary bg-primary/5 font-medium" : "hover:bg-muted"}`}
            >{t}</button>
          ))}
        </div>
      </Step>

      <Step n={3} title="Source">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => !folderPoolEmpty && setSource("folder")}
            disabled={folderPoolEmpty}
            className={`rounded-lg border px-3 py-3 text-left text-sm transition ${
              source === "folder" && !folderPoolEmpty ? "border-primary bg-primary/5" : "hover:bg-muted"
            } ${folderPoolEmpty ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <div className="flex items-center gap-2 font-medium"><FolderOpen className="h-4 w-4" />From folder</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {folderPoolEmpty ? "No files available for this exam type." : "Use uploaded exam files."}
            </div>
          </button>
          <button
            onClick={() => setSource("ai")}
            className={`rounded-lg border px-3 py-3 text-left text-sm transition ${source === "ai" ? "border-primary bg-primary/5" : "hover:bg-muted"}`}
          >
            <div className="flex items-center gap-2 font-medium"><Sparkles className="h-4 w-4" />AI generated</div>
            <div className="mt-0.5 text-xs text-muted-foreground">Fresh questions every time.</div>
          </button>
        </div>
      </Step>

      <Button onClick={start} disabled={loading} className="w-full">
        {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating questions…</>) : "Start quiz"}
      </Button>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-xs text-primary-foreground">{n}</span>
        {title}
      </div>
      {children}
    </div>
  );
}

function generateMockQuestions(): QuizQuestion[] {
  return [
    { id: "q1", prompt: "Which is a tautology?", options: ["p ∧ ¬p", "p ∨ ¬p", "p → ¬p", "¬(p ∨ p)"], correct: 1 },
    { id: "q2", prompt: "Time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], correct: 1 },
    { id: "q3", prompt: "SQL keyword for filtering rows?", options: ["SELECT", "GROUP BY", "WHERE", "ORDER BY"], correct: 2 },
    { id: "q4", prompt: "|A ∪ B| equals?", options: ["|A| + |B|", "|A| + |B| − |A ∩ B|", "|A| · |B|", "|A| − |B|"], correct: 1 },
    { id: "q5", prompt: "Best case of insertion sort?", options: ["O(n²)", "O(n log n)", "O(n)", "O(1)"], correct: 2 },
  ];
}
