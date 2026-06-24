'use client'

import { ToggleLeft, ToggleRight } from 'lucide-react'
import { StatusToggleButton } from '@/modules/admin/shared/components/StatusToggleButton'
import { toggleProductStatusAction } from '@/modules/admin/products/server/actions'

interface ProductStatusToggleProps {
  id: number
  isActive: boolean
}

export function ProductStatusToggle({ id, isActive }: ProductStatusToggleProps) {
  return (
    <StatusToggleButton
      checked={isActive}
      activeTitle="Desactivar"
      inactiveTitle="Activar"
      activeIcon={<ToggleRight size={13} className="text-emerald-500" />}
      inactiveIcon={<ToggleLeft size={13} />}
      runAction={() => toggleProductStatusAction(id, isActive)}
    />
  )
}
