import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { X } from "lucide-react"
import { useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useParams } from "react-router-dom"
import { z } from "zod"
import { BackButton } from "@/components/layout/BackButton"
import { ConfirmDeleteDialog } from "@/components/layout/ConfirmDeleteDialog"
import { FileUpload, type FileUploadHandle, type UploadedFile } from "@/components/layout/FileUpload"
import { TabSectionCard } from "@/components/layout/TabSectionCard"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/features/auth/AuthContext"
import { MentionTextarea } from "@/features/forum/MentionTextarea"
import { ThreadCard } from "@/features/forum/ThreadCard"
import { apiClient } from "@/lib/api-client"
import { getInitials } from "@/lib/utils"
import type { ForumThread, ForumThreadRequest, Page, User } from "@/types/api"
import { toast } from "sonner"

const threadSchema = z.object({ title: z.string().trim().min(1, "Title is required"), body: z.string().trim().min(1, "Body is required") })
type ThreadValues = z.infer<typeof threadSchema>
type DeleteTarget = { kind: "thread"; id: number } | { kind: "post"; id: number; threadId: number }

export default function ForumPage({ embedded = false }: { embedded?: boolean }) {
  const { subjectId } = useParams<{ subjectId: string }>()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [newThreadOpen, setNewThreadOpen] = useState(false)
  const [attachment, setAttachment] = useState<UploadedFile | null>(null)
  const [uploadingAttachment, setUploadingAttachment] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const fileUploadRef = useRef<FileUploadHandle>(null)
  const threadForm = useForm<ThreadValues>({ resolver: zodResolver(threadSchema) })
  const canEdit = (authorId: number) => authorId === user?.id
  const canDelete = (authorId: number) => authorId === user?.id || user?.type === "ADMIN" || user?.type === "PROFESSOR"
  const userName = user ? `${user.name} ${user.surname}` : "User"

  const threads = useQuery({
    queryKey: ["forum", "threads", subjectId],
    enabled: Boolean(subjectId),
    queryFn: async () => (await apiClient.get<Page<ForumThread>>(`/subjects/${subjectId}/forum/threads`, { params: { size: 100 } })).data,
  })

  const subjectMembers = useQuery({
    queryKey: ["subjects", subjectId, "members"],
    enabled: Boolean(subjectId),
    queryFn: async () => (await apiClient.get<User[]>(`/subjects/${subjectId}/members`)).data,
  })

  const closeComposer = () => {
    threadForm.reset()
    setAttachment(null)
    setNewThreadOpen(false)
    fileUploadRef.current?.clear()
  }

  const createThread = useMutation({
    mutationFn: (request: ForumThreadRequest) => apiClient.post<ForumThread>(`/subjects/${subjectId}/forum/threads`, request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["forum", "threads", subjectId] })
      toast.success("Thread created")
      closeComposer()
    },
  })

  const remove = useMutation({
    mutationFn: ({ kind, id }: DeleteTarget) => apiClient.delete(kind === "thread" ? `/forum/threads/${id}` : `/forum/posts/${id}`),
    onSuccess: async (_, target) => {
      if (target.kind === "thread") {
        await queryClient.invalidateQueries({ queryKey: ["forum", "threads", subjectId] })
      } else {
        await queryClient.invalidateQueries({ queryKey: ["forum", "threads", target.threadId, "posts"] })
        await queryClient.invalidateQueries({ queryKey: ["forum", "threads", subjectId] })
      }
      toast.success("Deleted")
      setDeleteTarget(null)
    },
  })

  const composer = newThreadOpen && <Card size="sm">
    <CardContent>
      <form className="flex flex-col gap-3" onSubmit={threadForm.handleSubmit((values) => createThread.mutate(attachment ? { ...values, attachmentStorageKey: attachment.storageKey, attachmentFileName: attachment.fileName, attachmentContentType: attachment.contentType, attachmentSizeBytes: attachment.sizeBytes } : values))}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3"><Avatar><AvatarFallback>{getInitials(userName)}</AvatarFallback></Avatar><p className="truncate text-sm font-medium">{userName}</p></div>
          <Button type="button" size="icon-sm" variant="ghost" aria-label="Close new thread composer" disabled={createThread.isPending || uploadingAttachment} onClick={closeComposer}><X /></Button>
        </div>
        <div><Label className="sr-only" htmlFor="forum-title">Subject</Label><Input id="forum-title" placeholder="Subject" {...threadForm.register("title")} />{threadForm.formState.errors.title && <p className="mt-1 text-sm text-destructive">{threadForm.formState.errors.title.message}</p>}</div>
        <div><Label className="sr-only" htmlFor="forum-body">Body</Label><Controller control={threadForm.control} name="body" defaultValue="" render={({ field }) => <MentionTextarea id="forum-body" className="min-h-24 resize-y" placeholder="Start a conversation..." subjectMembers={subjectMembers.data ?? []} {...field} />} />{threadForm.formState.errors.body && <p className="mt-1 text-sm text-destructive">{threadForm.formState.errors.body.message}</p>}</div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <FileUpload
            ref={fileUploadRef}
            id="forum-attachment"
            uploadUrlEndpoint="/forum/upload-url"
            variant="compact"
            disabled={createThread.isPending}
            value={attachment ? [attachment] : []}
            onChange={(files) => setAttachment(files[0] ?? null)}
            onUploadingChange={setUploadingAttachment}
          />
          <Button type="submit" size="sm" disabled={createThread.isPending || uploadingAttachment}>{createThread.isPending ? "Posting..." : "Post"}</Button>
        </div>
      </form>
    </CardContent>
  </Card>

  const threadList = <>
    {threads.isLoading && <div className="flex flex-col gap-3"><Skeleton className="h-48 w-full" /><Skeleton className="h-40 w-full" /></div>}
    {threads.isError && <p className="text-sm text-destructive">Unable to load forum threads.</p>}
    {!threads.isLoading && !threads.isError && !threads.data?.content.length && <p className="text-sm text-muted-foreground">No threads yet.</p>}
    <div className="flex flex-col gap-3">
      {threads.data?.content.map((thread) => <ThreadCard
        key={thread.id}
        thread={thread}
        subjectId={subjectId}
        subjectMembers={subjectMembers.data ?? []}
        canEdit={canEdit}
        canDelete={canDelete}
        onDeleteThread={(id) => setDeleteTarget({ kind: "thread", id })}
        onDeletePost={(id, threadId) => setDeleteTarget({ kind: "post", id, threadId })}
      />)}
    </div>
  </>

  return <div className={embedded ? "flex flex-col gap-4" : "flex flex-col gap-6"}>
    {!embedded && <div className="page-heading"><div className="flex flex-col gap-2"><BackButton /><h1>Forum</h1><p className="text-muted-foreground">Discuss this subject with other members.</p></div><Button disabled={newThreadOpen} onClick={() => setNewThreadOpen(true)}>New thread</Button></div>}
    {embedded ? (
      <TabSectionCard title="Forum" action={<Button size="sm" disabled={newThreadOpen} onClick={() => setNewThreadOpen(true)}>New thread</Button>} contentClassName="flex flex-col gap-3">
        {composer}
        {threadList}
      </TabSectionCard>
    ) : <>
      {composer}
      {threadList}
    </>}
    <ConfirmDeleteDialog
      open={deleteTarget !== null}
      onOpenChange={(open) => !open && setDeleteTarget(null)}
      title={`Delete ${deleteTarget?.kind === "post" ? "reply" : "thread"}?`}
      pending={remove.isPending}
      onConfirm={() => deleteTarget && remove.mutate(deleteTarget)}
    />
  </div>
}
