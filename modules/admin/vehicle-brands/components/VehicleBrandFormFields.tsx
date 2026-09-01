import { CheckboxField, FieldLabel, TextInput } from '@/modules/admin/shared/components/AdminFormControls'
import { SelectField } from '@/components/ui/search-select'
import { ImageUploadField } from '@/app/admin/_components/ImageUploadField'
import type { VehicleBrandFormValues } from '@/modules/admin/vehicle-brands/form-schema'

interface VehicleBrandFormFieldsProps {
  defaults?: Partial<VehicleBrandFormValues> & {
    logoUrl?: string | null
    logoPublicId?: string | null
  }
  includeIsActive?: boolean
}

export function VehicleBrandFormFields({
  defaults,
  includeIsActive = false,
}: VehicleBrandFormFieldsProps) {
  return (
    <>
      <div>
        <FieldLabel required>Nombre</FieldLabel>
        <TextInput
          name="name"
          required
          defaultValue={defaults?.name ?? ''}
          placeholder="ej: Chery, Ford, BYD"
        />
      </div>

      <div>
        <FieldLabel required>Origen</FieldLabel>
        <SelectField
          name="origin"
          required
          defaultValue={defaults?.origin ?? ''}
          options={[
            { value: 'chinese', label: 'China' },
            { value: 'american', label: 'EE.UU.' },
            { value: 'foreign', label: 'Otro (extranjero)' },
          ]}
          placeholder="Seleccionar origen..."
        />
      </div>

      <div>
        <FieldLabel>Orden de visualización</FieldLabel>
        <TextInput
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={defaults?.sortOrder ?? 0}
          className="w-32 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/25 focus:border-navy transition-colors"
        />
      </div>

      <ImageUploadField
        name="logo"
        label="Logo de la marca"
        currentUrl={defaults?.logoUrl}
        currentPublicId={defaults?.logoPublicId}
      />

      <CheckboxField
        name="isVisibleOnWeb"
        defaultChecked={defaults?.isVisibleOnWeb ?? false}
        label="Visible en la web para clientes"
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
