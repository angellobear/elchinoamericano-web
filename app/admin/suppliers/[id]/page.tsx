import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getSuppliers, updateSupplier } from '@/lib/db/suppliers'
import { logger } from '@/lib/logger'
import { routes } from '@/lib/routes'
import { AdminPageHeader } from '@/modules/admin/shared/components/AdminPageHeader'
import { FormCard } from '@/modules/admin/shared/components/AdminFormControls'
import { parseSupplierFormData } from '@/modules/admin/suppliers/form-schema'
import { getZodErrorMessage } from '@/modules/admin/shared/server/zod'
import { errorResult, successResult, type ActionState } from '@/modules/admin/shared/types/action-result'
import { SupplierForm } from '@/modules/admin/suppliers/components/SupplierForm'

async function save(id: number, _: ActionState, formData: FormData) {
  'use server'
  try {
    const parsed = parseSupplierFormData(formData, { isActive: true })
    if (!parsed.success) {
      return errorResult(getZodErrorMessage(parsed.error))
    }

    const { name, contactName, email, phone, address, isActive } = parsed.data

    await updateSupplier(id, { name, contactName, email, phone, address, isActive })
    logger.info({ id, name }, 'Supplier updated')
    revalidatePath(routes.admin.suppliers.index)
  } catch (err) {
    logger.error({ err }, 'Error updating supplier')
    return errorResult('Error al guardar proveedor')
  }

  return successResult('Proveedor guardado', undefined, { redirectTo: routes.admin.suppliers.index })
}

export default async function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const all = await getSuppliers(true)
  const supplier = all.find(s => s.id === Number(id))
  if (!supplier) notFound()

  const saveWithId = save.bind(null, supplier.id)

  return (
    <div className="p-8">
      <AdminPageHeader
        backHref={routes.admin.suppliers.index}
        backLabel="Volver a proveedores"
        title="Editar proveedor"
        description={supplier.name}
      />

      <FormCard>
        <SupplierForm
          action={saveWithId}
          mode="edit"
          defaults={{
            name: supplier.name,
            contactName: supplier.contactName ?? undefined,
            email: supplier.email ?? undefined,
            phone: supplier.phone ?? undefined,
            address: supplier.address ?? undefined,
            isActive: supplier.isActive ?? true,
          }}
        />
      </FormCard>
    </div>
  )
}
