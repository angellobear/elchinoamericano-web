'use client'

import { ImageUploadField } from '@/app/admin/_components/ImageUploadField'
import { SubmitButton } from '@/app/admin/_components/SubmitButton'
import { MAX_DELIVERY_PHOTOS, MAX_PHOTO_BYTES, type DeliveryPhoto } from '@/lib/orders'
import { parseDeliveryFormData } from '@/modules/admin/orders/form-schema'
import { FieldLabel, TextInput } from '@/modules/admin/shared/components/AdminFormControls'
import { ValidatedForm } from '@/modules/admin/shared/components/ValidatedForm'
import { getZodErrorMessage } from '@/modules/admin/shared/server/zod'
import type { ActionFormHandler } from '@/modules/admin/shared/types/action-result'

interface DeliveryFormProps {
  action: ActionFormHandler
  delivered: boolean
  defaults: {
    receivedByName?: string
    receivedByIdNumber?: string
    invoiceNumber?: string
    photos: DeliveryPhoto[]
  }
}

export function DeliveryForm({ action, delivered, defaults }: DeliveryFormProps) {
  return (
    <ValidatedForm
      action={action}
      className="space-y-4"
      validate={(formData) => {
        for (let slot = 0; slot < MAX_DELIVERY_PHOTOS; slot++) {
          const file = formData.get(`photo${slot}`)
          // El límite del server action es 10 MB en total; 4 MB por foto lo mantiene holgado.
          if (file instanceof File && file.size > MAX_PHOTO_BYTES) return 'Cada foto puede pesar máximo 4 MB.'
        }

        const parsed = parseDeliveryFormData(formData)
        return parsed.success ? null : getZodErrorMessage(parsed.error)
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <FieldLabel>Quién recibe</FieldLabel>
          <TextInput name="receivedByName" maxLength={150} defaultValue={defaults.receivedByName ?? ''} />
        </div>
        <div>
          <FieldLabel>Cédula de quien recibe</FieldLabel>
          <TextInput name="receivedByIdNumber" maxLength={20} defaultValue={defaults.receivedByIdNumber ?? ''} />
        </div>
        <div>
          <FieldLabel>N.º de factura</FieldLabel>
          <TextInput
            name="invoiceNumber"
            maxLength={50}
            defaultValue={defaults.invoiceNumber ?? ''}
            placeholder="001-001-000000000"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: MAX_DELIVERY_PHOTOS }, (_, slot) => (
          <ImageUploadField
            // La key cambia con la foto guardada para que el campo se reinicie tras guardar.
            key={`${slot}-${defaults.photos[slot]?.publicId ?? 'vacio'}`}
            name={`photo${slot}`}
            label={`Foto de entrega ${slot + 1} (opcional)`}
            currentUrl={defaults.photos[slot]?.url}
            currentPublicId={defaults.photos[slot]?.publicId}
          />
        ))}
      </div>

      {!delivered ? (
        <p className="text-xs text-slate-500">
          Al entregar se descuenta del inventario cada ítem que viene del catálogo. Si falta stock, no se entrega nada.
        </p>
      ) : null}

      <SubmitButton
        pendingText={delivered ? 'Guardando…' : 'Entregando…'}
        className="px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-dark active:scale-[0.98] transition-all disabled:opacity-60"
      >
        {delivered ? 'Guardar datos de entrega' : 'Marcar como entregado'}
      </SubmitButton>
    </ValidatedForm>
  )
}
