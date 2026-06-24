export interface ActionFieldErrors {
  [field: string]: string[]
}

export interface ActionResult<TData = void> {
  ok: boolean
  message: string
  data?: TData
  fieldErrors?: ActionFieldErrors
}

export function successResult<TData = void>(message: string, data?: TData): ActionResult<TData> {
  return { ok: true, message, data }
}

export function errorResult(message: string, fieldErrors?: ActionFieldErrors): ActionResult {
  return { ok: false, message, fieldErrors }
}
