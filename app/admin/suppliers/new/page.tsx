import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupplier } from '@/lib/db/suppliers'
import { logger } from '@/lib/logger'
import Link from 'next/link'
import { SubmitButton } from '@/app/admin/_components/SubmitButton'
import { routes } from '@/lib/routes'
import { AdminPageHeader } from '@/modules/admin/shared/components/AdminPageHeader'
import { FormActions, FormCard } from '@/modules/admin/shared/components/AdminFormControls'
import { parseSupplierFormData } from '@/modules/admin/suppliers/form-schema'
import { getZodErrorMessage } from '@/modules/admin/shared/server/zod'
import { SupplierFormFields } from '@/modules/admin/suppliers/components/SupplierFormFields'

async function create(formData: FormData) {
  'use server'
  try {
    const parsed = parseSupplierFormData(formData, { isActive: true })
    if (!parsed.success) {
      redirect(`${routes.admin.suppliers.create}?error=${encodeURIComponent(getZodErrorMessage(parsed.error))}`)
    }

    const { name, contactName, email, phone, address } = parsed.data

    await createSupplier({ name, contactName, email, phone, address })
    logger.info({ name }, 'Supplier created')
    revalidatePath(routes.admin.suppliers.index)
  } catch (err) {
    logger.error({ err }, 'Error creating supplier')
    redirect(`${routes.admin.suppliers.index}?error=` + encodeURIComponent('Error al crear proveedor'))
  }
  redirect(`${routes.admin.suppliers.index}?success=` + encodeURIComponent('Proveedor creado'))
}

export default function NewSupplierPage() {
  return (
    <div className="p-8">
      <AdminPageHeader
        backHref={routes.admin.suppliers.index}
        backLabel="Volver a proveedores"
        title="Nuevo proveedor"
        description="Registra un proveedor de repuestos"
      />

      <FormCard>
        <form action={create} className="space-y-4">
          <SupplierFormFields />
          <FormActions>
            <SubmitButton className="px-5 py-2 bg-navy text-white text-sm rounded-lg hover:bg-navy-dark transition-colors font-medium disabled:opacity-60">
              Crear proveedor
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
