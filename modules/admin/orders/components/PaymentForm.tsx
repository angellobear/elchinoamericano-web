'use client'

import { SubmitButton } from '@/app/admin/_components/SubmitButton'
import { PAYMENT_METHODS, PAYMENT_METHOD_LABEL } from '@/lib/orders'
import { parsePaymentFormData } from '@/modules/admin/orders/form-schema'
import { FieldLabel, TextInput } from '@/modules/admin/shared/components/AdminFormControls'
import { ValidatedForm } from '@/modules/admin/shared/components/ValidatedForm'
import { getZodErrorMessage } from '@/modules/admin/shared/server/zod'
import type { ActionFormHandler } from '@/modules/admin/shared/types/action-result'

interface PaymentFormProps {
  action: ActionFormHandler
  today: string
  maxAmount: string
  onSuccess?: () => void
}

const selectClass =
  'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-navy/25 focus:border-navy'

export function PaymentForm({ action, today, maxAmount, onSuccess }: PaymentFormProps) {
  return (
    <ValidatedForm
      action={action}
      onSuccess={onSuccess}
      className="space-y-4"
      validate={(formData) => {
        const parsed = parsePaymentFormData(formData)
        return parsed.success ? null : getZodErrorMessage(parsed.error)
      }}
    >
      <div>
        <FieldLabel required>Monto ($)</FieldLabel>
        <TextInput name="amount" type="number" min={0.01} max={maxAmount} step="0.01" required autoFocus />
        <p className="text-xs text-slate-400 mt-1">Saldo pendiente: ${maxAmount}</p>
      </div>
      <div>
        <FieldLabel required>Forma de pago</FieldLabel>
        <select name="method" required defaultValue="efectivo" className={selectClass}>
          {PAYMENT_METHODS.map((method) => (
            <option key={method} value={method}>
              {PAYMENT_METHOD_LABEL[method]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <FieldLabel>Referencia</FieldLabel>
        <TextInput name="reference" maxLength={100} placeholder="N.º de comprobante (opcional)" />
      </div>
      <div>
        <FieldLabel required>Fecha</FieldLabel>
        <TextInput name="paidAt" type="date" required defaultValue={today} />
      </div>
      <p className="text-xs text-slate-500">
        Un abono no se puede editar después, solo anular. Revisa el monto y la forma de pago antes de guardar.
      </p>
      <SubmitButton className="w-full px-4 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-dark active:scale-[0.98] transition-all disabled:opacity-60">
        Registrar abono
      </SubmitButton>
    </ValidatedForm>
  )
}
