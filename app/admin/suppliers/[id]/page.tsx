import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getSuppliers, updateSupplier } from '@/lib/db/suppliers'
import { logger } from '@/lib/logger'
import Link from 'next/link'
import { SubmitButton } from '@/app/admin/_components/SubmitButton'
import { routes } from '@/lib/routes'
import { AdminPageHeader } from '@/modules/admin/shared/components/AdminPageHeader'
import { FormActions, FormCard } from '@/modules/admin/shared/components/AdminFormControls'
import { parseSupplierFormData } from '@/modules/admin/suppliers/form-schema'
import { getZodErrorMessage } from '@/modules/admin/shared/server/zod'
import { SupplierFormFields } from '@/modules/admin/suppliers/components/SupplierFormFields'

async function save(id: number, formData: FormData) {
  'use server'
  try {
    const parsed = parseSupplierFormData(formData, { isActive: true })
    if (!parsed.success) {
      redirect(`${routes.admin.suppliers.edit(id)}?error=${encodeURIComponent(getZodErrorMessage(parsed.error))}`)
    }

    const { name, contactName, email, phone, address, isActive } = parsed.data

    await updateSupplier(id, { name, contactName, email, phone, address, isActive })
    logger.info({ id, name }, 'Supplier updated')
    revalidatePath(routes.admin.suppliers.index)
  } catch (err) {
    logger.error({ err }, 'Error updating supplier')
    redirect(`${routes.admin.suppliers.index}?error=` + encodeURIComponent('Error al guardar proveedor'))
  }
  redirect(`${routes.admin.suppliers.index}?success=` + encodeURIComponent('Proveedor guardado'))
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
        <form action={saveWithId} className="space-y-4">
          <SupplierFormFields
            defaults={{
              name: supplier.name,
              contactName: supplier.contactName ?? undefined,
              email: supplier.email ?? undefined,
              phone: supplier.phone ?? undefined,
              address: supplier.address ?? undefined,
              isActive: supplier.isActive ?? true,
            }}
            includeIsActive
          />
          <FormActions>
            <SubmitButton className="px-5 py-2 bg-navy text-white text-sm rounded-lg hover:bg-navy-dark transition-colors font-medium disabled:opacity-60">
              Guardar cambios
            </SubmitButton>
            <Link
              href={routes.admin.suppliers.index}
              className="px-5 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
          </FormActions>
        </form>
      </FormCard>
    </div>
  )
}
