'use client'

import { ToggleLeft, ToggleRight } from 'lucide-react'
import { StatusToggleButton } from '@/modules/admin/shared/components/StatusToggleButton'
import { togglePartBrandStatusAction } from '@/modules/admin/part-brands/server/actions'

interface PartBrandStatusToggleProps {
  id: number
  isActive: boolean
}

export function PartBrandStatusToggle({ id, isActive }: PartBrandStatusToggleProps) {
  return (
    <StatusToggleButton
      checked={isActive}
      activeTitle="Desactivar"
      inactiveTitle="Activar"
      activeIcon={<ToggleRight size={13} className="text-emerald-500" />}
      inactiveIcon={<ToggleLeft size={13} />}
      runAction={() => togglePartBrandStatusAction(id, isActive)}
    />
  )
}
