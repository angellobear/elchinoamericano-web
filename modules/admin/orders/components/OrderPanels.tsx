'use client'

import { useState, type ReactNode } from 'react'
import { HandCoins, PackageCheck, Pencil } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { DeliveryPhoto } from '@/lib/orders'
import { DeliveryForm } from '@/modules/admin/orders/components/DeliveryForm'
import { PaymentForm } from '@/modules/admin/orders/components/PaymentForm'
import type { ActionFormHandler } from '@/modules/admin/shared/types/action-result'

// Un solo Dialog: en móvil es un modal centrado; desde md se ancla a la derecha como drawer.
const panelClass =
  'max-h-[92dvh] overflow-y-auto md:top-0 md:right-0 md:left-auto md:h-dvh md:max-h-none md:w-full md:max-w-md md:translate-x-0 md:translate-y-0 md:rounded-none md:border-y-0 md:border-r-0 md:data-[state=open]:zoom-in-100 md:data-[state=closed]:zoom-out-100 md:data-[state=open]:slide-in-from-right md:data-[state=closed]:slide-out-to-right'

const primaryTrigger =
  'inline-flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-lg active:scale-[0.98] transition-all'
const outlineTrigger =
  'inline-flex items-center gap-2 px-3 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors'

interface PanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  children: ReactNode
}

function Panel({ open, onOpenChange, title, description, children }: PanelProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={panelClass}>
        <DialogHeader>
          <DialogTitle className="text-navy">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

interface PaymentPanelProps {
  action: ActionFormHandler
  today: string
  maxAmount: string
}

export function PaymentPanel({ action, today, maxAmount }: PaymentPanelProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`${primaryTrigger} bg-navy hover:bg-navy-dark`}>
        <HandCoins size={15} />
        Registrar abono
      </button>
      <Panel
        open={open}
        onOpenChange={setOpen}
        title="Registrar abono"
        description="Al guardar se genera el recibo de abono para el cliente."
      >
        <PaymentForm action={action} today={today} maxAmount={maxAmount} onSuccess={() => setOpen(false)} />
      </Panel>
    </>
  )
}

interface DeliveryPanelProps {
  action: ActionFormHandler
  delivered: boolean
  defaults: {
    receivedByName?: string
    receivedByIdNumber?: string
    invoiceNumber?: string
    photos: DeliveryPhoto[]
  }
}

export function DeliveryPanel({ action, delivered, defaults }: DeliveryPanelProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {delivered ? (
        <button type="button" onClick={() => setOpen(true)} className={outlineTrigger}>
          <Pencil size={14} />
          Editar datos de entrega
        </button>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className={`${primaryTrigger} bg-brand hover:bg-brand/90`}>
          <PackageCheck size={15} />
          Marcar como entregado
        </button>
      )}
      <Panel
        open={open}
        onOpenChange={setOpen}
        title={delivered ? 'Datos de entrega' : 'Marcar como entregado'}
        description={
          delivered
            ? 'Completa o corrige quién recibió, la factura o las fotos de evidencia.'
            : 'Registra quién recibe el pedido. La factura y las fotos son opcionales.'
        }
      >
        <DeliveryForm action={action} delivered={delivered} defaults={defaults} onSuccess={() => setOpen(false)} />
      </Panel>
    </>
  )
}
