import { FieldLabel, TextArea, TextInput, CheckboxField } from '@/modules/admin/shared/components/AdminFormControls'
import { ImageUploadField } from '@/app/admin/_components/ImageUploadField'
import type { CategoryFormValues } from '@/modules/admin/categories/form-schema'

interface CategoryFormFieldsProps {
  defaults?: Partial<CategoryFormValues> & {
    imageUrl?: string | null
    imagePublicId?: string | null
  }
  includeKey?: boolean
  includeIsActive?: boolean
}

export function CategoryFormFields({
  defaults,
  includeKey = true,
  includeIsActive = false,
}: CategoryFormFieldsProps) {
  return (
    <>
      {includeKey ? (
        <div>
          <FieldLabel required>Clave</FieldLabel>
          <TextInput
            name="key"
            required
            defaultValue={defaults?.key ?? ''}
            placeholder="ej: motor, frenos, suspension"
          />
          <p className="text-xs text-gray-400 mt-1">
            Identificador único, sin espacios ni caracteres especiales
          </p>
        </div>
      ) : null}

      <div>
        <FieldLabel required>Nombre</FieldLabel>
        <TextInput
          name="name"
          required
          defaultValue={defaults?.name ?? ''}
          placeholder="ej: Motor, Frenos, Suspensión"
        />
      </div>

      <div>
        <FieldLabel>Descripción</FieldLabel>
        <TextArea
          name="description"
          rows={3}
          defaultValue={defaults?.description ?? ''}
          placeholder="Descripción opcional de la categoría..."
        />
      </div>

      <div>
        <FieldLabel>Orden de visualización</FieldLabel>
        <TextInput
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={defaults?.sortOrder ?? 0}
          className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
        />
      </div>

      <ImageUploadField
        name="image"
        label="Imagen de categoría"
        currentUrl={defaults?.imageUrl}
        currentPublicId={defaults?.imagePublicId}
      />

      {includeIsActive ? (
        <CheckboxField
          name="isActive"
          defaultChecked={defaults?.isActive ?? true}
          label="Categoría activa"
        />
      ) : null}
    </>
  )
}
