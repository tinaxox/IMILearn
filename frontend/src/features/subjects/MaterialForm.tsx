import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { FileUpload } from "@/components/layout/FileUpload"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Material, MaterialCategory, MaterialRequest, MaterialType } from "@/types/api"

const materialSchema = z.object({ name: z.string().trim().min(1, "Name is required"), type: z.enum(["DOCUMENT", "VIDEO", "IMAGE", "LINK", "OTHER"]), category: z.enum(["LECTURE", "EXERCISES", "EXAM_QUESTIONS", "OTHER"]), path: z.string().trim().min(1, "Path is required") })
type MaterialValues = z.infer<typeof materialSchema>
const materialTypes: Array<{ value: MaterialType; label: string }> = [{ value: "DOCUMENT", label: "Document" }, { value: "VIDEO", label: "Video" }, { value: "IMAGE", label: "Image" }, { value: "LINK", label: "Link" }, { value: "OTHER", label: "Other" }]
const materialCategories: Array<{ value: MaterialCategory; label: string }> = [{ value: "LECTURE", label: "Lecture" }, { value: "EXERCISES", label: "Exercises" }, { value: "EXAM_QUESTIONS", label: "Exam questions" }, { value: "OTHER", label: "Not specified" }]
const materialCategoryLabel = Object.fromEntries(materialCategories.map((category) => [category.value, category.label])) as Record<MaterialCategory, string>
const materialTypeLabel = Object.fromEntries(materialTypes.map((type) => [type.value, type.label])) as Record<MaterialType, string>

interface MaterialFormProps {
  initial?: Material
  subjectId: number
  onSubmit: (values: MaterialRequest) => void
  submitting: boolean
}

export function MaterialForm({ initial, subjectId, onSubmit, submitting }: MaterialFormProps) {
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<MaterialValues>({ resolver: zodResolver(materialSchema), defaultValues: { name: initial?.name ?? "", type: initial?.type ?? "DOCUMENT", category: initial?.category ?? "OTHER", path: initial?.path ?? "" } })
  const [uploading, setUploading] = useState(false)
  const isLink = watch("type") === "LINK"

  return <form onSubmit={handleSubmit((values) => onSubmit({ ...values, subjectId }))} className="flex flex-col gap-4">
    <div className="flex flex-col gap-2"><Label htmlFor="material-name">Name</Label><Input id="material-name" {...register("name")} />{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}</div>
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-2"><Label>Type</Label><Controller name="category" control={control} render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger className="w-full"><SelectValue>{(value: MaterialCategory | null) => value ? materialCategoryLabel[value] : "Select type"}</SelectValue></SelectTrigger><SelectContent label="Type">{materialCategories.map((category) => <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>)}</SelectContent></Select>} /></div>
      <div className="flex flex-col gap-2"><Label>Resource format</Label><Controller name="type" control={control} render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger className="w-full"><SelectValue>{(value: MaterialType | null) => value ? materialTypeLabel[value] : "Select format"}</SelectValue></SelectTrigger><SelectContent label="Resource format">{materialTypes.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent></Select>} /></div>
    </div>
    {isLink
      ? <div className="flex flex-col gap-2"><Label htmlFor="material-path">URL</Label><Input id="material-path" placeholder="https://…" {...register("path")} />{errors.path && <p className="text-sm text-destructive">{errors.path.message}</p>}</div>
      : <div className="flex flex-col gap-2">
          <Label htmlFor="material-file">File</Label>
          <FileUpload
            id="material-file"
            uploadUrlEndpoint="/materials/upload-url"
            variant="dropzone"
            disabled={uploading}
            onUploadingChange={setUploading}
            onChange={(files) => setValue("path", files[0]?.storageKey ?? initial?.path ?? "", { shouldValidate: true })}
            successMessage="File uploaded"
            resetInputOnError={false}
            emptyContent={initial?.path && <p className="text-sm text-muted-foreground">Current file will be kept unless you upload a new one.</p>}
          />
          <input type="hidden" {...register("path")} />
          {errors.path && <p className="text-sm text-destructive">A file upload is required</p>}
        </div>}
    <DialogFooter><Button type="submit" disabled={submitting || uploading}>{submitting ? "Saving…" : initial ? "Save changes" : "Add material"}</Button></DialogFooter>
  </form>
}
