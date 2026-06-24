import { FieldLabel, TextInput, CheckboxField } from '@/modules/admin/shared/components/AdminFormControls'
import { ImageUploadField } from '@/app/admin/_components/ImageUploadField'
import type { PartBrandFormValues } from '@/modules/admin/part-brands/form-schema'

interface PartBrandFormFieldsProps {
  defaults?: Partial<PartBrandFormValues> & {
    logoUrl?: string | null
    logoPublicId?: string | null
  }
  includeIsActive?: boolean
}

export function PartBrandFormFields({
  defaults,
  includeIsActive = false,
}: PartBrandFormFieldsProps) {
  return (
    <>
      <div>
        <FieldLabel required>Nombre</FieldLabel>
        <TextInput
          name="name"
          required
          defaultValue={defaults?.name ?? ''}
          placeholder="ej: Bosch, NGK, Monroe"
        />
      </div>

      <div>
        <FieldLabel>País de origen</FieldLabel>
        <TextInput
          name="originCountry"
          defaultValue={defaults?.originCountry ?? ''}
          placeholder="ej: Alemania, Japón, China"
        />
      </div>

      <ImageUploadField
        name="logo"
        label="Logo de la marca"
        currentUrl={defaults?.logoUrl}
        currentPublicId={defaults?.logoPublicId}
      />

      {includeIsActive ? (
        <CheckboxField
          name="isActive"
          defaultChecked={defaults?.isActive ?? true}
          label="Marca activa"
        />
      ) : null}
    </>
  )
}
