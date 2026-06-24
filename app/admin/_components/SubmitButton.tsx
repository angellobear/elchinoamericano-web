'use client'

import { useFormStatus } from 'react-dom'

interface Props {
  children: React.ReactNode
  className?: string
  pendingText?: string
}

export function SubmitButton({ children, className, pendingText = 'Guardando…' }: Props) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingText : children}
    </button>
  )
}
