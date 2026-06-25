export interface ActionFieldErrors {
  [field: string]: string[]
}

export interface ActionResultOptions {
  redirectTo?: string
}

export interface ActionResult<TData = void> {
  ok: boolean
  message: string
  data?: TData
  fieldErrors?: ActionFieldErrors
  redirectTo?: string
}

export type ActionState<TData = void> = ActionResult<TData> | null

export type ActionFormHandler<TData = void> = (
  prevState: ActionState<TData>,
  formData: FormData,
) => Promise<ActionResult<TData>>

export function successResult<TData = void>(
  message: string,
  data?: TData,
  options?: ActionResultOptions,
): ActionResult<TData> {
  return { ok: true, message, data, redirectTo: options?.redirectTo }
}

export function errorResult(
  message: string,
  fieldErrors?: ActionFieldErrors,
  options?: ActionResultOptions,
): ActionResult {
  return { ok: false, message, fieldErrors, redirectTo: options?.redirectTo }
}
