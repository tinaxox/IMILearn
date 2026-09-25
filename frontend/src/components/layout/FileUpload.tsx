import { forwardRef, useImperativeHandle, useRef, useState, type ReactNode } from "react"
import { FileText, Paperclip, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { apiClient, getErrorMessage } from "@/lib/api-client"
import type { UploadUrl } from "@/types/api"

export interface UploadedFile {
  storageKey: string
  fileName: string
  contentType: string
  sizeBytes: number
}

export interface FileUploadHandle {
  upload: () => Promise<UploadedFile[]>
  clear: () => void
  resetInput: () => void
}

export interface FileUploadProps {
  id: string
  uploadUrlEndpoint: string
  variant: "dropzone" | "compact"
  multiple?: boolean
  deferred?: boolean
  disabled?: boolean
  value?: UploadedFile[]
  onChange?: (files: UploadedFile[]) => void
  onUploadingChange?: (uploading: boolean) => void
  onSelectionChange?: (hasFiles: boolean) => void
  successMessage?: string
  showErrorToast?: boolean
  showUploading?: boolean
  resetInputOnError?: boolean
  useContentTypeFallback?: boolean
  dropzoneTitle?: string
  dropzoneDescription?: string
  emptyContent?: ReactNode
  selectedIcon?: "file" | "paperclip"
  compactTrigger?: "icon" | "button"
  compactAriaLabel?: string
}

export const FileUpload = forwardRef<FileUploadHandle, FileUploadProps>(function FileUpload({
  id,
  uploadUrlEndpoint,
  variant,
  multiple = false,
  deferred = false,
  disabled = false,
  value,
  onChange,
  onUploadingChange,
  onSelectionChange,
  successMessage,
  showErrorToast = true,
  showUploading = true,
  resetInputOnError = true,
  useContentTypeFallback = true,
  dropzoneTitle = multiple ? "Choose files to upload" : "Choose a file to upload",
  dropzoneDescription = multiple ? "You can select multiple files" : "Click to browse your files",
  emptyContent,
  selectedIcon = "file",
  compactTrigger = "icon",
  compactAriaLabel = "Attach a file",
}: FileUploadProps, ref) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [internalValue, setInternalValue] = useState<UploadedFile[]>([])
  const uploadedFiles = value ?? internalValue

  const setUploadedFiles = (files: UploadedFile[]) => {
    if (value === undefined) setInternalValue(files)
    onChange?.(files)
  }

  const resetInput = () => {
    if (inputRef.current) inputRef.current.value = ""
  }

  const clear = () => {
    setPendingFiles([])
    setUploadedFiles([])
    onSelectionChange?.(false)
    resetInput()
  }

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return []
    setUploading(true)
    onUploadingChange?.(true)
    try {
      const uploaded = await Promise.all(files.map(async (file): Promise<UploadedFile> => {
        const contentType = useContentTypeFallback ? file.type || "application/octet-stream" : file.type
        const uploadResponse = await apiClient.post<UploadUrl>(uploadUrlEndpoint, { fileName: file.name, contentType, sizeBytes: file.size })
        const storageResponse = await fetch(uploadResponse.data.url, { method: "PUT", body: file, headers: { "Content-Type": contentType } })
        if (!storageResponse.ok) throw new Error(`Upload failed for ${file.name}`)
        return { storageKey: uploadResponse.data.storageKey, fileName: file.name, contentType, sizeBytes: file.size }
      }))
      if (successMessage) toast.success(successMessage)
      return uploaded
    } catch (error) {
      if (resetInputOnError) resetInput()
      if (showErrorToast) toast.error(getErrorMessage(error))
      throw error
    } finally {
      setUploading(false)
      onUploadingChange?.(false)
    }
  }

  useImperativeHandle(ref, () => ({
    upload: () => uploadFiles(pendingFiles),
    clear,
    resetInput,
  }))

  const selectFiles = async (files: File[]) => {
    if (deferred) {
      setPendingFiles(files)
      onSelectionChange?.(files.length > 0)
      return
    }
    if (files.length === 0) return
    try {
      const uploaded = await uploadFiles(files)
      setUploadedFiles(multiple ? [...uploadedFiles, ...uploaded] : uploaded.slice(0, 1))
    } catch {
    }
  }

  const removePendingFile = (index: number) => {
    const next = pendingFiles.filter((_, currentIndex) => currentIndex !== index)
    setPendingFiles(next)
    onSelectionChange?.(next.length > 0)
    if (next.length === 0) resetInput()
  }

  const removeUploadedFile = (index: number) => {
    const next = uploadedFiles.filter((_, currentIndex) => currentIndex !== index)
    setUploadedFiles(next)
    if (next.length === 0) resetInput()
  }

  const filesToDisplay = deferred
    ? pendingFiles.map((file) => ({ fileName: file.name, key: `${file.name}-${file.lastModified}` }))
    : uploadedFiles.map((file) => ({ fileName: file.fileName, key: file.storageKey }))

  const fileInput = <input
    ref={inputRef}
    id={id}
    className="sr-only"
    type="file"
    multiple={multiple}
    disabled={disabled || uploading}
    onChange={(event) => void selectFiles(Array.from(event.target.files ?? []))}
  />

  if (variant === "compact") {
    const attachment = uploadedFiles[0]
    const isButtonTrigger = compactTrigger === "button"
    return <div className="flex min-w-0 items-center gap-2">
      {fileInput}
      <Button
        type="button"
        size={isButtonTrigger ? "sm" : "icon-sm"}
        variant={isButtonTrigger ? "outline" : "ghost"}
        aria-label={isButtonTrigger ? undefined : compactAriaLabel}
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
      >
        <Paperclip />{isButtonTrigger && (attachment ? "Replace" : "Attach file")}
      </Button>
      {uploading && <span className={`${isButtonTrigger ? "text-sm" : "text-xs"} text-muted-foreground`}>Uploading…</span>}
      {!uploading && attachment && <div className={isButtonTrigger
        ? "flex min-w-0 flex-1 items-center gap-1 rounded-md bg-muted px-2 py-1 text-sm"
        : "flex min-w-0 items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs"
      }>
        {isButtonTrigger ? <FileText className="size-4 shrink-0 text-primary" /> : <Paperclip className="size-3.5 shrink-0 text-primary" />}
        <span className={isButtonTrigger ? "min-w-0 flex-1 truncate" : "max-w-52 truncate"}>{attachment.fileName}</span>
        <Button type="button" variant="ghost" size="icon-xs" aria-label={`Remove ${attachment.fileName}`} className="text-muted-foreground hover:text-destructive" onClick={() => removeUploadedFile(0)}><X /></Button>
      </div>}
    </div>
  }

  const SelectedIcon = selectedIcon === "paperclip" ? Paperclip : FileText
  const renderSelectedFile = (file: { fileName: string; key: string }, index: number) => <div key={`${file.key}-${index}`} className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
    <SelectedIcon className="size-4 text-primary" />
    <span className="min-w-0 flex-1 truncate">{file.fileName}</span>
    <Button type="button" variant="ghost" size="icon-sm" aria-label={`Remove ${file.fileName}`} className="text-muted-foreground hover:text-destructive" onClick={() => deferred ? removePendingFile(index) : removeUploadedFile(index)}><X /></Button>
  </div>

  return <>
    <label htmlFor={id} className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#bfc8dc] bg-[#fafbff] px-5 py-6 text-center transition-colors hover:border-primary hover:bg-accent/50">
      <Upload className="mb-2 size-5 text-primary" />
      <span className="text-sm font-medium">{dropzoneTitle}</span>
      <span className="mt-1 text-xs text-muted-foreground">{dropzoneDescription}</span>
    </label>
    {fileInput}
    {uploading && showUploading && <p className="text-sm text-muted-foreground">Uploading…</p>}
    {(!uploading || !showUploading) && filesToDisplay.length > 0 && (multiple
      ? <div className="flex flex-col gap-2">{filesToDisplay.map(renderSelectedFile)}</div>
      : renderSelectedFile(filesToDisplay[0], 0)
    )}
    {(!uploading || !showUploading) && filesToDisplay.length === 0 && emptyContent}
  </>
})
