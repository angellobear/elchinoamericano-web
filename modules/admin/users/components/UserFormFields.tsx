import type { Role } from '@/types'
import { CheckboxField, FieldLabel, TextInput } from '@/modules/admin/shared/components/AdminFormControls'
import { SelectField } from '@/components/ui/search-select'

interface UserFormFieldsProps {
  mode: 'create' | 'edit'
  roles: Role[]
  defaults?: {
    fullName?: string
    email?: string
    roleId?: number | null
    isActive?: boolean
  }
  isSelf?: boolean
}

export function UserFormFields({ mode, roles, defaults, isSelf = false }: UserFormFieldsProps) {
  return (
    <>
      <div>
        <FieldLabel>Nombre completo</FieldLabel>
        <TextInput
          name="fullName"
          defaultValue={defaults?.fullName ?? ''}
          placeholder="ej: Carlos Rueda"
        />
      </div>

      <div>
        <FieldLabel required={mode === 'create'}>Email</FieldLabel>
        <TextInput
          name="email"
          type="email"
          required={mode === 'create'}
          defaultValue={mode === 'create' ? defaults?.email ?? '' : undefined}
          value={mode === 'edit' ? defaults?.email ?? '' : undefined}
          disabled={mode === 'edit'}
          placeholder="usuario@empresa.com"
          className={mode === 'edit'
            ? 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400'
            : undefined}
        />
      </div>

      <div>
        <FieldLabel required={mode === 'create'}>
          {mode === 'create' ? 'Contraseña' : 'Nueva contraseña'}
        </FieldLabel>
        <TextInput
          name="password"
          type="password"
          required={mode === 'create'}
          minLength={8}
          placeholder={mode === 'create' ? 'Mínimo 8 caracteres' : 'Dejar vacío para no cambiar'}
        />
      </div>

      {!isSelf ? (
        <div>
          <FieldLabel required={mode === 'create'}>Rol</FieldLabel>
          <SelectField
            name="roleId"
            required={mode === 'create'}
            defaultValue={defaults?.roleId ? String(defaults.roleId) : ''}
            options={roles.map((role) => ({ value: String(role.id), label: role.name }))}
            placeholder="Seleccionar rol..."
            searchPlaceholder="Buscar rol..."
          />
        </div>
      ) : null}

      {!isSelf && mode === 'edit' ? (
        <CheckboxField
          name="isActive"
          defaultChecked={defaults?.isActive ?? true}
          label="Usuario activo"
        />
      ) : null}

      {isSelf && mode === 'edit' ? (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          No puedes cambiar tu propio rol o estado.
        </p>
      ) : null}
    </>
  )
}
