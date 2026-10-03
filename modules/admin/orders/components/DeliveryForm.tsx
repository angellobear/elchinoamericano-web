'use client'

import { ImageUploadField } from '@/app/admin/_components/ImageUploadField'
import { SubmitButton } from '@/app/admin/_components/SubmitButton'
import { MAX_DELIVERY_PHOTOS, MAX_PHOTO_BYTES, type DeliveryPhoto } from '@/lib/orders'
import { parseDeliveryFormData } from '@/modules/admin/orders/form-schema'
import { CheckboxField, FieldLabel, TextInput } from '@/modules/admin/shared/components/AdminFormControls'
import { ValidatedForm } from '@/modules/admin/shared/components/ValidatedForm'
import { getZodErrorMessage } from '@/modules/admin/shared/server/zod'
import type { ActionFormHandler } from '@/modules/admin/shared/types/action-result'

interface DeliveryFormProps {
  action: ActionFormHandler
  delivered: boolean
  defaults: {
    receivedByName?: string
    invoiceNumber?: string
    photos: DeliveryPhoto[]
  }
  onSuccess?: () => void
}

export function DeliveryForm({ action, delivered, defaults, onSuccess }: DeliveryFormProps) {
  return (
    <ValidatedForm
      action={action}
      onSuccess={onSuccess}
      className="space-y-4"
      validate={(formData) => {
        for (let slot = 0; slot < MAX_DELIVERY_PHOTOS; slot++) {
          const file = formData.get(`photo${slot}`)
          // Las fotos se reducen en el navegador al elegirlas; esto solo atrapa una que no se pudo reducir.
          if (file instanceof File && file.size > MAX_PHOTO_BYTES) {
            return 'Una foto pesa más de 4 MB y no se pudo reducir. Espera a que termine de optimizarse o elige otra foto.'
          }
        }

        const parsed = parseDeliveryFormData(formData)
        return parsed.success ? null : getZodErrorMessage(parsed.error)
      }}
    >
      <div>
        <FieldLabel required>Quién recibe</FieldLabel>
        <TextInput
          name="receivedByName"
          required
          maxLength={150}
          defaultValue={defaults.receivedByName ?? ''}
          placeholder="Nombre de la persona que recibe"
        />
      </div>
      {/* La factura no se pide al entregar (puede emitirse después): solo al editar los datos de entrega. */}
      {delivered ? (
        <div>
          <FieldLabel>N.º de factura</FieldLabel>
          <TextInput
            name="invoiceNumber"
            maxLength={50}
            defaultValue={defaults.invoiceNumber ?? ''}
            placeholder="Solo si se emitió factura"
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: MAX_DELIVERY_PHOTOS }, (_, slot) => (
          <ImageUploadField
            // La key cambia con la foto guardada para que el campo se reinicie tras guardar.
            key={`${slot}-${defaults.photos[slot]?.publicId ?? 'vacio'}`}
            name={`photo${slot}`}
            label={`Foto de evidencia ${slot + 1} (opcional)`}
            currentUrl={defaults.photos[slot]?.url}
            currentPublicId={defaults.photos[slot]?.publicId}
            compress
          />
        ))}
      </div>

      {!delivered ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2">
          <p className="text-xs text-amber-800">
            El pedido pasará a &quot;Entregado&quot; y sus ítems ya no se podrán editar; estos datos de entrega solo
            se pueden corregir durante la primera hora. Se descuenta del inventario cada ítem que viene del catálogo;
            si falta stock, no se entrega nada.
          </p>
          {/* Sin `name`: solo obliga a confirmar en el navegador, no viaja al servidor. */}
          <CheckboxField required label="Confirmo que el pedido fue entregado al cliente" />
        </div>
      ) : null}

      <SubmitButton
        pendingText={delivered ? 'Guardando…' : 'Entregando…'}
        className="w-full px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-dark active:scale-[0.98] transition-all disabled:opacity-60"
      >
        {delivered ? 'Guardar datos de entrega' : 'Confirmar entrega'}
      </SubmitButton>
    </ValidatedForm>
  )
}
