'use client'

import { ToggleLeft, ToggleRight } from 'lucide-react'
import { StatusToggleButton } from '@/modules/admin/shared/components/StatusToggleButton'
import { toggleSupplierStatusAction } from '@/modules/admin/suppliers/server/actions'

interface SupplierStatusToggleProps {
  id: number
  isActive: boolean
}

export function SupplierStatusToggle({ id, isActive }: SupplierStatusToggleProps) {
  return (
    <StatusToggleButton
      checked={isActive}
      activeTitle="Desactivar"
      inactiveTitle="Activar"
      activeIcon={<ToggleRight size={13} className="text-emerald-500" />}
      inactiveIcon={<ToggleLeft size={13} />}
      runAction={() => toggleSupplierStatusAction(id, isActive)}
    />
  )
}
