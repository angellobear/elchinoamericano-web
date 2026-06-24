export function getRequiredString(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim()
}

export function getOptionalString(formData: FormData, key: string): string | undefined {
  const value = String(formData.get(key) ?? '').trim()
  return value ? value : undefined
}

export function getBoolean(formData: FormData, key: string): boolean {
  return formData.get(key) === 'on'
}

export function getNumber(formData: FormData, key: string, fallback = 0): number {
  const value = Number(formData.get(key))
  return Number.isFinite(value) ? value : fallback
}
