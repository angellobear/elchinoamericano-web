'use client'

import { useActionState, useEffect, useRef, useTransition, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { ActionFormHandler, ActionResult } from '@/modules/admin/shared/types/action-result'

interface ValidatedFormProps {
  action: ActionFormHandler
  children: ReactNode
  className?: string
  validate: (formData: FormData) => string | null
}

export function ValidatedForm({ action, children, className, validate }: ValidatedFormProps) {
  const router = useRouter()
  const [pendingState, formAction] = useActionState<ActionResult | null, FormData>(action, null)
  const [isRedirecting, startTransition] = useTransition()
  const handledState = useRef<ActionResult | null>(null)

  useEffect(() => {
    if (!pendingState || handledState.current === pendingState) return

    handledState.current = pendingState

    if (pendingState.ok) {
      toast.success(pendingState.message)
    } else {
      toast.error(pendingState.message)
    }

    if (!pendingState.redirectTo || isRedirecting) return

    startTransition(() => {
      router.push(pendingState.redirectTo!)
    })
  }, [isRedirecting, pendingState, router])

  return (
    <form
      action={formAction}
      className={className}
      onSubmit={(event) => {
        const formData = new FormData(event.currentTarget)
        const errorMessage = validate(formData)

        if (!errorMessage) return

        event.preventDefault()
        toast.error(errorMessage)
      }}
    >
      {children}
    </form>
  )
}
