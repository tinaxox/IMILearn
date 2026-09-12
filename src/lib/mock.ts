// Mock data for IMILearn UI-only prototype.
// All state lives in memory (with localStorage for the current user).

export type Role = "admin" | "professor" | "assistant" | "student";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role; // global role. For subject-specific role use enrollments.
  index?: string; // student index number, e.g. "148/2022"
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  year: 1 | 2 | 3 | 4; // study year this subject belongs to
  color: "blue" | "sky" | "violet" | "emerald" | "amber" | "rose";
  espb: number; // ECTS/ESPB credits awarded for passing this subject
  image?: string; // optional cover image (data URL) uploaded by a professor/assistant; falls back to a book icon when absent
}

export interface Enrollment {
  userId: string;
  subjectId: string;
  role: "professor" | "assistant" | "student";
}

export interface MaterialFile {
  name: string;
  kind: "pdf" | "slides" | "video" | "other";
}

export interface Material {
  id: string;
  subjectId: string;
  type: "exercise" | "lecture";
  title: string;
  files: MaterialFile[];
  recordings: MaterialFile[];
  uploadedAt: string;
  uploadedBy: string;
}

export interface ExamAttempt {
  id: string;
  subjectId: string;
  type: "midterm" | "final";
  name: string;
  date: string;
  time?: string;
  room?: string;
  questionsFile?: MaterialFile;
  solutionFile?: MaterialFile;
  uploadedBy?: string;
}

export interface ExamResult {
  examId: string;
  studentId: string;
  score: number;
  maxScore: number;
}

export interface FinalQuestionFile {
  id: string;
  subjectId: string;
  file: MaterialFile;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Assignment {
  id: string;
  subjectId: string;
  title: string;
  instructions: string;
  postedAt: string;
  postedBy: string;
  dueDate?: string;
  allowMultipleSubmissions: boolean;
  attachment?: MaterialFile;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt: string;
  text?: string;
  file?: MaterialFile;
}

export interface ProjectTeam {
  id: string;
  subjectId: string;
  name: string;
  memberIds: string[];
  files: MaterialFile[];
}

export interface QuizAttempt {
  id: string;
  studentId: string;
  subjectId: string;
  examType: "midterm" | "final";
  source: "folder" | "ai";
  score: number;
  maxScore: number;
  date: string;
}

// --------- Seed data ---------

export const users: User[] = [
  { id: "u_admin", firstName: "Ana", lastName: "Admin", email: "admin@imi.edu", role: "admin" },
  { id: "u_prof", firstName: "Petar", lastName: "Petrov", email: "prof@imi.edu", role: "professor" },
  { id: "u_asst", firstName: "Ivana", lastName: "Ivanova", email: "asst@imi.edu", role: "assistant" },
  { id: "u_stu1", firstName: "Marko", lastName: "Markov", email: "marko@imi.edu", role: "student", index: "148/2024" },
  { id: "u_stu2", firstName: "Elena", lastName: "Elenova", email: "elena@imi.edu", role: "student", index: "152/2025" },
];

export const subjects: Subject[] = [
  { id: "s_math", name: "Discrete Mathematics", code: "IMI-101", description: "Logic, sets, combinatorics, graphs.", year: 1, color: "blue", espb: 7 },
  { id: "s_stat", name: "Statistics & Probability", code: "IMI-150", description: "Distributions, inference, hypothesis testing.", year: 1, color: "rose", espb: 6 },
  { id: "s_web", name: "Web Development", code: "IMI-260", description: "HTTP, front-end frameworks, REST APIs.", year: 1, color: "violet", espb: 6 },
  { id: "s_algo", name: "Algorithms & Data Structures", code: "IMI-210", description: "Design and analysis of algorithms.", year: 2, color: "violet", espb: 8 },
  { id: "s_db", name: "Databases", code: "IMI-220", description: "Relational design, SQL, transactions.", year: 2, color: "emerald", espb: 6 },
  { id: "s_os", name: "Operating Systems", code: "IMI-240", description: "Processes, memory, concurrency, file systems.", year: 2, color: "sky", espb: 7 },
  { id: "s_net", name: "Computer Networks", code: "IMI-250", description: "Protocols, routing, sockets, the web stack.", year: 2, color: "amber", espb: 6 },
  { id: "s_ai", name: "Introduction to AI", code: "IMI-330", description: "Search, learning, and reasoning.", year: 3, color: "rose", espb: 6 },
  { id: "s_se", name: "Software Engineering", code: "IMI-310", description: "Design patterns, testing, team workflows.", year: 3, color: "blue", espb: 7 },
  { id: "s_gfx", name: "Computer Graphics", code: "IMI-340", description: "Rasterization, transforms, shading models.", year: 3, color: "emerald", espb: 6 },
];

// Marko (index 2024) is in his 2nd study year: allowed on year 1 & 2 subjects, not year 3.
// Elena (index 2025) is in her 1st study year: allowed only on year 1 subjects.
export const enrollments: Enrollment[] = [
  { userId: "u_prof", subjectId: "s_math", role: "professor" },
  { userId: "u_prof", subjectId: "s_algo", role: "professor" },
  { userId: "u_prof", subjectId: "s_se", role: "professor" },
  { userId: "u_asst", subjectId: "s_math", role: "assistant" },
  { userId: "u_asst", subjectId: "s_db", role: "assistant" },
  { userId: "u_asst", subjectId: "s_net", role: "assistant" },
  { userId: "u_stu1", subjectId: "s_math", role: "student" },
  { userId: "u_stu1", subjectId: "s_stat", role: "student" },
  { userId: "u_stu1", subjectId: "s_web", role: "student" },
  { userId: "u_stu1", subjectId: "s_algo", role: "student" },
  { userId: "u_stu1", subjectId: "s_db", role: "student" },
  { userId: "u_stu1", subjectId: "s_os", role: "student" },
  { userId: "u_stu1", subjectId: "s_net", role: "student" },
  { userId: "u_stu2", subjectId: "s_math", role: "student" },
  { userId: "u_stu2", subjectId: "s_stat", role: "student" },
  { userId: "u_stu2", subjectId: "s_web", role: "student" },
];

// Seed dates are anchored to "today" so exams/materials stay realistically
// past/upcoming no matter what day the app is opened.
function daysFromToday(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export const materials: Material[] = [
  {
    id: "m1", subjectId: "s_math", type: "lecture", title: "LFP 01 - Discrete Math - Intro",
    files: [{ name: "LFP 01 - Discrete Math - Intro.pdf", kind: "pdf" }],
    recordings: [{ name: "LFP 01 - recording.mp4", kind: "video" }],
    uploadedAt: daysFromToday(-75), uploadedBy: "Petar Petrov",
  },
  {
    id: "m2", subjectId: "s_math", type: "lecture", title: "LFP 02 - Sets & Functions",
    files: [{ name: "LFP 02 - Sets & Functions.pdf", kind: "pdf" }],
    recordings: [],
    uploadedAt: daysFromToday(-68), uploadedBy: "Petar Petrov",
  },
  {
    id: "m3", subjectId: "s_math", type: "exercise", title: "Exercise 1 - Truth tables",
    files: [{ name: "Exercise 1 - Truth tables.pdf", kind: "pdf" }],
    recordings: [],
    uploadedAt: daysFromToday(-70), uploadedBy: "Ivana Ivanova",
  },
  {
    id: "m4", subjectId: "s_algo", type: "lecture", title: "Lecture 1 - Big-O",
    files: [{ name: "Lecture 1 - Big-O.pdf", kind: "pdf" }], recordings: [],
    uploadedAt: daysFromToday(-50), uploadedBy: "Petar Petrov",
  },
  {
    id: "m5", subjectId: "s_algo", type: "exercise", title: "Exercise 1 - Sorting",
    files: [{ name: "Exercise 1 - Sorting.pdf", kind: "pdf" }], recordings: [],
    uploadedAt: daysFromToday(-48), uploadedBy: "Petar Petrov",
  },
  {
    id: "m6", subjectId: "s_db", type: "lecture", title: "Lecture 1 - Relational model",
    files: [{ name: "Lecture 1 - Relational model.pdf", kind: "pdf" }], recordings: [],
    uploadedAt: daysFromToday(-40), uploadedBy: "Ivana Ivanova",
  },
];

export const exams: ExamAttempt[] = [
  { id: "e1", subjectId: "s_math", type: "midterm", name: "Midterm 1", date: daysFromToday(-60), time: "10:00", room: "Hall A", uploadedBy: "Petar Petrov",
    questionsFile: { name: "M1-questions.pdf", kind: "pdf" }, solutionFile: { name: "M1-solution.pdf", kind: "pdf" } },
  { id: "e2", subjectId: "s_math", type: "midterm", name: "Midterm 2", date: daysFromToday(-30), time: "10:00", room: "Hall A", uploadedBy: "Petar Petrov",
    questionsFile: { name: "M2-questions.pdf", kind: "pdf" }, solutionFile: { name: "M2-solution.pdf", kind: "pdf" } },
  { id: "e3", subjectId: "s_math", type: "final", name: "Final Exam", date: daysFromToday(-10), time: "09:00", room: "Aula Magna", uploadedBy: "Petar Petrov",
    questionsFile: { name: "final-jan-questions.pdf", kind: "pdf" }, solutionFile: { name: "final-jan-solution.pdf", kind: "pdf" } },
  { id: "e4", subjectId: "s_algo", type: "midterm", name: "Midterm 1", date: daysFromToday(-45), time: "12:30", room: "Room 204", uploadedBy: "Petar Petrov",
    questionsFile: { name: "algo-m1.pdf", kind: "pdf" }, solutionFile: { name: "algo-m1-sol.pdf", kind: "pdf" } },
  { id: "e5", subjectId: "s_algo", type: "final", name: "Final Exam", date: daysFromToday(14), time: "09:00", room: "Aula Magna", uploadedBy: "Petar Petrov",
    questionsFile: { name: "algo-final.pdf", kind: "pdf" } },
  { id: "e6", subjectId: "s_db", type: "midterm", name: "Midterm 1", date: daysFromToday(7), time: "14:00", room: "Room 105", uploadedBy: "Ivana Ivanova",
    questionsFile: { name: "db-m1.pdf", kind: "pdf" }, solutionFile: { name: "db-m1-sol.pdf", kind: "pdf" } },
  { id: "e7", subjectId: "s_ai", type: "midterm", name: "Midterm 1", date: daysFromToday(3), time: "11:00", room: "Room 310", uploadedBy: "Ana Admin",
    questionsFile: { name: "ai-m1.pdf", kind: "pdf" } },
  { id: "e9", subjectId: "s_os", type: "midterm", name: "Midterm 1", date: daysFromToday(5), time: "10:00", room: "Room 212", uploadedBy: "Ana Admin",
    questionsFile: { name: "os-m1.pdf", kind: "pdf" } },
  { id: "e10", subjectId: "s_net", type: "midterm", name: "Midterm 1", date: daysFromToday(9), time: "13:00", room: "Room 118", uploadedBy: "Ivana Ivanova",
    questionsFile: { name: "net-m1.pdf", kind: "pdf" } },
  { id: "e11", subjectId: "s_stat", type: "midterm", name: "Midterm 1", date: daysFromToday(2), time: "09:30", room: "Hall B", uploadedBy: "Ana Admin",
    questionsFile: { name: "stat-m1.pdf", kind: "pdf" } },
  { id: "e12", subjectId: "s_web", type: "midterm", name: "Midterm 1", date: daysFromToday(11), time: "15:00", room: "Lab 3", uploadedBy: "Ana Admin",
    questionsFile: { name: "web-m1.pdf", kind: "pdf" } },
  { id: "e13", subjectId: "s_se", type: "midterm", name: "Midterm 1", date: daysFromToday(16), time: "11:30", room: "Room 305", uploadedBy: "Petar Petrov",
    questionsFile: { name: "se-m1.pdf", kind: "pdf" } },
  { id: "e14", subjectId: "s_gfx", type: "midterm", name: "Midterm 1", date: daysFromToday(18), time: "12:00", room: "Lab 1", uploadedBy: "Ana Admin",
    questionsFile: { name: "gfx-m1.pdf", kind: "pdf" } },
  { id: "e15", subjectId: "s_algo", type: "midterm", name: "Midterm 2", date: daysFromToday(25), time: "12:30", room: "Room 204", uploadedBy: "Petar Petrov",
    questionsFile: { name: "algo-m2.pdf", kind: "pdf" } },
  { id: "e16", subjectId: "s_db", type: "final", name: "Final Exam", date: daysFromToday(30), time: "09:00", room: "Aula Magna", uploadedBy: "Ivana Ivanova",
    questionsFile: { name: "db-final.pdf", kind: "pdf" } },
];

export const examResults: ExamResult[] = [
  { examId: "e1", studentId: "u_stu1", score: 18, maxScore: 25 },
  { examId: "e2", studentId: "u_stu1", score: 22, maxScore: 25 },
  { examId: "e3", studentId: "u_stu1", score: 40, maxScore: 50 },
  { examId: "e4", studentId: "u_stu1", score: 15, maxScore: 25 },
  { examId: "e1", studentId: "u_stu2", score: 20, maxScore: 25 },
  { examId: "e3", studentId: "u_stu2", score: 38, maxScore: 50 },
];

export const finalQuestionFiles: FinalQuestionFile[] = [
  { id: "fq1", subjectId: "s_math", file: { name: "final-question-pool.pdf", kind: "pdf" }, uploadedAt: daysFromToday(-20), uploadedBy: "Petar Petrov" },
];

export const projectTeams: ProjectTeam[] = [
  { id: "t1", subjectId: "s_algo", name: "Team Quicksort", memberIds: ["u_stu1"],
    files: [{ name: "proposal.pdf", kind: "pdf" }] },
];

export const assignments: Assignment[] = [
  {
    id: "a1", subjectId: "s_algo", title: "Sorting Benchmark Report",
    instructions: "Zadatak: Implementirati i uporediti performanse tri algoritma sortiranja (quicksort, mergesort, heapsort) nad velikim skupovima podataka. Priložiti kod i kratak izveštaj sa merenjima vremena izvršavanja.",
    postedAt: daysFromToday(-6), postedBy: "Petar Petrov",
    dueDate: daysFromToday(10),
    allowMultipleSubmissions: true,
    attachment: { name: "Task 1.zip", kind: "other" },
  },
  {
    id: "a2", subjectId: "s_db", title: "ER Diagram & Normalization",
    instructions: "Zadatak: Napraviti ER dijagram za zadati poslovni sistem (biblioteka) i normalizovati šemu do 3NF. Predati dijagram i SQL skriptu za kreiranje tabela.",
    postedAt: daysFromToday(-3), postedBy: "Ivana Ivanova",
    dueDate: daysFromToday(12),
    allowMultipleSubmissions: true,
    attachment: { name: "library-schema-brief.pdf", kind: "pdf" },
  },
  {
    id: "a3", subjectId: "s_web", title: "Bank Application Test Cases",
    instructions: "Zadatak: Napraviti test slučajeve (test cases) za web aplikaciju koja je razvijena za potrebe jedne banke. Pokriti scenarije prijave, transfera sredstava i validacije unosa.",
    postedAt: daysFromToday(-8), postedBy: "Ana Admin",
    dueDate: daysFromToday(-1),
    allowMultipleSubmissions: true,
    attachment: { name: "Task 1.zip", kind: "other" },
  },
  {
    id: "a4", subjectId: "s_math", title: "Proof Portfolio — Induction & Sets",
    instructions: "Zadatak: Rešiti 5 zadataka dokaza matematičkom indukcijom i 3 zadatka iz teorije skupova. Rukopis skenirati ili otkucati u PDF-u.",
    postedAt: daysFromToday(-1), postedBy: "Petar Petrov",
    dueDate: daysFromToday(9),
    allowMultipleSubmissions: false,
  },
];

export const assignmentSubmissions: AssignmentSubmission[] = [
  { id: "as1", assignmentId: "a1", studentId: "u_stu1", submittedAt: daysFromToday(-2), text: "Attached benchmark results and source code.", file: { name: "benchmark-report.pdf", kind: "pdf" } },
  { id: "as2", assignmentId: "a3", studentId: "u_stu1", submittedAt: daysFromToday(-6), text: "12 test cases covering login, transfer, and input validation.", file: { name: "bank-test-cases.pdf", kind: "pdf" } },
  { id: "as3", assignmentId: "a3", studentId: "u_stu2", submittedAt: daysFromToday(-5), file: { name: "test-cases-elena.docx", kind: "other" } },
];

export const quizAttempts: QuizAttempt[] = [
  { id: "q1", studentId: "u_stu1", subjectId: "s_math", examType: "midterm", source: "ai", score: 7, maxScore: 10, date: "2025-12-01" },
  { id: "q2", studentId: "u_stu1", subjectId: "s_algo", examType: "midterm", source: "folder", score: 6, maxScore: 10, date: "2025-12-05" },
];

// --------- Helpers ---------

export function getUserSubjects(userId: string, role: Role): Subject[] {
  if (role === "admin") return subjects;
  const ids = enrollments.filter((e) => e.userId === userId).map((e) => e.subjectId);
  return subjects.filter((s) => ids.includes(s.id));
}

export function getSubjectRole(userId: string, subjectId: string, globalRole: Role): Enrollment["role"] | "admin" | null {
  if (globalRole === "admin") return "admin";
  const e = enrollments.find((x) => x.userId === userId && x.subjectId === subjectId);
  return e ? e.role : null;
}

export function getSubject(id: string) {
  return subjects.find((s) => s.id === id);
}

function subjectImageStorageKey(subjectId: string) {
  return `imilearn.subjectImage.${subjectId}`;
}

// Hydrates subject cover images from localStorage on module load (mock in-memory "DB").
if (typeof window !== "undefined") {
  for (const s of subjects) {
    const saved = window.localStorage.getItem(subjectImageStorageKey(s.id));
    if (saved) s.image = saved;
  }
}

export function setSubjectImage(subjectId: string, dataUrl: string | null) {
  const s = subjects.find((x) => x.id === subjectId);
  if (!s) return;
  s.image = dataUrl ?? undefined;
  if (typeof window === "undefined") return;
  if (dataUrl) window.localStorage.setItem(subjectImageStorageKey(subjectId), dataUrl);
  else window.localStorage.removeItem(subjectImageStorageKey(subjectId));
}

export function getSubjectStudents(subjectId: string): User[] {
  const ids = enrollments.filter((e) => e.subjectId === subjectId && e.role === "student").map((e) => e.userId);
  return users.filter((u) => ids.includes(u.id));
}

export function canWrite(role: Enrollment["role"] | "admin" | null): boolean {
  return role === "admin" || role === "professor" || role === "assistant";
}

// Falls back to the subject's professor as the "uploaded by" name when a
// record doesn't carry one of its own.
export function getSubjectProfessorName(subjectId: string): string {
  const e = enrollments.find((x) => x.subjectId === subjectId && x.role === "professor");
  const u = e ? users.find((x) => x.id === e.userId) : undefined;
  return u ? `${u.firstName} ${u.lastName}` : "Staff";
}

// Study year derived from the enrollment year encoded in the index number
// ("148/2022" -> enrolled 2022). Academic years roll over in October.
export function getStudyYear(user: User): number {
  const enrollYear = user.index ? parseInt(user.index.split("/")[1], 10) : NaN;
  if (!Number.isFinite(enrollYear)) return 1;
  const now = new Date();
  const academicYear = now.getMonth() >= 9 ? now.getFullYear() : now.getFullYear() - 1;
  return Math.max(1, academicYear - enrollYear + 1);
}

// A student may take a subject from their own year or any earlier year
// (e.g. a 3rd-year student can still take a 2nd-year subject), but never a
// subject from a later year than the one they're currently in.
export function canAccessSubjectYear(studentYear: number, subjectYear: number): boolean {
  return subjectYear <= studentYear;
}

// Each study year unlocks another 60 ESPB (1st year -> 60, 2nd -> 120, ...).
export function getMaxEspb(user: User): number {
  return Math.min(240, getStudyYear(user) * 60);
}

// ESPB earned so far: sum of credits for subjects where the student passed the final.
export function getEarnedEspb(studentId: string): number {
  let total = 0;
  for (const s of subjects) {
    const finals = exams.filter((e) => e.subjectId === s.id && e.type === "final");
    const passed = finals.some((e) => {
      const r = examResults.find((x) => x.examId === e.id && x.studentId === studentId);
      return !!r && r.maxScore > 0 && r.score / r.maxScore >= 0.5;
    });
    if (passed) total += s.espb;
  }
  return total;
}

// Balkan-style 6-10 grading scale from a percentage score (below 50% fails, grade 5).
export function gradeFromPct(pct: number): number {
  if (pct >= 90) return 10;
  if (pct >= 80) return 9;
  if (pct >= 70) return 8;
  if (pct >= 60) return 7;
  if (pct >= 50) return 6;
  return 5;
}

// Average final-exam grade (6-10 scale), or null if no final exams have been graded yet.
export function getAverageScore(studentId: string): number | null {
  const grades = exams
    .filter((e) => e.type === "final")
    .map((e) => examResults.find((r) => r.examId === e.id && r.studentId === studentId))
    .filter((r): r is ExamResult => !!r && r.maxScore > 0)
    .map((r) => gradeFromPct((r.score / r.maxScore) * 100))
    .filter((g) => g >= 6);
  if (grades.length === 0) return null;
  return Math.round((grades.reduce((a, b) => a + b, 0) / grades.length) * 10) / 10;
}

// Palette lookup for subject color chips.
export const subjectColorClasses: Record<Subject["color"], { bg: string; text: string; ring: string; dot: string; border: string }> = {
  blue:    { bg: "bg-[rgb(214,242,255)]", text: "text-[rgb(0,68,149)]", ring: "ring-[rgb(0,136,242)]", dot: "bg-[rgb(0,136,242)]", border: "border-[rgb(0,136,242)]" },
  sky:     { bg: "bg-[rgb(202,247,255)]", text: "text-[rgb(0,84,116)]", ring: "ring-[rgb(0,184,225)]", dot: "bg-[rgb(0,184,225)]", border: "border-[rgb(0,184,225)]" },
  violet:  { bg: "bg-[rgb(240,233,255)]", text: "text-[rgb(81,43,146)]", ring: "ring-[rgb(146,100,239)]",  dot: "bg-[rgb(146,100,239)]", border: "border-[rgb(146,100,239)]" },
  emerald: { bg: "bg-[rgb(208,250,230)]", text: "text-[rgb(0,85,50)]", ring: "ring-[rgb(0,187,135)]", dot: "bg-[rgb(0,187,135)]", border: "border-[rgb(0,187,135)]" },
  amber:   { bg: "bg-[rgb(255,238,197)]",  text: "text-[rgb(119,48,0)]",   ring: "ring-[rgb(240,177,53)]",  dot: "bg-[rgb(240,177,53)]", border: "border-[rgb(240,177,53)]" },
  rose:    { bg: "bg-[rgb(255,226,228)]",  text: "text-[rgb(150,0,43)]",  ring: "ring-[rgb(250,85,112)]",  dot: "bg-[rgb(250,85,112)]", border: "border-[rgb(250,85,112)]" },
};

// Subjects are accented by study year, not an arbitrary per-subject color:
// year 1 = blue, year 2 = yellow, year 3 = green, year 4 = red.
const yearColorKey: Record<Subject["year"], Subject["color"]> = {
  1: "blue",
  2: "amber",
  3: "emerald",
  4: "rose",
};

export function getYearAccent(year: Subject["year"]) {
  return subjectColorClasses[yearColorKey[year]];
}

// Shared dark-green accent (matches the IMILearn logo) for generic dashboard
// widgets — e.g. Upcoming Tests / Continue Where You Left Off — where icons
// shouldn't vary by subject color.
export const brandAccent = { bg: "bg-[rgb(214,238,230)]", text: "text-[rgb(0,83,80)]" };
