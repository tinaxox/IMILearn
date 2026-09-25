import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Subject, SubjectRequest } from "@/types/api"

const subjectSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  year: z.number().int("Year must be a whole number").min(1, "Year must be between 1 and 6").max(6, "Year must be between 1 and 6"),
})

type SubjectFormValues = z.infer<typeof subjectSchema>

interface SubjectFormProps {
  initial?: Subject
  onSubmit: (values: SubjectRequest) => void
  submitting: boolean
}

export function SubjectForm({ initial, onSubmit, submitting }: SubjectFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    ...(initial ? { defaultValues: { name: initial.name, year: initial.year } } : {}),
  })
  const mode = initial ? "edit" : "create"

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(values))} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2"><Label htmlFor={`${mode === "edit" ? "edit-" : ""}subject-name`}>Name</Label><Input id={`${mode === "edit" ? "edit-" : ""}subject-name`} {...register("name")} />{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}</div>
      <div className="flex flex-col gap-2"><Label htmlFor={`${mode === "edit" ? "edit-" : ""}subject-year`}>Year</Label><Input id={`${mode === "edit" ? "edit-" : ""}subject-year`} type="number" min={1} max={6} {...register("year", { valueAsNumber: true })} />{errors.year && <p className="text-sm text-destructive">{initial ? "Year must be between 1 and 6" : errors.year.message}</p>}</div>
      <DialogFooter><Button type="submit" disabled={submitting}>{submitting ? (initial ? "Saving…" : "Creating…") : initial ? "Save changes" : "Create subject"}</Button></DialogFooter>
    </form>
  )
}
