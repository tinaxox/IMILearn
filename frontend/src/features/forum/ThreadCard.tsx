import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FileText, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FileUpload, type FileUploadHandle, type UploadedFile } from "@/components/layout/FileUpload"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { registerCurrentForumThreadId } from "@/features/forum/current-thread"
import { MentionTextarea } from "@/features/forum/MentionTextarea"
import { renderWithMentions } from "@/features/forum/mention-renderer"
import { apiClient, getErrorMessage } from "@/lib/api-client"
import { formatDateTime, getInitials } from "@/lib/utils"
import { subscribeToTopic } from "@/lib/ws-client"
import type { DownloadUrl, ForumPost, ForumPostRequest, ForumThread, ForumThreadRequest, Page, User } from "@/types/api"
import { toast } from "sonner"

const postSchema = z.object({ body: z.string().trim().min(1, "Reply is required") })
const threadSchema = z.object({ title: z.string().trim().min(1, "Title is required"), body: z.string().trim().min(1, "Body is required") })
type PostValues = z.infer<typeof postSchema>
type ThreadValues = z.infer<typeof threadSchema>

interface ThreadCardProps {
  thread: ForumThread
  subjectId?: string
  subjectMembers: User[]
  canEdit: (authorId: number) => boolean
  canDelete: (authorId: number) => boolean
  onDeleteThread: (id: number) => void
  onDeletePost: (id: number, threadId: number) => void
}

export function ThreadCard({ thread, subjectId, subjectMembers, canEdit, canDelete, onDeleteThread, onDeletePost }: ThreadCardProps) {
  const queryClient = useQueryClient()
  const [editThreadOpen, setEditThreadOpen] = useState(false)
  const [editAttachment, setEditAttachment] = useState<UploadedFile | null>(null)
  const [uploadingAttachment, setUploadingAttachment] = useState(false)
  const [editingPost, setEditingPost] = useState<ForumPost | null>(null)
  const [visibleReplyCount, setVisibleReplyCount] = useState(3)
  const editFileUploadRef = useRef<FileUploadHandle>(null)
  const repliesScrollRef = useRef<HTMLDivElement>(null)
  const previousRepliesScrollHeightRef = useRef<number | null>(null)
  const postForm = useForm<PostValues>({ resolver: zodResolver(postSchema) })
  const editThreadForm = useForm<ThreadValues>({ resolver: zodResolver(threadSchema) })
  const editPostForm = useForm<PostValues>({ resolver: zodResolver(postSchema) })
  const postsQueryKey = ["forum", "threads", thread.id, "posts"] as const

  const posts = useQuery({
    queryKey: postsQueryKey,
    queryFn: async () => (await apiClient.get<Page<ForumPost>>(`/forum/threads/${thread.id}/posts`, { params: { size: 100 } })).data,
  })

  const createPost = useMutation({
    mutationFn: (request: ForumPostRequest) => apiClient.post<ForumPost>(`/forum/threads/${thread.id}/posts`, request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: postsQueryKey })
      await queryClient.invalidateQueries({ queryKey: ["forum", "threads", subjectId] })
      toast.success("Reply posted")
      postForm.reset()
    },
  })

  const updateThread = useMutation({
    mutationFn: (request: ForumThreadRequest) => apiClient.patch<ForumThread>(`/forum/threads/${thread.id}`, request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["forum", "threads", subjectId] })
      toast.success("Thread updated")
      setEditThreadOpen(false)
    },
  })

  const updatePost = useMutation({
    mutationFn: ({ postId, request }: { postId: number; request: ForumPostRequest }) => apiClient.patch<ForumPost>(`/forum/posts/${postId}`, request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: postsQueryKey })
      await queryClient.invalidateQueries({ queryKey: ["forum", "threads", subjectId] })
      toast.success("Reply updated")
      setEditingPost(null)
    },
  })

  const openThreadEditor = () => {
    editThreadForm.reset({ title: thread.title, body: thread.body })
    setEditAttachment(thread.attachmentStorageKey ? {
      storageKey: thread.attachmentStorageKey,
      fileName: thread.attachmentFileName!,
      contentType: thread.attachmentContentType!,
      sizeBytes: thread.attachmentSizeBytes!,
    } : null)
    editFileUploadRef.current?.resetInput()
    setEditThreadOpen(true)
  }

  const downloadAttachment = async () => {
    try {
      const response = await apiClient.get<DownloadUrl>(`/forum/threads/${thread.id}/attachment-download-url`)
      window.open(response.data.url, "_blank")
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const openPostEditor = (post: ForumPost) => {
    editPostForm.reset({ body: post.body })
    setEditingPost(post)
  }

  useEffect(() => {
    const unregisterCurrentThread = registerCurrentForumThreadId(thread.id)
    const unsubscribe = subscribeToTopic(`/topic/forum/threads/${thread.id}`, (payload) => {
      const post = payload as ForumPost
      if (post.threadId !== thread.id) return

      queryClient.setQueryData<Page<ForumPost>>(["forum", "threads", thread.id, "posts"], (current) => {
        if (current?.content.some((item) => item.id === post.id)) return current
        if (current) return { ...current, content: [...current.content, post], totalElements: current.totalElements + 1 }
        return { content: [post], totalElements: 1, totalPages: 1, number: 0, size: 100 }
      })
    })

    return () => {
      unsubscribe()
      unregisterCurrentThread()
    }
  }, [queryClient, thread.id])

  const replies = [...(posts.data?.content ?? [])].sort((first, second) => {
    const timestampDifference = new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime()
    return timestampDifference || first.id - second.id
  })
  const replyCount = posts.data?.totalElements ?? thread.postCount

  useLayoutEffect(() => {
    const repliesPane = repliesScrollRef.current
    if (!repliesPane) return

    const previousScrollHeight = previousRepliesScrollHeightRef.current
    if (previousScrollHeight !== null) {
      // User scrolled up to reveal older replies; keep their view anchored instead of jumping.
      repliesPane.scrollTop += repliesPane.scrollHeight - previousScrollHeight
      previousRepliesScrollHeightRef.current = null
      return
    }

    if (visibleReplyCount < replies.length && repliesPane.scrollHeight <= repliesPane.clientHeight) {
      // Not enough replies rendered yet to fill the pane; reveal more so scrolling up can load the rest.
      setVisibleReplyCount((current) => Math.min(current + 3, replies.length))
      return
    }

    repliesPane.scrollTop = repliesPane.scrollHeight
  }, [visibleReplyCount, replies.length])

  return <Card size="sm">
    <CardContent className="flex flex-col gap-6">
      <article className="flex gap-3">
        <Avatar><AvatarFallback>{getInitials(thread.authorName)}</AvatarFallback></Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{thread.authorName}</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(thread.createdAt)}</p>
            </div>
            {(canEdit(thread.authorId) || canDelete(thread.authorId)) && <DropdownMenu>
              <DropdownMenuTrigger render={<Button type="button" size="icon-xs" variant="ghost" className="text-muted-foreground" aria-label="Thread actions" />}><MoreVertical /></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEdit(thread.authorId) && <DropdownMenuItem onClick={openThreadEditor}><Pencil /> Edit</DropdownMenuItem>}
                {canDelete(thread.authorId) && <DropdownMenuItem variant="destructive" onClick={() => onDeleteThread(thread.id)}><Trash2 /> Delete</DropdownMenuItem>}
              </DropdownMenuContent>
            </DropdownMenu>}
          </div>
          <h3 className="mt-2 font-semibold leading-snug">{thread.title}</h3>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-5">{renderWithMentions(thread.body, subjectMembers)}</p>
          {thread.attachmentFileName && <Button type="button" variant="outline" size="sm" className="mt-3 max-w-full justify-start" onClick={() => void downloadAttachment()}><FileText className="size-4 shrink-0 text-primary" /><span className="truncate">{thread.attachmentFileName}</span></Button>}
        </div>
      </article>

      <div className="pl-4 sm:ml-8 border-t border-border">
        <p className="mb-1 mt-4 text-xs font-medium text-muted-foreground">{replyCount} {replyCount === 1 ? "reply" : "replies"}</p>
        {posts.isLoading && <Skeleton className="h-14 w-full" />}
        {posts.isError && <p className="py-2 text-sm text-destructive">Unable to load replies.</p>}
        <div ref={repliesScrollRef} className="max-h-44 overflow-y-auto pr-2" onScroll={(event) => {
          const repliesPane = event.currentTarget
          if (repliesPane.scrollTop >= 24 || visibleReplyCount >= replies.length || previousRepliesScrollHeightRef.current !== null) return
          previousRepliesScrollHeightRef.current = repliesPane.scrollHeight
          setVisibleReplyCount((current) => Math.min(current + 3, replies.length))
        }}>
          {replies.slice(-visibleReplyCount).map((post) => <article key={post.id} className="flex gap-2 py-2">
            <Avatar size="sm"><AvatarFallback>{getInitials(post.authorName)}</AvatarFallback></Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
                  <p className="truncate text-xs font-medium text-foreground">{post.authorName}</p>
                  <p className="text-[11px] text-muted-foreground">{formatDateTime(post.createdAt)}</p>
                </div>
                {(canEdit(post.authorId) || canDelete(post.authorId)) && <DropdownMenu>
                  <DropdownMenuTrigger render={<Button type="button" size="icon-xs" variant="ghost" className="text-muted-foreground" aria-label="Reply actions" />}><MoreVertical /></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canEdit(post.authorId) && <DropdownMenuItem onClick={() => openPostEditor(post)}><Pencil /> Edit</DropdownMenuItem>}
                    {canDelete(post.authorId) && <DropdownMenuItem variant="destructive" onClick={() => onDeletePost(post.id, thread.id)}><Trash2 /> Delete</DropdownMenuItem>}
                  </DropdownMenuContent>
                </DropdownMenu>}
              </div>
              <p className="mt-0.5 whitespace-pre-wrap text-sm leading-5">{renderWithMentions(post.body, subjectMembers)}</p>
            </div>
          </article>)}
        </div>

        <form className="mt-2 flex items-center gap-2 pt-2" onSubmit={postForm.handleSubmit((values) => createPost.mutate(values))}>
          <div className="min-w-0 flex-1">
            <Controller control={postForm.control} name="body" defaultValue="" render={({ field }) => <MentionTextarea aria-label={`Reply to ${thread.title}`} placeholder="Write a reply..." className="min-h-16 resize-none" subjectMembers={subjectMembers} {...field} />} />
            {postForm.formState.errors.body && <p className="mt-1 text-xs text-destructive">{postForm.formState.errors.body.message}</p>}
          </div>
          <Button type="submit" size="sm" disabled={createPost.isPending}>{createPost.isPending ? "Replying..." : "Reply"}</Button>
        </form>
      </div>
    </CardContent>

    <Dialog open={editThreadOpen} onOpenChange={setEditThreadOpen}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit thread</DialogTitle><DialogDescription>Update the thread title and body.</DialogDescription></DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={editThreadForm.handleSubmit((values) => updateThread.mutate({ ...values, attachmentStorageKey: editAttachment?.storageKey ?? null, attachmentFileName: editAttachment?.fileName ?? null, attachmentContentType: editAttachment?.contentType ?? null, attachmentSizeBytes: editAttachment?.sizeBytes ?? null }))}>
          <div className="flex flex-col gap-2"><Label htmlFor={`edit-thread-title-${thread.id}`}>Title</Label><Input id={`edit-thread-title-${thread.id}`} {...editThreadForm.register("title")} />{editThreadForm.formState.errors.title && <p className="text-sm text-destructive">{editThreadForm.formState.errors.title.message}</p>}</div>
          <div className="flex flex-col gap-2"><Label htmlFor={`edit-thread-body-${thread.id}`}>Body</Label><Controller control={editThreadForm.control} name="body" defaultValue="" render={({ field }) => <MentionTextarea id={`edit-thread-body-${thread.id}`} subjectMembers={subjectMembers} {...field} />} />{editThreadForm.formState.errors.body && <p className="text-sm text-destructive">{editThreadForm.formState.errors.body.message}</p>}</div>
          <div className="flex flex-col gap-2">
            <Label>Attachment</Label>
            <FileUpload
              ref={editFileUploadRef}
              id={`edit-thread-attachment-${thread.id}`}
              uploadUrlEndpoint="/forum/upload-url"
              variant="compact"
              compactTrigger="button"
              disabled={updateThread.isPending}
              value={editAttachment ? [editAttachment] : []}
              onChange={(files) => setEditAttachment(files[0] ?? null)}
              onUploadingChange={setUploadingAttachment}
            />
          </div>
          <DialogFooter><Button type="submit" disabled={updateThread.isPending || uploadingAttachment}>{updateThread.isPending ? "Saving..." : "Save changes"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog open={editingPost !== null} onOpenChange={(open) => !open && setEditingPost(null)}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit reply</DialogTitle><DialogDescription>Update your reply.</DialogDescription></DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={editPostForm.handleSubmit((values) => editingPost && updatePost.mutate({ postId: editingPost.id, request: values }))}>
          <div className="flex flex-col gap-2"><Label htmlFor={`edit-reply-${editingPost?.id ?? thread.id}`}>Reply</Label><Controller control={editPostForm.control} name="body" defaultValue="" render={({ field }) => <MentionTextarea id={`edit-reply-${editingPost?.id ?? thread.id}`} subjectMembers={subjectMembers} {...field} />} />{editPostForm.formState.errors.body && <p className="text-sm text-destructive">{editPostForm.formState.errors.body.message}</p>}</div>
          <DialogFooter><Button type="submit" disabled={updatePost.isPending}>{updatePost.isPending ? "Saving..." : "Save changes"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </Card>
}
