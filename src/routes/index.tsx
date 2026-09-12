import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, ArrowUpRight, BookOpen, CalendarDays, Search, FileText, ListChecks, GraduationCap } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { RequireAuth } from "@/components/app/RequireAuth";
import { EmptyState } from "@/components/app/EmptyState";
import {
  getUserSubjects, subjectColorClasses, brandAccent, subjects, exams, examResults, materials, quizAttempts,
  type Subject, type User,
} from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/")({
  component: () => (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  ),
});

function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;
  const mySubjects = getUserSubjects(user.id, user.role);
  const [query, setQuery] = useState("");
  const filtered = mySubjects.filter((s) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    );
  });
  const today = new Date();
  const upcoming = exams
    .filter((e) => mySubjects.some((s) => s.id === e.subjectId) && new Date(e.date) >= new Date(today.toDateString()))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  return (
    <div className="flex h-full flex-col gap-4">
      {user.role !== "admin" && <WelcomeBanner user={user} subjectCount={mySubjects.length} />}

      {mySubjects.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title={user.role === "student" ? "You're not enrolled in any subjects yet" : "No subjects assigned yet"}
          description={user.role === "student"
            ? "Once your professor enrolls you, subjects will show up here."
            : "An admin will assign subjects to your account."}
        />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-7 lg:flex-row">
          <section className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-muted-foreground">
                {user.role === "admin" ? "All subjects" : user.role === "student" ? "Your subjects" : "Subjects you teach"}
              </h2>
              <div className="flex items-center gap-2">
                <div className="relative w-72 max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search subjects…"
                    className="pl-9"
                  />
                </div>
                {user.role === "admin" && <CreateSubjectButton />}
              </div>
            </div>
            {filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                No subjects match "{query}".
              </div>
            ) : (
              <div className="grid flex-1 auto-rows-min grid-cols-2 gap-3 overflow-y-auto pb-2 sm:grid-cols-3 xl:grid-cols-4">
                {filtered.map((s) => (
                  <SubjectCard key={s.id} subject={s} userId={user.id} globalRole={user.role} />
                ))}
              </div>
            )}
          </section>

          <div className="shrink-0 lg:w-72">
            <div className="space-y-4 lg:sticky lg:top-5">
              {upcoming.length > 0 && <UpcomingTests upcoming={upcoming} mySubjects={mySubjects} />}
              <ContinueWhereYouLeftOff mySubjects={mySubjects} userId={user.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WelcomeBanner({ user, subjectCount }: { user: User; subjectCount: number }) {
  if (user.role === "admin") return null;

  const dateStr = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="-mx-3 -mt-5 border-b bg-[rgba(246,246,246,1)] px-3 py-5 md:-mx-5 md:px-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-card shadow-sm">
            <GraduationCap className="h-5 w-5 text-[rgb(0,83,80)]" />
          </span>
          <div>
            <div className="text-[10px] font-semibold text-[rgb(0,83,80)]">{dateStr}</div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user.firstName}</h1>
            <p className="text-sm text-muted-foreground">Here's what's happening with your studies today.</p>
          </div>
        </div>
        {user.role !== "student" && (
          <span className="rounded-full bg-[rgb(214,242,255)] px-2.5 py-1 text-xs font-medium text-[rgb(0,68,149)]">
            Subjects {subjectCount}
          </span>
        )}
      </div>
    </div>
  );
}

function UpcomingTests({ upcoming, mySubjects }: { upcoming: ReturnType<typeof exams.filter>; mySubjects: Subject[] }) {
  return (
    <div className="max-h-64 rounded-3xl bg-[rgba(246,246,246,1)] p-3 shadow-sm">
      <h2 className="px-1 text-sm font-semibold text-muted-foreground">Upcoming Tests</h2>
      <div className="-mx-1 mt-2 max-h-52 space-y-1.5 overflow-y-auto px-1 pt-1 pb-1">
        {upcoming.map((e) => {
          const s = mySubjects.find((x) => x.id === e.subjectId);
          const d = new Date(e.date);
          return (
            <Link
              key={e.id}
              to="/subjects/$id"
              params={{ id: e.subjectId }}
              className="flex items-center gap-2 rounded-xl bg-card px-2 py-1.5 text-card-foreground shadow-sm transition hover:bg-muted"
            >
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${brandAccent.bg} ${brandAccent.text}`}>
                <CalendarDays className="h-3 w-3" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold">{e.name}</div>
                <div className="truncate text-[11px] text-muted-foreground">
                  {s?.name} · {d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </div>
              </div>
              <ArrowUpRight className="h-3 w-3 shrink-0 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function ContinueWhereYouLeftOff({ mySubjects, userId }: { mySubjects: Subject[]; userId: string }) {
  type Item = { id: string; kind: "Lecture" | "Exercise" | "Quiz"; title: string; subjectId: string; date: string };

  const materialItems: Item[] = materials
    .filter((m) => mySubjects.some((s) => s.id === m.subjectId))
    .map((m) => ({ id: m.id, kind: m.type === "lecture" ? "Lecture" : "Exercise", title: m.title, subjectId: m.subjectId, date: m.uploadedAt }));

  const quizItems: Item[] = quizAttempts
    .filter((q) => q.studentId === userId)
    .map((q) => ({ id: q.id, kind: "Quiz", title: `${q.examType[0].toUpperCase()}${q.examType.slice(1)} practice quiz`, subjectId: q.subjectId, date: q.date }));

  const items = [...materialItems, ...quizItems]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);

  const kindIcon = { Lecture: FileText, Exercise: FileText, Quiz: ListChecks };
  const kindAccent = {
    Lecture: { bg: "bg-[rgb(255,238,197)]", text: "text-[rgb(119,48,0)]" },
    Exercise: { bg: "bg-[rgb(255,238,197)]", text: "text-[rgb(119,48,0)]" },
    Quiz: brandAccent,
  };

  return (
    <div className="max-h-64 rounded-3xl bg-[rgba(246,246,246,1)] p-3 shadow-sm">
      <h2 className="px-1 text-sm font-semibold text-muted-foreground">Continue Where You Left Off</h2>
      {items.length === 0 ? (
        <p className="mt-2 px-1 text-xs text-muted-foreground">Nothing recent yet.</p>
      ) : (
        <div className="-mx-1 mt-2 max-h-52 space-y-1.5 overflow-y-auto px-1 pt-1 pb-1">
          {items.map((item) => {
            const s = mySubjects.find((x) => x.id === item.subjectId);
            const Icon = kindIcon[item.kind];
            const accent = kindAccent[item.kind];
            return (
              <Link
                key={item.id}
                to="/subjects/$id"
                params={{ id: item.subjectId }}
                className="flex items-center gap-2 rounded-xl bg-card px-2 py-1.5 text-card-foreground shadow-sm transition hover:bg-muted"
              >
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${accent.bg} ${accent.text}`}>
                  <Icon className="h-3 w-3" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold">{item.title}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{item.kind} · {s?.name}</div>
                </div>
                <ArrowUpRight className="h-3 w-3 shrink-0 text-muted-foreground" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SubjectCard({ subject, userId, globalRole }: { subject: Subject; userId: string; globalRole: "admin" | "professor" | "assistant" | "student" }) {
  const c = subjectColorClasses[subject.color];
  const sExams = exams.filter((e) => e.subjectId === subject.id);
  const recentResults = examResults.filter((r) => r.studentId === userId && sExams.some((e) => e.id === r.examId));
  const materialsCount = materials.filter((m) => m.subjectId === subject.id).length;
  const upcomingCount = sExams.filter((e) => new Date(e.date) >= new Date(new Date().toDateString())).length;

  const latestResult = recentResults.length > 0
    ? recentResults
        .map((r) => ({ r, exam: sExams.find((e) => e.id === r.examId) }))
        .sort((a, b) => (b.exam?.date ?? "").localeCompare(a.exam?.date ?? ""))[0]
    : null;

  return (
    <Link
      to="/subjects/$id"
      params={{ id: subject.id }}
      className="group flex min-h-[11rem] flex-col rounded-2xl bg-[rgba(246,246,246,1)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-[rgba(232,232,232,1)] hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-card shadow-sm">
          {subject.image ? (
            <img src={subject.image} alt="" className="h-full w-full object-cover" />
          ) : (
            <BookOpen className={`h-4 w-4 ${c.text}`} />
          )}
        </div>
        <span className={`rounded-full ${c.bg} ${c.text} px-2 py-0.5 text-[10px] font-medium`}>Year {subject.year}</span>
      </div>

      <h3 className="mt-3 line-clamp-2 min-h-[2.5rem] text-base font-bold leading-tight">{subject.name}</h3>

      {globalRole === "student" ? (
        <div className="mt-auto flex items-center justify-between pt-3 text-xs">
          <span className="text-muted-foreground">Latest Score</span>
          <span className="font-semibold tabular-nums">
            {latestResult ? `${latestResult.r.score}/${latestResult.r.maxScore}` : "—"}
          </span>
        </div>
      ) : (
        <div className="mt-auto space-y-1 pt-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Materials</span>
            <span className="font-semibold tabular-nums">{materialsCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Upcoming</span>
            <span className="font-semibold tabular-nums">{upcomingCount}</span>
          </div>
        </div>
      )}
    </Link>
  );
}

function CreateSubjectButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState<Subject["year"]>(1);
  const colors: Subject["color"][] = ["blue", "sky", "violet", "emerald", "amber", "rose"];

  const create = () => {
    if (!name.trim()) return;
    subjects.push({
      id: `s_${Date.now()}`,
      name: name.trim(),
      code: `IMI-${100 + subjects.length}`,
      description: description.trim() || "New subject.",
      year,
      color: colors[subjects.length % colors.length],
      espb: 6,
    });
    setName("");
    setDescription("");
    setYear(1);
    setOpen(false);
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-1.5 h-4 w-4" /> Create subject
      </Button>
    );
  }

  return (
    <div className="w-full max-w-md rounded-xl border bg-card p-4 shadow-sm">
      <div className="text-sm font-semibold">New subject</div>
      <div className="mt-3 space-y-2">
        <Input placeholder="Subject name" value={name} onChange={(e) => setName(e.target.value)} />
        <Textarea placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        <Select value={String(year)} onValueChange={(v) => setYear(Number(v) as Subject["year"])}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Year 1</SelectItem>
            <SelectItem value="2">Year 2</SelectItem>
            <SelectItem value="3">Year 3</SelectItem>
            <SelectItem value="4">Year 4</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
        <Button onClick={create}>Create</Button>
      </div>
    </div>
  );
}
