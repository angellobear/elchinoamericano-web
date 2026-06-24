'use client'

import { ToggleLeft, ToggleRight } from 'lucide-react'
import { StatusToggleButton } from '@/modules/admin/shared/components/StatusToggleButton'
import { toggleVehicleBrandStatusAction } from '@/modules/admin/vehicle-brands/server/actions'

interface VehicleBrandStatusToggleProps {
  id: number
  isActive: boolean
}

export function VehicleBrandStatusToggle({ id, isActive }: VehicleBrandStatusToggleProps) {
  return (
    <StatusToggleButton
      checked={isActive}
      activeTitle="Desactivar"
      inactiveTitle="Activar"
      activeIcon={<ToggleRight size={14} className="text-emerald-500" />}
      inactiveIcon={<ToggleLeft size={14} />}
      runAction={() => toggleVehicleBrandStatusAction(id, isActive)}
    />
  )
}
