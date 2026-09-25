import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/features/auth/AuthContext"
import { apiClient, getErrorMessage } from "@/lib/api-client"
import type { Subject, SubjectRequest } from "@/types/api"
import { toast } from "sonner"
import { YearBadge } from "@/features/subjects/YearBadge"
import { SubjectForm } from "@/features/subjects/SubjectForm"

export default function SubjectsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const subjects = useQuery({ queryKey: ["subjects"], queryFn: async () => (await apiClient.get<Subject[]>("/subjects")).data })
  const createSubject = useMutation({
    mutationFn: (request: SubjectRequest) => apiClient.post<Subject>("/subjects", request),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["subjects"] }); toast.success("Subject created"); setOpen(false) },
  })
  const canManage = user?.type !== "STUDENT"

  return (
    <div className="flex flex-col gap-6">
      <div className="page-heading"><div><h1>Subjects</h1></div>{canManage && <Button onClick={() => setOpen(true)}>Create subject</Button>}</div>
      {subjects.isLoading && <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-32 w-full" />)}</div>}
      {subjects.isError && <p className="text-destructive">{getErrorMessage(subjects.error)}</p>}
      {!subjects.isLoading && subjects.data?.length === 0 && <Card><CardContent className="py-8 text-center text-muted-foreground">No subjects found.</CardContent></Card>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{subjects.data?.map((subject) => <Link key={subject.id} to={`/subjects/${subject.id}`}><Card className="h-full transition-colors hover:bg-muted/50"><CardHeader className="flex flex-row items-center justify-between"><CardTitle>{subject.name}</CardTitle><YearBadge year={subject.year} /></CardHeader><CardContent className="flex flex-col gap-1 text-sm text-muted-foreground"><p>Professor: <span className="text-foreground">{subject.professorName || "-"}</span></p><p>Members: <span className="text-foreground">{subject.memberCount ?? 0}</span></p></CardContent></Card></Link>)}</div>
      <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Create subject</DialogTitle></DialogHeader><SubjectForm onSubmit={(values) => createSubject.mutate(values)} submitting={createSubject.isPending} /></DialogContent></Dialog>
    </div>
  )
}
