import { revalidatePath } from 'next/cache'
import { createVehicleBrand } from '@/lib/db/vehicle-brands'
import { handleImageReplace } from '@/lib/cloudinary'
import { logger } from '@/lib/logger'
import { routes } from '@/lib/routes'
import { AdminPageHeader } from '@/modules/admin/shared/components/AdminPageHeader'
import { FormCard } from '@/modules/admin/shared/components/AdminFormControls'
import { getZodErrorMessage } from '@/modules/admin/shared/server/zod'
import { errorResult, successResult, type ActionState } from '@/modules/admin/shared/types/action-result'
import { parseVehicleBrandFormData } from '@/modules/admin/vehicle-brands/form-schema'
import { VehicleBrandForm } from '@/modules/admin/vehicle-brands/components/VehicleBrandForm'

async function create(_: ActionState, formData: FormData) {
  'use server'
  try {
    const parsed = parseVehicleBrandFormData(formData, { isActive: true, isVisibleOnWeb: false })
    if (!parsed.success) {
      return errorResult(getZodErrorMessage(parsed.error))
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
    return errorResult('Error al crear marca')
  }

  return successResult('Marca creada', undefined, { redirectTo: routes.admin.vehicleBrands.index })
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
        <VehicleBrandForm action={create} mode="create" />
      </FormCard>
    </div>
  )
}
