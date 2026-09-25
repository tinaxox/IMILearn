import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { ArrowRight, BookOpen, CalendarDays, Clock3, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api-client"
import { formatDateTime } from "@/lib/utils"
import { useAuth } from "@/features/auth/AuthContext"
import type { Exam, Material, Subject } from "@/types/api"
import { YearBadge } from "@/features/subjects/YearBadge"

export default function DashboardPage() {
  const { user } = useAuth()
  const isStudent = user?.type === "STUDENT"
  const isProfessor = user?.type === "PROFESSOR"

  const recentMaterials = useQuery({
    queryKey: ["materials", "recently-viewed"],
    queryFn: async () => (await apiClient.get<Material[]>("/materials/recently-viewed")).data,
    enabled: isStudent,
  })
  const upcomingExams = useQuery({
    queryKey: ["exams", "upcoming"],
    queryFn: async () => (await apiClient.get<Exam[]>("/exams/upcoming")).data,
    enabled: isStudent || isProfessor,
  })
  const subjects = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => (await apiClient.get<Subject[]>("/subjects")).data,
    enabled: Boolean(user),
  })

  return (
    <div className="flex flex-col gap-6">
      {user?.type === "ADMIN" ? (
        <div className="grid gap-5">
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-5 py-2">
              <div className="flex items-center gap-4">
                <span className="flex size-11 items-center justify-center rounded-lg bg-accent text-primary"><Users className="size-5" /></span>
                <div><h2 className="font-semibold">User administration</h2><p className="mt-0.5 text-sm text-muted-foreground">Create accounts and maintain roles for your organization.</p></div>
              </div>
              <Button variant="outline" render={<Link to="/users" />}>Open user list <ArrowRight /></Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-5 py-2">
              <div className="flex items-center gap-4">
                <span className="flex size-11 items-center justify-center rounded-lg bg-accent text-primary"><BookOpen className="size-5" /></span>
                <div><h2 className="font-semibold">Subject administration</h2><p className="mt-0.5 text-sm text-muted-foreground">Create subjects and manage members, materials, assignments, and exams.</p></div>
              </div>
              <Button variant="outline" render={<Link to="/subjects" />}>Open subject list <ArrowRight /></Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
            <div><CardTitle>Your subjects</CardTitle><p className="mt-1 text-sm text-muted-foreground">{subjects.data?.length ?? 0} active subject{subjects.data?.length === 1 ? "" : "s"}</p></div>
            <Button size="sm" variant="outline" render={<Link to="/subjects" />}>View all</Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {subjects.isLoading && <Skeleton className="h-16 w-full" />}
            {subjects.data?.length === 0 && <p className="py-5 text-sm text-muted-foreground">No subjects yet.</p>}
            {subjects.data?.map((subject) => (
              <Link key={subject.id} to={`/subjects/${subject.id}`} className="group flex items-center gap-4 rounded-lg border border-border p-3.5 transition-colors hover:border-[#cdd7f7] hover:bg-[#fafbff]">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary"><BookOpen className="size-[18px]" /></span>
                <div className="min-w-0 flex-1"><p className="truncate font-medium">{subject.name}</p><YearBadge year={subject.year} className="mt-1 h-5 text-[12px]" /></div>
                <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-primary">Open <ArrowRight className="size-3.5" /></span>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {(isStudent || isProfessor) && <div className={`grid gap-5 ${isStudent ? "lg:grid-cols-2" : ""}`}>
        {isStudent && <Card>
          <CardHeader className="flex flex-row items-center gap-3 border-b border-border pb-4"><span className="flex size-8 items-center justify-center rounded-lg bg-[#eff7ff] text-[#2870b8]"><Clock3 className="size-4" /></span><CardTitle>Recently viewed materials</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            {recentMaterials.isLoading && <Skeleton className="h-16 w-full" />}
            {recentMaterials.data?.length === 0 && <p className="py-5 text-sm text-muted-foreground">Nothing viewed yet.</p>}
            <div className="max-h-56 overflow-y-auto">
              {recentMaterials.data?.map((material) => <Link key={material.id} to={`/subjects/${material.subjectId}`} className="flex items-center justify-between rounded-lg px-2 py-2.5 hover:bg-muted"><span className="font-medium">{material.name}</span><span className="text-sm text-muted-foreground">{material.category && material.category !== "OTHER" ? material.category === "EXAM_QUESTIONS" ? "Exam questions" : material.category === "EXERCISES" ? "Exercises" : "Lecture" : "-"}</span></Link>)}
            </div>
          </CardContent>
        </Card>}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 pb-4"><div className="flex items-center gap-3"><span className="flex size-8 items-center justify-center rounded-lg bg-[#fff5dc] text-[#956a08]"><CalendarDays className="size-4" /></span><CardTitle>Scheduled Exams</CardTitle></div></CardHeader>
          <CardContent className="flex flex-col gap-2">
            {upcomingExams.isLoading && <Skeleton className="h-16 w-full" />}
            {upcomingExams.data?.length === 0 && <p className="py-5 text-sm text-muted-foreground">No scheduled exams.</p>}
            <div className="max-h-56 overflow-y-auto divide-y divide-border">
              {upcomingExams.data?.map((exam) => <div key={exam.id} className="flex items-center justify-between gap-3 px-2 py-1.5"><div><p className="font-medium">{exam.name}</p><p className="text-sm text-muted-foreground">{exam.subjectName}</p></div><span className="text-sm text-muted-foreground">{formatDateTime(exam.date)}</span></div>)}
            </div>
          </CardContent>
        </Card>
      </div>}
    </div>
  )
}
