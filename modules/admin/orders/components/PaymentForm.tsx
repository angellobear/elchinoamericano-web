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
}

const selectClass =
  'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-navy/25 focus:border-navy'

export function PaymentForm({ action, today, maxAmount }: PaymentFormProps) {
  return (
    <ValidatedForm
      action={action}
      className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
      validate={(formData) => {
        const parsed = parsePaymentFormData(formData)
        return parsed.success ? null : getZodErrorMessage(parsed.error)
      }}
    >
      <div>
        <FieldLabel required>Monto ($)</FieldLabel>
        <TextInput name="amount" type="number" min={0.01} max={maxAmount} step="0.01" required />
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
        <TextInput name="reference" maxLength={100} placeholder="N.º de comprobante" />
      </div>
      <div>
        <FieldLabel required>Fecha</FieldLabel>
        <TextInput name="paidAt" type="date" required defaultValue={today} />
      </div>
      <SubmitButton className="px-4 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-dark active:scale-[0.98] transition-all disabled:opacity-60">
        Registrar abono
      </SubmitButton>
    </ValidatedForm>
  )
}
