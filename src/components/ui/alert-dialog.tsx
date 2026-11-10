import { useRef, useState } from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  pendingLabel?: string
  cancelLabel?: string
  destructive?: boolean
  /**
   * Must return a promise for the work behind the confirmation. Rejection keeps
   * the dialog open (the caller is expected to surface the error via toast) so
   * the admin can retry without losing the row context.
   */
  onConfirm: () => Promise<void>
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  pendingLabel = "Memproses...",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
}: AlertDialogProps) {
  const [pending, setPending] = useState(false)
  // State alone is not enough: two clicks in the same tick both read the old
  // value, so this ref latch is what actually blocks a double submit.
  const inFlight = useRef(false)

  const handleConfirm = async () => {
    if (inFlight.current) return
    inFlight.current = true
    setPending(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch {
      // Error already reported by the caller; stay open for a retry.
    } finally {
      inFlight.current = false
      setPending(false)
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    // Do not let Escape or a backdrop click hide a request that is in flight.
    if (pending && !nextOpen) return
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false} aria-busy={pending}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={pending} />}>
            {cancelLabel}
          </DialogClose>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={() => void handleConfirm()}
            disabled={pending}
          >
            {pending ? pendingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
