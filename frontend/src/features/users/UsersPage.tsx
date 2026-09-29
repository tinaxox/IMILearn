import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient } from "@/lib/api-client"
import type { User, UserRequest, UserUpdateRequest } from "@/types/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTable } from "@/components/layout/DataTable"
import { ConfirmDeleteDialog } from "@/components/layout/ConfirmDeleteDialog"
import { UserForm, type UserFormValues } from "@/features/users/UserForm"
import { usersGridColumns } from "@/features/users/usersGridColumns"

export default function UsersPage() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await apiClient.get<User[]>("/users")).data,
  })

  const createMutation = useMutation({
    mutationFn: (values: UserRequest) => apiClient.post<User>("/users", values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] })
      setCreateOpen(false)
      toast.success("User created")
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: number; values: UserUpdateRequest }) =>
      (await apiClient.put<User>(`/users/${id}`, values)).data,
    onSuccess: async (updatedUser) => {
      queryClient.setQueryData<User[]>(["users"], (current) =>
        current?.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
      )
      await queryClient.invalidateQueries({ queryKey: ["users"] })
      setEditingUser(null)
      toast.success("User updated")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/users/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] })
      setDeletingUser(null)
      toast.success("User deleted")
    },
  })

  const handleCreate = (values: UserFormValues) => createMutation.mutate(values)
  const handleUpdate = (values: UserFormValues) => {
    if (!editingUser) return
    const { password, ...rest } = values
    updateMutation.mutate({
      id: editingUser.id,
      values: { ...rest, ...(password ? { password } : {}) },
    })
  }

  const columns = usersGridColumns({
    onEdit: (user) => setEditingUser(user),
    onDelete: (user) => setDeletingUser(user),
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="page-heading">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-muted-foreground">Manage accounts and access levels.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>Create user</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All users</CardTitle>
        </CardHeader>
        <CardContent>
          {usersQuery.isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : usersQuery.data?.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No users found.</p>
          ) : (
            <DataTable
              data={usersQuery.data ?? []}
              columns={columns}
              containerClassName="max-h-[23.5rem] overflow-y-auto"
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create user</DialogTitle>
            <DialogDescription>Add a new account to the platform.</DialogDescription>
          </DialogHeader>
          <UserForm
            mode="create"
            isSubmitting={createMutation.isPending}
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editingUser !== null}
        onOpenChange={(open) => {
          if (!open) setEditingUser(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>Update this user’s account details.</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <UserForm
              mode="edit"
              user={editingUser}
              isSubmitting={updateMutation.isPending}
              onSubmit={handleUpdate}
              onCancel={() => setEditingUser(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deletingUser !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingUser(null)
        }}
        title="Delete user?"
        description={`This will deactivate ${deletingUser?.email}. This action cannot be undone from this page.`}
        confirmLabel="Delete user"
        pending={deleteMutation.isPending}
        onConfirm={() => deletingUser && deleteMutation.mutate(deletingUser.id)}
      />
    </div>
  )
}
