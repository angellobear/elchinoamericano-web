'use client'

import { Trash2 } from 'lucide-react'
import { StatusToggleButton } from '@/modules/admin/shared/components/StatusToggleButton'
import { deleteCategoryAction } from '@/modules/admin/categories/server/actions'

interface CategoryDeleteButtonProps {
  id: number
}

export function CategoryDeleteButton({ id }: CategoryDeleteButtonProps) {
  return (
    <StatusToggleButton
      checked={false}
      activeTitle="Eliminar"
      inactiveTitle="Eliminar"
      activeIcon={<Trash2 size={13} />}
      inactiveIcon={<Trash2 size={13} />}
      runAction={() => deleteCategoryAction(id)}
      tone="danger"
    />
  )
}
