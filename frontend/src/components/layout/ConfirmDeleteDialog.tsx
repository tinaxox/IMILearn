import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface ConfirmDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  pendingLabel?: string
  onConfirm: () => void
  pending?: boolean
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description = "This action cannot be undone.",
  confirmLabel = "Delete",
  pendingLabel = "Deleting...",
  onConfirm,
  pending = false,
}: ConfirmDeleteDialogProps) {
  return <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription>{description}</AlertDialogDescription></AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction variant="destructive" disabled={pending} onClick={onConfirm}>{pending ? pendingLabel : confirmLabel}</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
}
