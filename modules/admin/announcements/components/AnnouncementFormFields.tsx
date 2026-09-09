import { CheckboxField, FieldLabel, TextArea, TextInput } from '@/modules/admin/shared/components/AdminFormControls'
import { ImageUploadField } from '@/app/admin/_components/ImageUploadField'
import type { AnnouncementFormValues } from '@/modules/admin/announcements/form-schema'

interface AnnouncementFormFieldsProps {
  defaults?: Partial<AnnouncementFormValues> & {
    imageUrl?: string | null
    imagePublicId?: string | null
  }
  includeIsActive?: boolean
}

export function AnnouncementFormFields({
  defaults,
  includeIsActive = false,
}: AnnouncementFormFieldsProps) {
  return (
    <>
      <ImageUploadField
        name="image"
        label="Imagen del anuncio *"
        currentUrl={defaults?.imageUrl}
        currentPublicId={defaults?.imagePublicId}
      />

      <div>
        <FieldLabel>Título (opcional)</FieldLabel>
        <TextInput
          name="title"
          maxLength={150}
          defaultValue={defaults?.title ?? ''}
          placeholder="ej: Feriado 10 de agosto"
        />
      </div>

      <div>
        <FieldLabel>Descripción (opcional)</FieldLabel>
        <TextArea
          name="description"
          rows={3}
          maxLength={500}
          defaultValue={defaults?.description ?? ''}
          placeholder="ej: No atendemos el lunes 10. Retomamos el martes 11 a las 8h00."
        />
      </div>

      <div>
        <FieldLabel>Enlace (opcional)</FieldLabel>
        <TextInput
          name="linkUrl"
          maxLength={500}
          defaultValue={defaults?.linkUrl ?? ''}
          placeholder="/catalogo o https://..."
        />
        <p className="text-xs text-slate-400 mt-1">
          Si lo llenas, la imagen del modal es clickeable y aparece un botón &quot;Ver más&quot;.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel required>Se muestra desde</FieldLabel>
          <TextInput type="date" name="startsAt" required defaultValue={defaults?.startsAt ?? ''} />
        </div>
        <div>
          <FieldLabel required>Hasta</FieldLabel>
          <TextInput type="date" name="endsAt" required defaultValue={defaults?.endsAt ?? ''} />
        </div>
      </div>
      <p className="text-xs text-slate-400 -mt-2">
        Ambas fechas son inclusivas y se evalúan con la hora de Ecuador.
      </p>

      {includeIsActive ? (
        <CheckboxField
          name="isActive"
          defaultChecked={defaults?.isActive ?? true}
          label="Anuncio activo"
        />
      ) : null}
    </>
  )
}
