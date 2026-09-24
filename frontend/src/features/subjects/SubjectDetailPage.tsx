import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { TabSectionCard } from "@/components/layout/TabSectionCard"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTable, type DataTableColumnDef } from "@/components/layout/DataTable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/features/auth/AuthContext"
import { BackButton } from "@/components/layout/BackButton"
import AssignmentsPage from "@/features/assignments/AssignmentsPage"
import ExamsPage from "@/features/exams/ExamsPage"
import ForumPage from "@/features/forum/ForumPage"
import { apiClient, getErrorMessage } from "@/lib/api-client"
import type { Material, MaterialCategory, MaterialRequest, Page, Subject, SubjectRequest, User } from "@/types/api"
import { toast } from "sonner"
import { YearBadge } from "@/features/subjects/YearBadge"
import { AddMembersDialog } from "@/features/subjects/AddMembersDialog"
import { MaterialDownload } from "@/features/subjects/MaterialDownload"
import { MaterialForm } from "@/features/subjects/MaterialForm"
import { SubjectForm } from "@/features/subjects/SubjectForm"

const subjectTabs = ["materials", "members", "assignments", "exams", "forum"] as const
type SubjectTab = (typeof subjectTabs)[number]
const materialCategoryLabel: Record<MaterialCategory, string> = { LECTURE: "Lecture", EXERCISES: "Exercises", EXAM_QUESTIONS: "Exam questions", OTHER: "Not specified" }

export default function SubjectDetailPage() {
  const { subjectId } = useParams<{ subjectId: string }>()
  const id = Number(subjectId)
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [subjectDialog, setSubjectDialog] = useState(false)
  const [materialDialog, setMaterialDialog] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material>()
  const [deleteSubjectOpen, setDeleteSubjectOpen] = useState(false)
  const [deleteMaterial, setDeleteMaterial] = useState<Material>()
  const [memberDialog, setMemberDialog] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get("tab")
  const activeTab: SubjectTab = subjectTabs.includes(tabParam as SubjectTab) ? (tabParam as SubjectTab) : "materials"
  const setActiveTab = (tab: string) => setSearchParams((params) => { params.set("tab", tab); return params }, { replace: true })
  const canManage = user?.type !== "STUDENT"
  const subject = useQuery({ queryKey: ["subjects", id], queryFn: async () => (await apiClient.get<Subject>(`/subjects/${id}`)).data, enabled: Number.isFinite(id) })
  const materials = useQuery({ queryKey: ["materials", "by-subject", id], queryFn: async () => (await apiClient.get<Page<Material>>(`/materials`, { params: { subject: id, size: 100 } })).data.content, enabled: Number.isFinite(id) })
  const members = useQuery({ queryKey: ["subjects", id, "members"], queryFn: async () => (await apiClient.get<User[]>(`/subjects/${id}/members`)).data, enabled: Number.isFinite(id) })
  const allUsers = useQuery({ queryKey: ["users"], queryFn: async () => (await apiClient.get<User[]>("/users")).data, enabled: canManage })
  const closeAndInvalidate = async (message: string, key: readonly unknown[]) => { await queryClient.invalidateQueries({ queryKey: key }); toast.success(message) }
  const editSubject = useMutation({ mutationFn: (request: SubjectRequest) => apiClient.put<Subject>(`/subjects/${id}`, request), onSuccess: async () => { await closeAndInvalidate("Subject updated", ["subjects", id]); await queryClient.invalidateQueries({ queryKey: ["subjects"] }); setSubjectDialog(false) } })
  const deleteSubject = useMutation({ mutationFn: () => apiClient.delete(`/subjects/${id}`), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["subjects"] }); toast.success("Subject deleted"); navigate("/subjects") } })
  const saveMaterial = useMutation({ mutationFn: (request: MaterialRequest) => editingMaterial ? apiClient.put<Material>(`/materials/${editingMaterial.id}`, request) : apiClient.post<Material>("/materials", request), onSuccess: async () => { await closeAndInvalidate(editingMaterial ? "Material updated" : "Material added", ["materials", "by-subject", id]); setMaterialDialog(false); setEditingMaterial(undefined) } })
  const removeMaterial = useMutation({ mutationFn: (material: Material) => apiClient.delete(`/materials/${material.id}`), onSuccess: async () => { await closeAndInvalidate("Material deleted", ["materials", "by-subject", id]); setDeleteMaterial(undefined) } })
  const removeSubjectMember = useMutation({ mutationFn: (userId: number) => apiClient.delete(`/subjects/${id}/members/${userId}`), onSuccess: () => closeAndInvalidate("Member removed", ["subjects", id, "members"]) })
  const isUrl = (path: string) => /^https?:\/\//i.test(path)
  const memberCandidates = (allUsers.data ?? []).filter((candidate) =>
    (user?.type === "ADMIN" || candidate.type === "STUDENT")
      && !members.data?.some((member) => member.id === candidate.id),
  )
  const materialColumns: DataTableColumnDef<Material>[] = [
    { accessorKey: "name", header: "Name", cell: ({ row }) => <div className="flex flex-col"><span className="font-medium">{row.original.name}</span></div> },
    { accessorKey: "category", header: "Type", cell: ({ row }) => row.original.category && row.original.category !== "OTHER" ? <span className="text-muted-foreground">{materialCategoryLabel[row.original.category]}</span> : "-" },
    {
      accessorKey: "path",
      header: "File",
      meta: { cellClassName: "max-w-xs truncate" },
      cell: ({ row }) => isUrl(row.original.path) ? <a className="text-primary underline" href={row.original.path} target="_blank" rel="noreferrer" onClick={() => { void apiClient.get(`/materials/${row.original.id}`) }}>{row.original.path}</a> : <MaterialDownload material={row.original} />,
    },
    ...(canManage ? [{
      id: "actions",
      header: "Actions",
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
      cell: ({ row }) => <div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => { setEditingMaterial(row.original); setMaterialDialog(true) }}>Edit</Button><Button size="sm" variant="destructive" onClick={() => setDeleteMaterial(row.original)}>Delete</Button></div>,
    } satisfies DataTableColumnDef<Material>] : []),
  ]
  const memberColumns: DataTableColumnDef<User>[] = [
    { accessorKey: "name", header: "Name", cell: ({ row }) => <span className="font-medium">{row.original.name} {row.original.surname}</span> },
    { accessorKey: "email", header: "Email", meta: { cellClassName: "text-muted-foreground" } },
    { accessorKey: "type", header: "Type", cell: ({ row }) => <span className="text-muted-foreground">{row.original.type}</span> },
    ...(canManage ? [{
      id: "actions",
      header: "Actions",
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
      cell: ({ row }) => <Button size="sm" variant="destructive" disabled={removeSubjectMember.isPending} onClick={() => removeSubjectMember.mutate(row.original.id)}>Delete</Button>,
    } satisfies DataTableColumnDef<User>] : []),
  ]

  if (subject.isLoading) return <Skeleton className="h-48 w-full" />
  if (subject.isError || !subject.data) return <p className="text-destructive">{getErrorMessage(subject.error)}</p>
  const currentSubject = subject.data
  return <div className="flex flex-col gap-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex flex-col gap-2">
        <BackButton label="Back to subjects" />
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold tracking-[-0.02em]">{currentSubject.name}</h1>
          <YearBadge year={currentSubject.year} />
        </div>
        <p className="text-sm text-muted-foreground">{members.data?.length ?? 0} member{members.data?.length === 1 ? "" : "s"}</p>
      </div>
      {canManage && <div className="flex gap-2"><Button variant="outline" onClick={() => setSubjectDialog(true)}>Edit</Button><Button variant="destructive" onClick={() => setDeleteSubjectOpen(true)}>Delete</Button></div>}
    </div>

    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(String(value))}>
      <TabsList variant="line">
        <TabsTrigger value="materials">Materials</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="assignments">Assignments</TabsTrigger>
        <TabsTrigger value="exams">Exams</TabsTrigger>
        <TabsTrigger value="forum">Forum</TabsTrigger>
      </TabsList>

      <TabsContent value="materials">
        <TabSectionCard title="Materials" action={canManage && <Button size="sm" onClick={() => { setEditingMaterial(undefined); setMaterialDialog(true) }}>Add material</Button>}>
            {materials.isLoading ? <Skeleton className="h-20 w-full" /> : materials.data?.length === 0 ? <p className="py-6 text-sm text-muted-foreground">No materials yet.</p> : (
              <DataTable data={materials.data ?? []} columns={materialColumns} containerClassName="max-h-[23.5rem] overflow-y-auto" />
            )}
        </TabSectionCard>
      </TabsContent>

      <TabsContent value="members">
        <TabSectionCard title="Members" action={canManage && <Button size="sm" onClick={() => setMemberDialog(true)}>Add member</Button>} contentClassName="flex flex-col gap-4">
            {members.isLoading ? <Skeleton className="h-16 w-full" /> : members.data?.length === 0 ? <p className="text-sm text-muted-foreground">No members yet.</p> : (
              <DataTable data={members.data ?? []} columns={memberColumns} containerClassName="max-h-[23.5rem] overflow-y-auto" />
            )}
        </TabSectionCard>
      </TabsContent>

      <TabsContent value="assignments">{activeTab === "assignments" && <AssignmentsPage embedded />}</TabsContent>
      <TabsContent value="exams">{activeTab === "exams" && <ExamsPage embedded />}</TabsContent>
      <TabsContent value="forum">{activeTab === "forum" && <ForumPage embedded />}</TabsContent>
    </Tabs>

    <Dialog open={subjectDialog} onOpenChange={setSubjectDialog}><DialogContent><DialogHeader><DialogTitle>Edit subject</DialogTitle></DialogHeader><SubjectForm initial={currentSubject} onSubmit={(values) => editSubject.mutate(values)} submitting={editSubject.isPending} /></DialogContent></Dialog>
    <Dialog open={materialDialog} onOpenChange={(open) => { setMaterialDialog(open); if (!open) setEditingMaterial(undefined) }}><DialogContent><DialogHeader><DialogTitle>{editingMaterial ? "Edit material" : "Add material"}</DialogTitle></DialogHeader><MaterialForm initial={editingMaterial} subjectId={id} onSubmit={(values) => saveMaterial.mutate(values)} submitting={saveMaterial.isPending} /></DialogContent></Dialog>
    <AddMembersDialog open={memberDialog} onOpenChange={setMemberDialog} subjectId={id} candidates={memberCandidates} />
    <AlertDialog open={deleteSubjectOpen} onOpenChange={setDeleteSubjectOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete subject?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this subject and its associated data.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => deleteSubject.mutate()}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <AlertDialog open={!!deleteMaterial} onOpenChange={(open) => !open && setDeleteMaterial(undefined)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete material?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => deleteMaterial && removeMaterial.mutate(deleteMaterial)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>
}
