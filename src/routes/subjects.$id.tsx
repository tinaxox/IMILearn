import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, FileText, Trash2, CalendarDays, BookOpen, Camera } from "lucide-react";
import { RequireAuth } from "@/components/app/RequireAuth";
import { useAuth } from "@/lib/auth";
import { RoleGuard } from "@/components/app/RoleGuard";
import { EmptyState } from "@/components/app/EmptyState";
import { FileUploader } from "@/components/app/FileUploader";
import { FileTable, type FileTableRow } from "@/components/app/FileTable";
import {
  getSubject, getSubjectRole, materials, exams, examResults, finalQuestionFiles,
  projectTeams, getSubjectStudents, subjectColorClasses, brandAccent, users, quizAttempts,
  assignments, assignmentSubmissions, setSubjectImage,
  type Material, type ExamAttempt, type Assignment, type Subject,
} from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScoreChip } from "@/components/app/ScoreChip";

export const Route = createFileRoute("/subjects/$id")({
  component: () => (
    <RequireAuth>
      <SubjectPage />
    </RequireAuth>
  ),
});

function SubjectPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const subject = getSubject(id);
  const [, force] = useState(0);
  const [tab, setTab] = useState("materials");

  if (!user) return null;
  if (!subject) return <div>Subject not found.</div>;

  const role = getSubjectRole(user.id, subject.id, user.role);
  if (!role) {
    return (
      <EmptyState
        title="You don't have access to this subject"
        description="Ask an admin to enroll you if you think this is a mistake."
        action={<Link to="/" className="text-sm text-primary hover:underline">Back to dashboard</Link>}
      />
    );
  }

  const c = subjectColorClasses[subject.color];
  const writer = role === "admin" || role === "professor" || role === "assistant";
  const userName = `${user.firstName} ${user.lastName}`;
  const myTeam = projectTeams.find((t) => t.subjectId === subject.id && t.memberIds.includes(user.id));
  const showProjectTab = writer || !!myTeam;

  return (
    <div className="space-y-5">
      <div className="-mx-3 -mt-5 border-b bg-[rgba(246,246,246,1)] px-3 py-5 md:-mx-5 md:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <SubjectImageUploader subject={subject} colorText={c.text} editable={writer} onChange={() => force((n) => n + 1)} />
            <div>
              <div className={`text-[10px] font-semibold uppercase tracking-wider ${c.text}`}>{subject.code}</div>
              <h1 className="text-2xl font-bold tracking-tight">{subject.name}</h1>
              <p className="text-sm text-muted-foreground">{subject.description}</p>
            </div>
          </div>
          <span className={`rounded-full ${c.bg} ${c.text} px-2.5 py-1 text-xs font-medium`}>Year {subject.year}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs value={tab} onValueChange={setTab}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <TabsList>
                <TabsTrigger value="materials">Materials</TabsTrigger>
                <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
                <TabsTrigger value="assignments">Assignments</TabsTrigger>
                {showProjectTab && <TabsTrigger value="project">Project</TabsTrigger>}
                {writer && <TabsTrigger value="students">Students</TabsTrigger>}
              </TabsList>
              {role === "student" && !myTeam && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    projectTeams.push({
                      id: `t_${Date.now()}`, subjectId: subject.id, name: `Team ${user.id.slice(-3)}`,
                      memberIds: [user.id], files: [],
                    });
                    force((n) => n + 1);
                    setTab("project");
                  }}
                >
                  <Plus className="mr-1.5 h-4 w-4" />Start a project
                </Button>
              )}
            </div>

            <TabsContent value="materials" className="mt-4">
              <MaterialsTab subjectId={subject.id} role={role} userName={userName} />
            </TabsContent>
            <TabsContent value="quizzes" className="mt-4">
              <QuizzesTab subjectId={subject.id} userId={user.id} role={role} />
            </TabsContent>
            <TabsContent value="assignments" className="mt-4">
              <AssignmentsTab subjectId={subject.id} role={role} userId={user.id} userName={userName} />
            </TabsContent>
            {showProjectTab && (
              <TabsContent value="project" className="mt-4">
                <ProjectTab subjectId={subject.id} role={role} userId={user.id} />
              </TabsContent>
            )}
            {writer && (
              <TabsContent value="students" className="mt-4">
                <StudentsTab subjectId={subject.id} />
              </TabsContent>
            )}
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-5">
            <SubjectExamsPanel subjectId={subject.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SubjectImageUploader({
  subject, colorText, editable, onChange,
}: {
  subject: Subject; colorText: string; editable: boolean; onChange: () => void;
}) {
  const inputId = `subject-image-${subject.id}`;

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setSubjectImage(subject.id, String(reader.result));
      onChange();
    };
    reader.readAsDataURL(file);
  };

  return (
    <span className="group/avatar relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-card shadow-sm">
      {subject.image ? (
        <img src={subject.image} alt="" className="h-full w-full object-cover" />
      ) : (
        <BookOpen className={`h-5 w-5 ${colorText}`} />
      )}
      {editable && (
        <label
          htmlFor={inputId}
          title="Change subject picture"
          className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 text-transparent transition group-hover/avatar:bg-black/40 group-hover/avatar:text-white"
        >
          <Camera className="h-4 w-4" />
          <input
            id={inputId}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </label>
      )}
    </span>
  );
}

// ------- Right-side exams panel (always visible) -------

function SubjectExamsPanel({ subjectId }: { subjectId: string }) {
  const upcoming = exams
    .filter((e) => e.subjectId === subjectId && new Date(e.date) >= new Date(new Date().toDateString()))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground">Upcoming Exams</h2>
      {upcoming.length === 0 ? (
        <p className="mt-3 text-sm text-white/70">No upcoming exams for this subject.</p>
      ) : (
        <div className="mt-3 space-y-1.5">
          {upcoming.map((e) => {
            const d = new Date(e.date);
            return (
              <div key={e.id} className="flex items-center gap-2.5 rounded-xl bg-card/95 py-2 text-card-foreground">
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${brandAccent.bg} ${brandAccent.text}`}>
                  <CalendarDays className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold">{e.name}</div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    {e.time ? ` · ${e.time}` : ""}
                    {e.room ? ` · ${e.room}` : ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ------- Quizzes -------

function QuizzesTab({ subjectId, userId, role }: { subjectId: string; userId: string; role: string }) {
  const mine = quizAttempts.filter((q) => q.subjectId === subjectId && (role !== "student" || q.studentId === userId));
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-muted-foreground">Practice quizzes</h3>
          <p className="text-xs text-muted-foreground">Generate quizzes from the exam pool or with AI.</p>
        </div>
        {role === "student" && (
          <Link to="/quiz" className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">
            Start a quiz
          </Link>
        )}
      </div>
      {mine.length === 0 ? (
        <EmptyState title="No quiz attempts yet" description="Attempts you take will appear here with your score." />
      ) : (
        <div className="space-y-2">
          {mine.map((q) => {
            const u = users.find((x) => x.id === q.studentId);
            return (
              <div key={q.id} className="flex flex-wrap items-center gap-3 rounded-xl border bg-card px-4 py-3">
                <div className="flex-1">
                  <div className="text-sm font-semibold capitalize">{q.examType} · {q.source === "ai" ? "AI-generated" : "From folder"}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(q.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    {role !== "student" && u ? ` · ${u.firstName} ${u.lastName}` : ""}
                  </div>
                </div>
                <ScoreChip score={q.score} max={q.maxScore} size="md" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ------- Materials (Lectures / Exercises / Midterm Exams / Final Exam) -------

function MaterialsTab({ subjectId, role, userName }: { subjectId: string; role: string; userName: string }) {
  return (
    <Accordion type="multiple" defaultValue={["lectures", "exercises"]} className="space-y-3">
      <AccordionItem value="lectures" className="rounded-xl border px-4 shadow-sm border-b-0!">
        <AccordionTrigger className="text-sm font-semibold">Lectures</AccordionTrigger>
        <AccordionContent>
          <MaterialFilesTab subjectId={subjectId} role={role} type="lecture" userName={userName} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="exercises" className="rounded-xl border px-4 shadow-sm border-b-0!">
        <AccordionTrigger className="text-sm font-semibold">Exercises</AccordionTrigger>
        <AccordionContent>
          <MaterialFilesTab subjectId={subjectId} role={role} type="exercise" userName={userName} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="midterms" className="rounded-xl border px-4 shadow-sm border-b-0!">
        <AccordionTrigger className="text-sm font-semibold">Midterm Exams</AccordionTrigger>
        <AccordionContent>
          <ExamTypeTab subjectId={subjectId} role={role} examType="midterm" userName={userName} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="final" className="rounded-xl border px-4 shadow-sm border-b-0!">
        <AccordionTrigger className="text-sm font-semibold">Final Exam</AccordionTrigger>
        <AccordionContent>
          <ExamTypeTab subjectId={subjectId} role={role} examType="final" userName={userName} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function MaterialFilesTab({ subjectId, role, type, userName }: { subjectId: string; role: string; type: Material["type"]; userName: string }) {
  const [, force] = useState(0);
  const list = materials.filter((m) => m.subjectId === subjectId && m.type === type);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

  const rows: FileTableRow[] = list.flatMap((m) => [
    ...m.files.map((f, i) => ({ id: `${m.id}-f${i}`, name: f.name, kind: f.kind, date: m.uploadedAt, by: m.uploadedBy })),
    ...m.recordings.map((f, i) => ({ id: `${m.id}-r${i}`, name: f.name, kind: f.kind, date: m.uploadedAt, by: m.uploadedBy })),
  ]);

  const label = type === "lecture" ? "lecture" : "exercise";

  return (
    <div className="space-y-3">
      <RoleGuard allow={["admin", "professor", "assistant"]} role={role}>
        <div className="flex justify-end">
          {!adding ? (
            <Button onClick={() => setAdding(true)} size="sm"><Plus className="mr-1.5 h-4 w-4" />Add {label}</Button>
          ) : (
            <div className="w-full rounded-xl border bg-card p-4">
              <div className="text-sm font-semibold">New {label}</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <FileUploader label="Choose PDF/slides" accept=".pdf,.ppt,.pptx" onFile={setFileName} />
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
                <Button
                  onClick={() => {
                    if (!title.trim()) return;
                    materials.push({
                      id: `m_${Date.now()}`, subjectId, title: title.trim(), type,
                      files: fileName ? [{ name: fileName, kind: "pdf" }] : [],
                      recordings: [],
                      uploadedAt: new Date().toISOString().slice(0, 10),
                      uploadedBy: userName,
                    });
                    setTitle(""); setFileName(null); setAdding(false); force((n) => n + 1);
                  }}
                >Add</Button>
              </div>
            </div>
          )}
        </div>
      </RoleGuard>

      <FileTable
        rows={rows}
        emptyTitle={`No ${label}s yet`}
        emptyDescription={`${type === "lecture" ? "Lecture" : "Exercise"} files will appear here once uploaded.`}
      />
    </div>
  );
}

// ------- Midterm Exams / Final Exam (inside Materials) -------

function ExamTypeTab({ subjectId, role, examType, userName }: { subjectId: string; role: string; examType: ExamAttempt["type"]; userName: string }) {
  const [, force] = useState(0);
  const list = exams.filter((e) => e.subjectId === subjectId && e.type === examType);
  const finalPool = examType === "final" ? finalQuestionFiles.filter((f) => f.subjectId === subjectId) : [];
  const [scoring, setScoring] = useState<ExamAttempt | null>(null);

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");

  // Midterm points are entered by assistants (or professors); the final exam's points are
  // entered by the professor only, since that's the component that finalizes the subject grade.
  const canEnterScores = examType === "midterm"
    ? role === "admin" || role === "professor" || role === "assistant"
    : role === "admin" || role === "professor";

  const poolRows: FileTableRow[] = finalPool.map((f) => ({ id: f.id, name: f.file.name, kind: f.file.kind, date: f.uploadedAt, by: f.uploadedBy }));
  const examRows: FileTableRow[] = list.flatMap((e) => [
    ...(e.questionsFile ? [{ id: `${e.id}-q`, name: e.questionsFile.name, kind: e.questionsFile.kind, date: e.date, by: e.uploadedBy ?? "Staff" }] : []),
    ...(e.solutionFile ? [{ id: `${e.id}-s`, name: e.solutionFile.name, kind: e.solutionFile.kind, date: e.date, by: e.uploadedBy ?? "Staff" }] : []),
  ]);

  return (
    <div className="space-y-6">
      <RoleGuard allow={["admin", "professor", "assistant"]} role={role}>
        <div className="flex flex-wrap justify-end gap-2">
          {examType === "final" && (
            <Button size="sm" variant="outline" onClick={() => {
              finalQuestionFiles.push({
                id: `fq_${Date.now()}`, subjectId, file: { name: "final-pool.pdf", kind: "pdf" },
                uploadedAt: new Date().toISOString().slice(0, 10), uploadedBy: userName,
              });
              force((n) => n + 1);
            }}>
              <Plus className="mr-1.5 h-4 w-4" />Add practice question pool
            </Button>
          )}
          {!adding ? (
            <Button size="sm" onClick={() => setAdding(true)}><Plus className="mr-1.5 h-4 w-4" />Add {examType}</Button>
          ) : (
            <div className="w-full rounded-xl border bg-card p-4">
              <div className="text-sm font-semibold">New {examType}</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Input placeholder={`Name (e.g. ${examType === "midterm" ? "Midterm 1" : "Final Exam"})`} value={name} onChange={(e) => setName(e.target.value)} />
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
                <Button onClick={() => {
                  if (!name.trim()) return;
                  exams.push({
                    id: `e_${Date.now()}`, subjectId, type: examType, name: name.trim(),
                    date: date || new Date().toISOString().slice(0, 10),
                    uploadedBy: userName,
                    questionsFile: { name: `${name}-questions.pdf`, kind: "pdf" },
                    solutionFile: { name: `${name}-solution.pdf`, kind: "pdf" },
                  });
                  setName(""); setDate(""); setAdding(false); force((n) => n + 1);
                }}>Add</Button>
              </div>
            </div>
          )}
        </div>
      </RoleGuard>

      <FileTable rows={examRows} emptyTitle={`No ${examType} materials yet`} />

      {examType === "final" && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground">Practice question pool</h3>
          <div className="mt-2">
            <FileTable rows={poolRows} emptyTitle="No practice pool uploaded yet" />
          </div>
        </div>
      )}

      {canEnterScores && list.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground">Enter points</h3>
          <p className="text-xs text-muted-foreground">
            {examType === "midterm" ? "Filled in by the assistant or professor." : "Filled in by the professor — this determines the final subject grade."}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {list.map((e) => (
              <Button key={e.id} size="sm" variant="outline" onClick={() => setScoring(e)}>{e.name}</Button>
            ))}
          </div>
        </div>
      )}

      {scoring && <ScoreEntry exam={scoring} onClose={() => { setScoring(null); force((n) => n + 1); }} />}
    </div>
  );
}

function ScoreEntry({ exam, onClose }: { exam: ExamAttempt; onClose: () => void }) {
  const students = getSubjectStudents(exam.subjectId);
  const [drafts, setDrafts] = useState<Record<string, { score: string; max: string }>>(() => {
    const map: Record<string, { score: string; max: string }> = {};
    for (const s of students) {
      const existing = examResults.find((r) => r.examId === exam.id && r.studentId === s.id);
      map[s.id] = { score: existing ? String(existing.score) : "", max: existing ? String(existing.maxScore) : "25" };
    }
    return map;
  });

  const save = () => {
    for (const s of students) {
      const d = drafts[s.id];
      const score = parseFloat(d.score);
      const max = parseFloat(d.max);
      if (Number.isFinite(score) && Number.isFinite(max) && score <= max) {
        const idx = examResults.findIndex((r) => r.examId === exam.id && r.studentId === s.id);
        const row = { examId: exam.id, studentId: s.id, score, maxScore: max };
        if (idx >= 0) examResults[idx] = row;
        else examResults.push(row);
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-card p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Enter scores</div>
            <div className="text-lg font-semibold">{exam.name}</div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
        <div className="mt-4 space-y-2">
          {students.map((s) => (
            <div key={s.id} className="grid grid-cols-[1fr_80px_80px] items-center gap-2">
              <div className="text-sm">{s.firstName} {s.lastName}</div>
              <Input value={drafts[s.id].score} onChange={(e) => setDrafts({ ...drafts, [s.id]: { ...drafts[s.id], score: e.target.value } })} placeholder="score" />
              <Input value={drafts[s.id].max} onChange={(e) => setDrafts({ ...drafts, [s.id]: { ...drafts[s.id], max: e.target.value } })} placeholder="max" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save}>Save</Button>
        </div>
      </div>
    </div>
  );
}

// ------- Assignments -------

function AssignmentsTab({ subjectId, role, userId, userName }: { subjectId: string; role: string; userId: string; userName: string }) {
  const [, force] = useState(0);
  const list = assignments.filter((a) => a.subjectId === subjectId);
  const isStaff = role !== "student";

  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [attachment, setAttachment] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {isStaff && (
        <div className="flex justify-end">
          {!creating ? (
            <Button size="sm" onClick={() => setCreating(true)}><Plus className="mr-1.5 h-4 w-4" />New assignment</Button>
          ) : (
            <div className="w-full space-y-2 rounded-xl border bg-card p-4">
              <div className="text-sm font-semibold">New assignment</div>
              <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea placeholder="Instructions" value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={3} />
              <div className="flex flex-wrap items-center gap-3">
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-auto" />
                <FileUploader label="Attach reference file" onFile={setAttachment} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
                <Button
                  onClick={() => {
                    if (!title.trim() || !instructions.trim()) return;
                    assignments.push({
                      id: `a_${Date.now()}`, subjectId, title: title.trim(), instructions: instructions.trim(),
                      postedAt: new Date().toISOString().slice(0, 10), postedBy: userName,
                      dueDate: dueDate || undefined, allowMultipleSubmissions: true,
                      attachment: attachment ? { name: attachment, kind: "other" } : undefined,
                    });
                    setTitle(""); setInstructions(""); setDueDate(""); setAttachment(null); setCreating(false); force((n) => n + 1);
                  }}
                >Post</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState
          title="No assignments yet"
          description={isStaff ? "Post an assignment for your students." : "Your professor hasn't posted any assignments for this subject yet."}
        />
      ) : (
        <div className="space-y-4">
          {list.map((a) => (
            <AssignmentCard key={a.id} assignment={a} role={role} userId={userId} onChange={() => force((n) => n + 1)} />
          ))}
        </div>
      )}
    </div>
  );
}

function AssignmentCard({ assignment, role, userId, onChange }: { assignment: Assignment; role: string; userId: string; onChange: () => void }) {
  const isStaff = role !== "student";
  const mySubmissions = assignmentSubmissions
    .filter((s) => s.assignmentId === assignment.id && s.studentId === userId)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  const mySubmission = mySubmissions[0];
  const allSubs = assignmentSubmissions.filter((s) => s.assignmentId === assignment.id);

  const [text, setText] = useState("");
  const [file, setFile] = useState<string | null>(null);

  const submit = () => {
    if (!text.trim() && !file) return;
    assignmentSubmissions.push({
      id: `as_${Date.now()}`, assignmentId: assignment.id, studentId: userId,
      submittedAt: new Date().toISOString().slice(0, 10),
      text: text.trim() || undefined,
      file: file ? { name: file, kind: "pdf" } : undefined,
    });
    setText(""); setFile(null); onChange();
  };

  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{assignment.title}</h3>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {assignment.dueDate && `Due ${new Date(assignment.dueDate).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })} · `}
            {assignment.allowMultipleSubmissions ? "Multiple submissions allowed" : "Single submission"}
          </div>
        </div>
        {!isStaff && (
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${mySubmission ? "bg-[rgb(208,250,230)] text-[rgb(0,85,50)]" : "bg-muted text-muted-foreground"}`}>
            {mySubmission ? "Handed in" : "Not handed in"}
          </span>
        )}
      </div>

      <div className="mt-3">
        <div className="mb-1 text-sm font-semibold text-muted-foreground">Instructions</div>
        <p className="text-sm">{assignment.instructions}</p>
      </div>

      {assignment.attachment && (
        <div className="mt-3">
          <div className="mb-1 text-sm font-semibold text-muted-foreground">Reference materials</div>
          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />{assignment.attachment.name}
          </div>
        </div>
      )}

      {!isStaff && (
        <div className="mt-4 rounded-xl border border-dashed p-4">
          <div className="text-sm font-semibold text-muted-foreground">Your submission</div>
          {mySubmission && (
            <div className="mt-2 rounded-lg bg-muted/50 px-3 py-2 text-sm">
              {mySubmission.text && <p>{mySubmission.text}</p>}
              {mySubmission.file && (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />{mySubmission.file.name}
                </div>
              )}
              <div className="mt-1 text-[11px] text-muted-foreground">
                Submitted {new Date(mySubmission.submittedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </div>
            </div>
          )}
          <div className="mt-5 space-y-8">
            <Textarea placeholder="Write your answer (optional)" value={text} onChange={(e) => setText(e.target.value)} rows={2} />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <FileUploader label="Attach file / image" accept=".pdf,.png,.jpg,.jpeg,.zip,.doc,.docx" onFile={setFile} />
              <Button size="sm" onClick={submit}>{mySubmission ? "Hand in again" : "Hand in"}</Button>
            </div>
          </div>
        </div>
      )}

      {isStaff && (
        <div className="mt-4">
          <div className="mb-1.5 text-sm font-semibold text-muted-foreground">
            Submissions ({allSubs.length})
          </div>
          {allSubs.length === 0 ? (
            <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">No submissions yet.</div>
          ) : (
            <div className="space-y-1.5">
              {allSubs.map((s) => {
                const u = users.find((x) => x.id === s.studentId);
                return (
                  <div key={s.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm">
                    <span className="font-medium">{u ? `${u.firstName} ${u.lastName}` : s.studentId}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(s.submittedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                    {s.file && (
                      <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="h-3 w-3" />{s.file.name}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ------- Project -------

function ProjectTab({ subjectId, role, userId }: { subjectId: string; role: string; userId: string }) {
  const [, force] = useState(0);
  const teams = projectTeams.filter((t) => t.subjectId === subjectId);
  const myTeam = teams.find((t) => t.memberIds.includes(userId));
  const students = getSubjectStudents(subjectId);

  if (role === "student") {
    if (!myTeam) return null;

    return (
      <div className="space-y-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{myTeam.name}</h3>
            <span className="text-xs text-muted-foreground">{myTeam.memberIds.length} member{myTeam.memberIds.length === 1 ? "" : "s"}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {myTeam.memberIds.map((mid) => {
              const u = users.find((x) => x.id === mid);
              return <span key={mid} className="rounded-full bg-muted px-3 py-1 text-xs">{u ? `${u.firstName} ${u.lastName}` : mid}</span>;
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <FileUploader label="Upload project file" onFile={(name) => { myTeam.files.push({ name, kind: "pdf" }); force((n) => n + 1); }} />
            <Select
              value=""
              onValueChange={(v) => {
                if (v) {
                  myTeam.memberIds.push(v);
                  force((n) => n + 1);
                }
              }}
            >
              <SelectTrigger className="h-8 w-auto gap-1.5 text-sm">
                <SelectValue placeholder="Add teammate…" />
              </SelectTrigger>
              <SelectContent>
                {students.filter((s) => !myTeam.memberIds.includes(s.id)).map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-3 space-y-1">
            {myTeam.files.length === 0 && <div className="text-sm text-muted-foreground">No files uploaded yet.</div>}
            {myTeam.files.map((f) => (
              <div key={f.name} className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-sm">
                <FileText className="h-3.5 w-3.5" />{f.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {teams.length === 0 && <EmptyState title="No teams yet" description="Students haven't created teams for this subject." />}
      {teams.map((t) => (
        <div key={t.id} className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{t.name}</h3>
            <button onClick={() => { const i = projectTeams.indexOf(t); if (i >= 0) projectTeams.splice(i, 1); force((n) => n + 1); }} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {t.memberIds.map((mid) => {
              const u = users.find((x) => x.id === mid);
              return <span key={mid} className="rounded-full bg-muted px-3 py-1 text-xs">{u ? `${u.firstName} ${u.lastName}` : mid}</span>;
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {t.files.map((f) => (
              <span key={f.name} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs"><FileText className="h-3 w-3" />{f.name}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ------- Students (staff view) -------

function StudentsTab({ subjectId }: { subjectId: string }) {
  const students = getSubjectStudents(subjectId);
  const subjectExams = exams.filter((e) => e.subjectId === subjectId);
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/60 text-left text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-2.5">Student</th>
            {subjectExams.map((e) => <th key={e.id} className="px-4 py-2.5 text-right">{e.name}</th>)}
            <th className="px-4 py-2.5 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {students.map((s) => {
            const scores = subjectExams.map((e) => examResults.find((r) => r.examId === e.id && r.studentId === s.id));
            const total = scores.reduce((a, r) => a + (r?.score ?? 0), 0);
            return (
              <tr key={s.id}>
                <td className="px-4 py-2.5 font-medium">{s.firstName} {s.lastName}</td>
                {scores.map((r, i) => <td key={i} className="px-4 py-2.5 text-right"><ScoreChip score={r?.score} max={r?.maxScore} /></td>)}
                <td className="px-4 py-2.5 text-right font-semibold">{total}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
