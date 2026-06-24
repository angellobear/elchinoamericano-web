import { CheckboxField, FieldLabel, TextArea, TextInput } from '@/modules/admin/shared/components/AdminFormControls'
import type { SupplierFormValues } from '@/modules/admin/suppliers/form-schema'

interface SupplierFormFieldsProps {
  defaults?: Partial<SupplierFormValues>
  includeIsActive?: boolean
}

export function SupplierFormFields({
  defaults,
  includeIsActive = false,
}: SupplierFormFieldsProps) {
  return (
    <>
      <div>
        <FieldLabel required>Nombre</FieldLabel>
        <TextInput
          name="name"
          required
          defaultValue={defaults?.name ?? ''}
          placeholder="ej: Importadora Rueda S.A."
        />
      </div>

      <div>
        <FieldLabel>Nombre de contacto</FieldLabel>
        <TextInput
          name="contactName"
          defaultValue={defaults?.contactName ?? ''}
          placeholder="ej: Carlos Rueda"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>Email</FieldLabel>
          <TextInput
            name="email"
            type="email"
            defaultValue={defaults?.email ?? ''}
            placeholder="contacto@empresa.com"
          />
        </div>
        <div>
          <FieldLabel>Teléfono</FieldLabel>
          <TextInput
            name="phone"
            defaultValue={defaults?.phone ?? ''}
            placeholder="+593 99 999 9999"
          />
        </div>
      </div>

      <div>
        <FieldLabel>Dirección</FieldLabel>
        <TextArea
          name="address"
          rows={2}
          defaultValue={defaults?.address ?? ''}
          placeholder="Dirección del proveedor..."
        />
      </div>

      {includeIsActive ? (
        <CheckboxField
          name="isActive"
          defaultChecked={defaults?.isActive ?? true}
          label="Proveedor activo"
        />
      ) : null}
    </>
  )
}
