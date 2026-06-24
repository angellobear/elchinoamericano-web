'use client'

import { Trash2 } from 'lucide-react'
import { StatusToggleButton } from '@/modules/admin/shared/components/StatusToggleButton'
import { deleteSupplierAction } from '@/modules/admin/suppliers/server/actions'

interface SupplierDeleteButtonProps {
  id: number
}

export function SupplierDeleteButton({ id }: SupplierDeleteButtonProps) {
  return (
    <StatusToggleButton
      checked={false}
      activeTitle="Eliminar"
      inactiveTitle="Eliminar"
      activeIcon={<Trash2 size={13} />}
      inactiveIcon={<Trash2 size={13} />}
      runAction={() => deleteSupplierAction(id)}
      tone="danger"
    />
  )
}
