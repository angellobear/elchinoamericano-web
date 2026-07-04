'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { deleteVehicleBrandAction } from '@/modules/admin/vehicle-brands/server/actions'

interface VehicleBrandDeleteButtonProps {
  id: number
  name: string
  modelCount: number
}

export function VehicleBrandDeleteButton({ id, name, modelCount }: VehicleBrandDeleteButtonProps) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function handleConfirm() {
    startTransition(async () => {
      const result = await deleteVehicleBrandAction(id)
      if (!result.ok) {
        toast.error(result.message)
        setOpen(false)
        return
      }
      toast.success(result.message)
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
        title="Eliminar marca"
      >
        <Trash2 size={14} />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-navy">Eliminar marca</DialogTitle>
          </DialogHeader>

          <div className="text-sm text-slate-600 space-y-2">
            <p>
              ¿Seguro que deseas eliminar <span className="font-semibold text-slate-800">{name}</span>?
            </p>
            {modelCount > 0 && (
              <p className="bg-red-50 text-red-700 rounded-lg px-3 py-2 text-xs font-medium">
                Se eliminarán {modelCount} modelo{modelCount !== 1 ? 's' : ''} y todas las compatibilidades de productos asociadas.
              </p>
            )}
          </div>

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
