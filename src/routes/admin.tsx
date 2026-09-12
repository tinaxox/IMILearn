import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { RequireAuth } from "@/components/app/RequireAuth";
import { useAuth } from "@/lib/auth";
import { EmptyState } from "@/components/app/EmptyState";
import { RoleBadge } from "@/components/app/RoleBadge";
import { users, subjects, enrollments, getStudyYear, canAccessSubjectYear, type Role } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/admin")({
  component: () => (
    <RequireAuth>
      <AdminPage />
    </RequireAuth>
  ),
});

function AdminPage() {
  const { user } = useAuth();
  const [, force] = useState(0);

  if (!user || user.role !== "admin") {
    return <EmptyState title="Admins only" description="This page is restricted to administrator accounts." />;
  }

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold">Admin panel</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Subjects</h2>
        <div className="rounded-xl border bg-card">
          <ul className="divide-y">
            {subjects.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{s.name}</div>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Year {s.year}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{s.description}</div>
                </div>
                <span className="text-xs text-muted-foreground">{enrollments.filter((e) => e.subjectId === s.id).length} enrolled</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Create staff account</h2>
        <CreateStaff onCreated={() => force((n) => n + 1)} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">People</h2>
        <div className="overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Email</th>
                <th className="px-4 py-2.5">Role</th>
                <th className="px-4 py-2.5">Subjects</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => {
                const es = enrollments.filter((e) => e.userId === u.id);
                return (
                  <tr key={u.id}>
                    <td className="px-4 py-2.5 font-medium">{u.firstName} {u.lastName}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-2.5"><RoleBadge role={u.role} /></td>
                    <td className="px-4 py-2.5">
                      <AssignSubject userId={u.id} disabled={u.role === "admin"} onChange={() => force((n) => n + 1)} />
                      <div className="mt-1 flex flex-wrap gap-1">
                        {es.map((e) => {
                          const s = subjects.find((x) => x.id === e.subjectId);
                          return <span key={e.subjectId} className="rounded-md bg-muted px-2 py-0.5 text-xs">{s?.name}</span>;
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function CreateStaff({ onCreated }: { onCreated: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("professor");
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <Input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <Input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Select value={role} onValueChange={(v) => setRole(v as Role)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="professor">Professor</SelectItem>
            <SelectItem value="assistant">Assistant</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mt-3 flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            if (!firstName || !lastName || !email) return;
            users.push({ id: `u_${Date.now()}`, firstName, lastName, email, role });
            setFirstName(""); setLastName(""); setEmail("");
            onCreated();
          }}
        ><Plus className="mr-1.5 h-4 w-4" />Create</Button>
      </div>
    </div>
  );
}

function AssignSubject({ userId, disabled, onChange }: { userId: string; disabled?: boolean; onChange: () => void }) {
  const u = users.find((x) => x.id === userId);
  if (!u || disabled) return null;

  const notYetEnrolled = subjects.filter((s) => !enrollments.some((e) => e.userId === userId && e.subjectId === s.id));
  // Students can only be enrolled in subjects from their study year or earlier
  // (e.g. a 2nd-year student can still take a 1st-year subject, never a 3rd-year one).
  const studentYear = u.role === "student" ? getStudyYear(u) : null;
  const assignable = studentYear === null
    ? notYetEnrolled
    : notYetEnrolled.filter((s) => canAccessSubjectYear(studentYear, s.year));

  const enrollRole = u.role === "student" ? "student" : u.role === "assistant" ? "assistant" : "professor";
  return (
    <Select
      value=""
      onValueChange={(v) => {
        if (v) {
          enrollments.push({ userId, subjectId: v, role: enrollRole });
          onChange();
        }
      }}
    >
      <SelectTrigger className="h-7 w-auto gap-1.5 px-2 text-xs">
        <SelectValue placeholder="Enroll in subject…" />
      </SelectTrigger>
      <SelectContent>
        {assignable.length === 0 ? (
          <div className="px-2 py-1.5 text-xs text-muted-foreground">
            {studentYear !== null ? `No year ${studentYear}-or-earlier subjects left` : "Nothing left to assign"}
          </div>
        ) : (
          assignable.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} · Year {s.year}</SelectItem>)
        )}
      </SelectContent>
    </Select>
  );
}
