'use client'

import { ToggleLeft, ToggleRight } from 'lucide-react'
import { StatusToggleButton } from '@/modules/admin/shared/components/StatusToggleButton'
import { toggleCategoryStatusAction } from '@/modules/admin/categories/server/actions'

interface CategoryStatusToggleProps {
  id: number
  isActive: boolean
}

export function CategoryStatusToggle({ id, isActive }: CategoryStatusToggleProps) {
  return (
    <StatusToggleButton
      checked={isActive}
      activeTitle="Desactivar"
      inactiveTitle="Activar"
      activeIcon={<ToggleRight size={13} className="text-emerald-500" />}
      inactiveIcon={<ToggleLeft size={13} />}
      runAction={() => toggleCategoryStatusAction(id, isActive)}
    />
  )
}
