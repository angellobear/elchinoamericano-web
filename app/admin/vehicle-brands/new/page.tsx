import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createVehicleBrand } from '@/lib/db/vehicle-brands'
import { handleImageReplace } from '@/lib/cloudinary'
import { logger } from '@/lib/logger'
import Link from 'next/link'
import { SubmitButton } from '@/app/admin/_components/SubmitButton'
import { routes } from '@/lib/routes'
import { AdminPageHeader } from '@/modules/admin/shared/components/AdminPageHeader'
import { FormActions, FormCard } from '@/modules/admin/shared/components/AdminFormControls'
import { getZodErrorMessage } from '@/modules/admin/shared/server/zod'
import { parseVehicleBrandFormData } from '@/modules/admin/vehicle-brands/form-schema'
import { VehicleBrandFormFields } from '@/modules/admin/vehicle-brands/components/VehicleBrandFormFields'

async function create(formData: FormData) {
  'use server'
  try {
    const parsed = parseVehicleBrandFormData(formData, { isActive: true, isVisibleOnWeb: false })
    if (!parsed.success) {
      redirect(`${routes.admin.vehicleBrands.create}?error=${encodeURIComponent(getZodErrorMessage(parsed.error))}`)
    }

    const { name, origin, sortOrder, isVisibleOnWeb } = parsed.data
    const file      = formData.get('logo') as File | null
    const removed   = formData.get('logo_removed') === '1'

    const { url: logoUrl, publicId: logoPublicId } = await handleImageReplace(
      file && file.size > 0 ? file : null, removed, null, null
    )

    await createVehicleBrand({
      name,
      origin,
      sortOrder,
      isVisibleOnWeb,
      logoUrl: logoUrl ?? undefined,
      logoPublicId: logoPublicId ?? undefined,
    })
    logger.info({ name, origin }, 'Vehicle brand created')
    revalidatePath(routes.admin.vehicleBrands.index)
    revalidatePath('/')
    revalidatePath('/catalogo')
  } catch (err) {
    logger.error({ err }, 'Error creating vehicle brand')
    redirect(`${routes.admin.vehicleBrands.index}?error=` + encodeURIComponent('Error al crear marca'))
  }
  redirect(`${routes.admin.vehicleBrands.index}?success=` + encodeURIComponent('Marca creada'))
}

export default function NewVehicleBrandPage() {
  return (
    <div className="p-8">
      <AdminPageHeader
        backHref={routes.admin.vehicleBrands.index}
        backLabel="Volver a marcas de vehículos"
        title="Nueva marca de vehículo"
        description="Registra una nueva marca de automóvil"
      />

      <FormCard>
        <form action={create} className="space-y-4">
          <VehicleBrandFormFields />
          <FormActions>
            <SubmitButton className="px-5 py-2 bg-navy text-white text-sm rounded-lg hover:bg-navy-dark transition-colors font-medium disabled:opacity-60">
              Crear marca
            </SubmitButton>
            <Link
              href={routes.admin.vehicleBrands.index}
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
