import { revalidatePath } from 'next/cache'
import { createSupplier } from '@/lib/db/suppliers'
import { logger } from '@/lib/logger'
import { routes } from '@/lib/routes'
import { AdminPageHeader } from '@/modules/admin/shared/components/AdminPageHeader'
import { FormCard } from '@/modules/admin/shared/components/AdminFormControls'
import { parseSupplierFormData } from '@/modules/admin/suppliers/form-schema'
import { getZodErrorMessage } from '@/modules/admin/shared/server/zod'
import { errorResult, successResult, type ActionState } from '@/modules/admin/shared/types/action-result'
import { SupplierForm } from '@/modules/admin/suppliers/components/SupplierForm'

async function create(_: ActionState, formData: FormData) {
  'use server'
  try {
    const parsed = parseSupplierFormData(formData, { isActive: true })
    if (!parsed.success) {
      return errorResult(getZodErrorMessage(parsed.error))
    }

    const { name, contactName, email, phone, address } = parsed.data

    await createSupplier({ name, contactName, email, phone, address })
    logger.info({ name }, 'Supplier created')
    revalidatePath(routes.admin.suppliers.index)
  } catch (err) {
    logger.error({ err }, 'Error creating supplier')
    return errorResult('Error al crear proveedor')
  }

  return successResult('Proveedor creado', undefined, { redirectTo: routes.admin.suppliers.index })
}

export default function NewSupplierPage() {
  return (
    <div className="p-4 md:p-8">
      <AdminPageHeader
        backHref={routes.admin.suppliers.index}
        backLabel="Volver a proveedores"
        title="Nuevo proveedor"
        description="Registra un proveedor de repuestos"
      />

      <FormCard>
        <SupplierForm action={create} mode="create" />
      </FormCard>
    </div>
  )
}
