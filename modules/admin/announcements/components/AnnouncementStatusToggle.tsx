'use client'

import { ToggleLeft, ToggleRight } from 'lucide-react'
import { StatusToggleButton } from '@/modules/admin/shared/components/StatusToggleButton'
import { toggleAnnouncementStatusAction } from '@/modules/admin/announcements/server/actions'

interface AnnouncementStatusToggleProps {
  id: number
  isActive: boolean
}

export function AnnouncementStatusToggle({ id, isActive }: AnnouncementStatusToggleProps) {
  return (
    <StatusToggleButton
      checked={isActive}
      activeTitle="Desactivar"
      inactiveTitle="Activar"
      activeIcon={<ToggleRight size={13} className="text-emerald-500" />}
      inactiveIcon={<ToggleLeft size={13} />}
      runAction={() => toggleAnnouncementStatusAction(id, isActive)}
    />
  )
}
