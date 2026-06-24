import type { ZodError } from 'zod'

export function getZodErrorMessage(error: ZodError): string {
  const firstIssue = error.issues[0]
  return firstIssue?.message ?? 'Hay datos inválidos en el formulario.'
}
