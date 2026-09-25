import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { User, UserType } from "@/types/api"

const userTypes: { value: UserType; label: string }[] = [
  { value: "STUDENT", label: "Student" },
  { value: "PROFESSOR", label: "Professor" },
  { value: "ADMIN", label: "Admin" },
]

const userFields = {
  email: z.string().email("Enter a valid email address"),
  name: z.string().min(1, "Name is required"),
  surname: z.string().min(1, "Surname is required"),
  type: z.enum(["STUDENT", "PROFESSOR", "ADMIN"]),
  espb: z.number().int().min(0).nullable(),
  score: z.number().min(0).max(10).nullable(),
  year: z.number().int().min(1).max(8).nullable(),
  index: z.string().max(64).nullable(),
}

const createUserSchema = z.object({
  ...userFields,
  password: z.string().min(8, "Password must be at least 8 characters"),
})

const editUserSchema = z.object({
  ...userFields,
  password: z.string().refine((value) => value === "" || value.length >= 8, {
    message: "Password must be at least 8 characters",
  }),
})

export type UserFormValues = z.infer<typeof createUserSchema>

interface UserFormProps {
  mode: "create" | "edit"
  user?: User
  isSubmitting: boolean
  onSubmit: (values: UserFormValues) => void
  onCancel: () => void
}

export function UserForm({ mode, user, isSubmitting, onSubmit, onCancel }: UserFormProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(mode === "create" ? createUserSchema : editUserSchema),
    defaultValues: {
      email: user?.email ?? "",
      password: "",
      name: user?.name ?? "",
      surname: user?.surname ?? "",
      type: user?.type ?? "PROFESSOR",
      espb: user?.espb ?? null,
      score: user?.score ?? null,
      year: user?.year ?? null,
      index: user?.index ?? null,
    },
  })

  useEffect(() => {
    form.reset({
      email: user?.email ?? "",
      password: "",
      name: user?.name ?? "",
      surname: user?.surname ?? "",
      type: user?.type ?? "PROFESSOR",
      espb: user?.espb ?? null,
      score: user?.score ?? null,
      year: user?.year ?? null,
      index: user?.index ?? null,
    })
  }, [form, user])

  const passwordHint = mode === "edit" ? "Leave blank to keep current password" : undefined
  const isStudent = form.watch("type") === "STUDENT"

  return (
    <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-2">
        <Label htmlFor={`${mode}-type`}>Type</Label>
        <Controller control={form.control} name="type" render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger id={`${mode}-type`} className="w-full"><SelectValue placeholder="Select a user type" /></SelectTrigger>
            <SelectContent label="Type">{userTypes.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent>
          </Select>
        )} />
        {form.formState.errors.type && <p className="text-xs text-destructive">{form.formState.errors.type.message}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${mode}-email`}>Email</Label>
        <Input id={`${mode}-email`} type="email" {...form.register("email")} />
        {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
      </div>
      {isStudent && <div className="grid gap-3 rounded-lg border border-border bg-muted/30 p-3 sm:grid-cols-2">
        <div className="grid gap-2"><Label htmlFor={`${mode}-index`}>Index</Label><Input id={`${mode}-index`} placeholder="2026/0001" {...form.register("index", { setValueAs: (value) => value || null })} />{form.formState.errors.index && <p className="text-xs text-destructive">{form.formState.errors.index.message}</p>}</div>
        <div className="grid gap-2"><Label htmlFor={`${mode}-year`}>Study year</Label><Input id={`${mode}-year`} type="number" min={1} max={8} {...form.register("year", { setValueAs: (value) => value === "" ? null : Number(value) })} />{form.formState.errors.year && <p className="text-xs text-destructive">{form.formState.errors.year.message}</p>}</div>
        <div className="grid gap-2"><Label htmlFor={`${mode}-espb`}>ESPB</Label><Input id={`${mode}-espb`} type="number" min={0} {...form.register("espb", { setValueAs: (value) => value === "" ? null : Number(value) })} />{form.formState.errors.espb && <p className="text-xs text-destructive">{form.formState.errors.espb.message}</p>}</div>
        <div className="grid gap-2"><Label htmlFor={`${mode}-score`}>Score</Label><Input id={`${mode}-score`} type="number" min={0} max={10} step="any" {...form.register("score", { setValueAs: (value) => value === "" ? null : Number(value) })} />{form.formState.errors.score && <p className="text-xs text-destructive">{form.formState.errors.score.message}</p>}</div>
      </div>}
      <div className="grid gap-2">
        <Label htmlFor={`${mode}-password`}>Password</Label>
        <Input id={`${mode}-password`} type="password" {...form.register("password")} />
        {passwordHint && <p className="text-xs text-muted-foreground">{passwordHint}</p>}
        {form.formState.errors.password && <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
        <div className="grid gap-2"><Label htmlFor={`${mode}-name`}>Name</Label><Input id={`${mode}-name`} {...form.register("name")} />{form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}</div>
        <div className="grid gap-2"><Label htmlFor={`${mode}-surname`}>Surname</Label><Input id={`${mode}-surname`} {...form.register("surname")} />{form.formState.errors.surname && <p className="text-xs text-destructive">{form.formState.errors.surname.message}</p>}</div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : mode === "create" ? "Create user" : "Save changes"}</Button>
      </DialogFooter>
    </form>
  )
}
