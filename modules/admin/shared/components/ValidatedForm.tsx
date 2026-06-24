'use client'

import type { ReactNode } from 'react'
import { toast } from 'sonner'

interface ValidatedFormProps {
  action: (formData: FormData) => void | Promise<void>
  children: ReactNode
  className?: string
  validate: (formData: FormData) => string | null
}

export function ValidatedForm({ action, children, className, validate }: ValidatedFormProps) {
  return (
    <form
      action={action}
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
