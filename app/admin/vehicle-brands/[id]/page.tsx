import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getVehicleBrandById, getVehicleModels, updateVehicleBrand } from '@/lib/db/vehicle-brands'
import { handleImageReplace } from '@/lib/cloudinary'
import { logger } from '@/lib/logger'
import { normalizeBoolean } from '@/lib/normalize-boolean'
import { routes } from '@/lib/routes'
import { AdminPageHeader } from '@/modules/admin/shared/components/AdminPageHeader'
import { FormCard } from '@/modules/admin/shared/components/AdminFormControls'
import { getZodErrorMessage } from '@/modules/admin/shared/server/zod'
import { errorResult, successResult, type ActionState } from '@/modules/admin/shared/types/action-result'
import { VehicleBrandForm } from '@/modules/admin/vehicle-brands/components/VehicleBrandForm'
import { parseVehicleBrandFormData } from '@/modules/admin/vehicle-brands/form-schema'
import { VehicleModelsEditor } from '@/modules/admin/vehicle-brands/components/VehicleModelsEditor'

async function save(id: number, _: ActionState, formData: FormData) {
  'use server'
  try {
    const parsed = parseVehicleBrandFormData(formData, { isActive: true, isVisibleOnWeb: false })
    if (!parsed.success) {
      return errorResult(getZodErrorMessage(parsed.error))
    }

    const { name, origin, sortOrder, isActive, isVisibleOnWeb } = parsed.data
    const file           = formData.get('logo') as File | null
    const currentUrl     = formData.get('logo_current_url') as string
    const currentPublicId = formData.get('logo_public_id') as string
    const removed        = formData.get('logo_removed') === '1'

    const { url: logoUrl, publicId: logoPublicId } = await handleImageReplace(
      file && file.size > 0 ? file : null,
      removed,
      currentPublicId || null,
      currentUrl || null,
      'vehicle-brands',
    )
    await updateVehicleBrand(id, {
      name,
      origin,
      sortOrder,
      isActive,
      isVisibleOnWeb,
      logoUrl: logoUrl ?? undefined,
      logoPublicId: logoPublicId ?? undefined,
    })
    logger.info({ id, name }, 'Vehicle brand updated')
    revalidatePath(routes.admin.vehicleBrands.index)
    revalidatePath('/')
    revalidatePath('/catalogo')
  } catch (err) {
    logger.error({ err }, 'Error updating vehicle brand')
    return errorResult('Error al guardar marca')
  }

  return successResult('Marca guardada', undefined, { redirectTo: routes.admin.vehicleBrands.index })
}

export default async function VehicleBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const brandId = Number(id)
  const [brand, models] = await Promise.all([
    getVehicleBrandById(brandId),
    getVehicleModels(brandId, true),
  ])
  if (!brand) notFound()
  const isActive = normalizeBoolean(
    (brand as { isActive?: unknown; is_active?: unknown }).isActive
    ?? (brand as { isActive?: unknown; is_active?: unknown }).is_active,
    true,
  )
  const isVisibleOnWeb = normalizeBoolean(
    (brand as { isVisibleOnWeb?: unknown; is_visible_on_web?: unknown }).isVisibleOnWeb
    ?? (brand as { isVisibleOnWeb?: unknown; is_visible_on_web?: unknown }).is_visible_on_web,
    false,
  )

  const saveWithId = save.bind(null, brand.id)
  const brandWithModels = {
    ...brand,
    isActive,
    isVisibleOnWeb,
    models,
  }

  return (
    <div className="p-8">
      <AdminPageHeader
        backHref={routes.admin.vehicleBrands.index}
        backLabel="Volver a marcas de vehículos"
        title={brand.name}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: brand edit form */}
        <div className="xl:col-span-1">
          <FormCard>
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Datos de la marca</h2>
            <VehicleBrandForm
              action={saveWithId}
              mode="edit"
              compact
              defaults={{
                name: brand.name,
                origin: brand.origin as 'chinese' | 'american' | 'foreign',
                sortOrder: brand.sortOrder ?? 0,
                isActive,
                isVisibleOnWeb,
                logoUrl: brand.logoUrl,
                logoPublicId: (brand as { logoPublicId?: string | null }).logoPublicId,
              }}
            />
          </FormCard>
        </div>

        {/* Right: models editor */}
        <div className="xl:col-span-2">
          <VehicleModelsEditor brand={brandWithModels as Parameters<typeof VehicleModelsEditor>[0]['brand']} />
        </div>
      </div>
    </div>
  )
}
