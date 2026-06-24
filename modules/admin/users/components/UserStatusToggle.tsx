'use client'

import { ToggleLeft, ToggleRight } from 'lucide-react'
import { StatusToggleButton } from '@/modules/admin/shared/components/StatusToggleButton'
import { toggleUserStatusAction } from '@/modules/admin/users/server/actions'

interface UserStatusToggleProps {
  id: string
  isActive: boolean
}

export function UserStatusToggle({ id, isActive }: UserStatusToggleProps) {
  return (
    <StatusToggleButton
      checked={isActive}
      activeTitle="Desactivar"
      inactiveTitle="Activar"
      activeIcon={<ToggleRight size={13} className="text-emerald-500" />}
      inactiveIcon={<ToggleLeft size={13} />}
      runAction={() => toggleUserStatusAction(id, isActive)}
    />
  )
}
