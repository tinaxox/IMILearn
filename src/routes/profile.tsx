import { createFileRoute } from "@tanstack/react-router";
import { UserCircle2, Layers, Star, GraduationCap } from "lucide-react";
import { RequireAuth } from "@/components/app/RequireAuth";
import { useAuth } from "@/lib/auth";
import { GradeTable } from "@/components/app/GradeTable";
import { EmptyState } from "@/components/app/EmptyState";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import {
  getUserSubjects, exams, examResults, quizAttempts, subjects as allSubjects,
  getEarnedEspb, getAverageScore, getStudyYear,
} from "@/lib/mock";

export const Route = createFileRoute("/profile")({
  component: () => (
    <RequireAuth>
      <ProfilePage />
    </RequireAuth>
  ),
});

function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  const mine = getUserSubjects(user.id, user.role);
  const attempts = quizAttempts.filter((q) => q.studentId === user.id);

  const stats = [
    { icon: Layers, label: "ESPB", value: String(getEarnedEspb(user.id)), bg: "bg-[rgb(214,242,255)]", text: "text-[rgb(0,68,149)]" },
    { icon: Star, label: "Score", value: getAverageScore(user.id)?.toFixed(1) ?? "—", bg: "bg-[rgb(208,250,230)]", text: "text-[rgb(0,85,50)]" },
    { icon: GraduationCap, label: "Year", value: String(getStudyYear(user)), bg: "bg-[rgb(240,233,255)]", text: "text-[rgb(81,43,146)]" },
  ];

  return (
    <div className="space-y-10">
      <div className="-mx-3 -mt-5 border-b bg-[rgba(246,246,246,1)] px-3 py-5 md:-mx-5 md:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-card shadow-sm">
              <UserCircle2 className="h-6 w-6 text-[rgb(0,83,80)]" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{user.firstName} {user.lastName}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {user.index && (
              <span className="rounded-full bg-[rgb(255,238,197)] px-2.5 py-1 text-xs font-medium text-[rgb(119,48,0)]">
                {user.index}
              </span>
            )}
            {stats.map((s) => (
              <span key={s.label} className={`rounded-full ${s.bg} ${s.text} px-2.5 py-1 text-xs font-medium`}>
                {s.label} {s.value}
              </span>
            ))}
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Official results</h2>
          <p className="text-sm text-muted-foreground">Grades entered by your professors and assistants.</p>
        </div>
        {mine.length === 0 ? (
          <EmptyState title="No enrolled subjects" />
        ) : (
          <Accordion type="multiple" className="space-y-3">
            {mine.map((s) => {
              const sExams = exams.filter((e) => e.subjectId === s.id);
              const sResults = examResults.filter((r) => sExams.some((e) => e.id === r.examId) && r.studentId === user.id);
              return (
                <AccordionItem key={s.id} value={s.id} className="rounded-xl border px-4 shadow-sm border-b-0!">
                  <AccordionTrigger className="text-sm font-semibold">{s.name}</AccordionTrigger>
                  <AccordionContent>
                    <GradeTable exams={sExams} results={sResults} />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Quiz practice history</h2>
          <span className="rounded-full bg-[rgb(255,238,197)] px-2 py-0.5 text-xs font-medium text-[rgb(119,48,0)]">
            Practice only
          </span>
        </div>
        <p className="text-sm text-muted-foreground">Doesn't affect your grade.</p>
        {attempts.length === 0 ? (
          <EmptyState title="No practice attempts yet" description="Head to Quiz to try one." />
        ) : (
          <div className="overflow-hidden rounded-lg border-2 border-dashed bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5">Subject</th>
                  <th className="px-4 py-2.5">Type</th>
                  <th className="px-4 py-2.5">Source</th>
                  <th className="px-4 py-2.5 text-right">Score</th>
                  <th className="px-4 py-2.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {attempts.map((a) => {
                  const s = allSubjects.find((x) => x.id === a.subjectId);
                  return (
                    <tr key={a.id}>
                      <td className="px-4 py-2.5">{s?.name ?? a.subjectId}</td>
                      <td className="px-4 py-2.5 capitalize">{a.examType}</td>
                      <td className="px-4 py-2.5 capitalize">{a.source}</td>
                      <td className="px-4 py-2.5 text-right">{a.score}/{a.maxScore}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{a.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
