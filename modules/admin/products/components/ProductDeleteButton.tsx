'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { deleteProductAction } from '@/modules/admin/products/server/actions'

interface ProductDeleteButtonProps {
  id: number
  name: string
}

export function ProductDeleteButton({ id, name }: ProductDeleteButtonProps) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function handleConfirm() {
    startTransition(async () => {
      const result = await deleteProductAction(id)
      setOpen(false)

      if (!result.ok) {
        toast.error(result.message)
        return
      }

      toast.success(result.message)
      router.refresh()
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
        title="Eliminar producto"
      >
        <Trash2 size={13} />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-navy">Eliminar producto</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-slate-600">
            ¿Seguro que deseas eliminar <span className="font-semibold text-slate-800">{name}</span>?
          </p>

          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={pending}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={pending}
              className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {pending ? 'Eliminando…' : 'Eliminar'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
