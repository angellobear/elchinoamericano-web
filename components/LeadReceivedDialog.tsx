"use client"

import { CheckCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface LeadReceivedDialogProps {
  open: boolean
  onClose: () => void
  title: string
  description: string
}

/** Confirmación tras guardar un lead (solicitud de repuesto o pedido del carrito). */
export default function LeadReceivedDialog({ open, onClose, title, description }: LeadReceivedDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader className="items-center gap-3 text-center sm:text-center">
          <div className="w-14 h-14 bg-wa/10 rounded-full flex items-center justify-center">
            <CheckCircle size={28} className="text-wa" />
          </div>
          <DialogTitle className="font-display font-bold text-navy text-xl">{title}</DialogTitle>
          <DialogDescription className="text-slate-500 text-sm">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-navy hover:bg-navy/90 text-white text-sm font-semibold transition-colors"
          >
            Entendido
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
