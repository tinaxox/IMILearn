import { useCallback, useEffect, useState } from "react"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Bell } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { ConfirmDeleteDialog } from "@/components/layout/ConfirmDeleteDialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { isCurrentForumThreadId } from "@/features/forum/current-thread"
import { apiClient } from "@/lib/api-client"
import { formatDateTime } from "@/lib/utils"
import { subscribeToTopic } from "@/lib/ws-client"
import type { NotificationResponse, NotificationType, Page } from "@/types/api"

const notificationTab: Partial<Record<NotificationType, string>> = {
  SUBJECT_MEMBER_ADDED: "members",
  ASSIGNMENT_CREATED: "assignments",
  ASSIGNMENT_GRADED: "assignments",
  EXAM_SCHEDULED: "exams",
  EXAM_TIME_CHANGED: "exams",
  EXAM_GRADED: "exams",
  FORUM_THREAD_CREATED: "forum",
  FORUM_POST_CREATED: "forum",
  FORUM_MENTION: "forum",
}

export function NotificationsMenu() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [deleteNotificationsOpen, setDeleteNotificationsOpen] = useState(false)
  const notifications = useInfiniteQuery({
    queryKey: ["notifications"],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => (await apiClient.get<Page<NotificationResponse>>("/notifications", { params: { page: pageParam, size: 10 } })).data,
    getNextPageParam: (lastPage) => lastPage.number + 1 < lastPage.totalPages ? lastPage.number + 1 : undefined,
  })
  const unreadCount = useQuery({ queryKey: ["notifications", "unread-count"], queryFn: async () => (await apiClient.get<{ count: number }>("/notifications/unread-count")).data.count })
  const invalidateNotifications = useCallback(() => Promise.all([queryClient.invalidateQueries({ queryKey: ["notifications"] }), queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] })]), [queryClient])
  const markRead = useMutation({ mutationFn: (id: number) => apiClient.patch(`/notifications/${id}/read`), onSuccess: async () => { await invalidateNotifications() } })
  const markSelectedRead = useMutation({
    mutationFn: (ids: number[]) => Promise.all(ids.map((id) => apiClient.patch(`/notifications/${id}/read`))),
    onSuccess: async () => {
      await invalidateNotifications()
      setSelectionMode(false)
      setSelectedIds(new Set())
    },
  })
  const deleteSelectedNotifications = useMutation({
    mutationFn: (ids: number[]) => Promise.all(ids.map((id) => apiClient.delete(`/notifications/${id}`))),
    onSuccess: async () => {
      await invalidateNotifications()
      setSelectionMode(false)
      setSelectedIds(new Set())
      setDeleteNotificationsOpen(false)
    },
  })

  useEffect(() => subscribeToTopic("/user/queue/notifications", (payload) => {
    const notification = payload as NotificationResponse
    void invalidateNotifications()
    if ((notification.type === "FORUM_THREAD_CREATED" || notification.type === "FORUM_POST_CREATED" || notification.type === "FORUM_MENTION") && isCurrentForumThreadId(notification.referenceId)) return
    toast.info(notification.title)
  }), [invalidateNotifications])

  const notificationItems = notifications.data?.pages.flatMap((page) => page.content) ?? []
  const allSelected = notificationItems.length > 0 && notificationItems.every((notification) => selectedIds.has(notification.id))
  const toggleNotificationSelection = (id: number) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const toggleSelectAll = () => setSelectedIds(allSelected ? new Set() : new Set(notificationItems.map((notification) => notification.id)))
  const toggleSelectionMode = () => {
    setSelectionMode((current) => !current)
    setSelectedIds(new Set())
  }

  return <>
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="Notifications" className="relative" />}><Bell />{Boolean(unreadCount.data) && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-2">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between gap-2 px-1 py-2">
            <span>Notifications</span>
            <div className="flex items-center gap-2">
              {selectionMode && <>
                <button type="button" className="text-xs font-normal text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50" disabled={!notificationItems.length} onClick={toggleSelectAll}>{allSelected ? "Deselect all" : "Select all"}</button>
                <button type="button" className="text-xs font-normal text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50" disabled={!selectedIds.size || markSelectedRead.isPending || deleteSelectedNotifications.isPending} onClick={() => markSelectedRead.mutate([...selectedIds])}>Mark as read</button>
                <button type="button" className="text-xs font-normal text-destructive hover:underline disabled:cursor-not-allowed disabled:opacity-50" disabled={!selectedIds.size || markSelectedRead.isPending || deleteSelectedNotifications.isPending} onClick={() => setDeleteNotificationsOpen(true)}>Delete</button>
              </>}
              <button type="button" className="text-xs font-normal text-primary hover:underline" onClick={toggleSelectionMode}>{selectionMode ? "Cancel" : "Select"}</button>
            </div>
          </DropdownMenuLabel>
          <div className="max-h-80 divide-y divide-border overflow-y-auto" onScroll={(event) => {
            const list = event.currentTarget
            if (list.scrollTop + list.clientHeight >= list.scrollHeight - 48 && notifications.hasNextPage && !notifications.isFetchingNextPage) notifications.fetchNextPage()
          }}>
            {!notificationItems.length && <div className="px-2 py-3 text-sm text-muted-foreground">No notifications.</div>}
            {notificationItems.map((notification) => selectionMode ? (
              <div key={notification.id} className="flex items-center gap-2.5 px-2.5 py-2.5 text-sm">
                <Checkbox checked={selectedIds.has(notification.id)} aria-label={`Select ${notification.title}`} onCheckedChange={() => toggleNotificationSelection(notification.id)} />
                <div className="min-w-0"><p className={`truncate ${notification.read ? "font-normal" : "font-semibold"}`}>{notification.title}</p><p className="line-clamp-2 text-xs text-muted-foreground">{notification.message}</p><p className="mt-1 text-[10px] text-muted-foreground">{formatDateTime(notification.createdAt)}</p></div>
              </div>
            ) : <DropdownMenuItem key={notification.id} className="rounded-none px-2.5 py-2.5 focus:bg-transparent" onClick={() => { markRead.mutate(notification.id); if (notification.subjectId) navigate(`/subjects/${notification.subjectId}${notificationTab[notification.type] ? `?tab=${notificationTab[notification.type]}` : ""}`) }}><div className="min-w-0"><p className={`truncate ${notification.read ? "font-normal" : "font-semibold"}`}>{notification.title}</p><p className="line-clamp-2 text-xs text-muted-foreground">{notification.message}</p><p className="mt-1 text-[10px] text-muted-foreground">{formatDateTime(notification.createdAt)}</p></div></DropdownMenuItem>)}
            {notifications.isFetchingNextPage && <div className="px-2 py-2 text-center text-xs text-muted-foreground">Loading…</div>}
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
    <ConfirmDeleteDialog open={deleteNotificationsOpen} onOpenChange={setDeleteNotificationsOpen} title={`Delete ${selectedIds.size} notification${selectedIds.size === 1 ? "" : "s"}?`} onConfirm={() => deleteSelectedNotifications.mutate([...selectedIds])} pending={deleteSelectedNotifications.isPending} />
  </>
}
