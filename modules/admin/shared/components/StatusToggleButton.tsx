'use client'

import { type ReactNode, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { ActionResult } from '@/modules/admin/shared/types/action-result'

interface StatusToggleButtonProps {
  checked: boolean
  activeIcon: ReactNode
  inactiveIcon: ReactNode
  activeTitle: string
  inactiveTitle: string
  runAction: () => Promise<ActionResult>
  successBehavior?: 'refresh'
  tone?: 'toggle' | 'danger'
}

export function StatusToggleButton({
  checked,
  activeIcon,
  inactiveIcon,
  activeTitle,
  inactiveTitle,
  runAction,
  successBehavior = 'refresh',
  tone = 'toggle',
}: StatusToggleButtonProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const toneClass = tone === 'danger'
    ? 'hover:bg-red-50 hover:text-brand'
    : 'hover:bg-gray-100 hover:text-amber-600'

  return (
    <button
      type="button"
      disabled={pending}
      className={`p-1.5 rounded-lg text-gray-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${toneClass}`}
      title={checked ? activeTitle : inactiveTitle}
      onClick={() => {
        startTransition(async () => {
          const result = await runAction()

          if (!result.ok) {
            toast.error(result.message)
            return
          }

          toast.success(result.message)

          if (result.redirectTo) {
            router.push(result.redirectTo)
            return
          }

          if (successBehavior === 'refresh') {
            router.refresh()
          }
        })
      }}
    >
      {checked ? activeIcon : inactiveIcon}
    </button>
  )
}
