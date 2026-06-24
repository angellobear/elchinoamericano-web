import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getVehicleBrandWithModels, updateVehicleBrand } from '@/lib/db/vehicle-brands'
import { handleImageReplace } from '@/lib/cloudinary'
import { logger } from '@/lib/logger'
import { SubmitButton } from '@/app/admin/_components/SubmitButton'
import { routes } from '@/lib/routes'
import { AdminPageHeader } from '@/modules/admin/shared/components/AdminPageHeader'
import { FormActions, FormCard } from '@/modules/admin/shared/components/AdminFormControls'
import { getZodErrorMessage } from '@/modules/admin/shared/server/zod'
import { parseVehicleBrandFormData } from '@/modules/admin/vehicle-brands/form-schema'
import { VehicleBrandFormFields } from '@/modules/admin/vehicle-brands/components/VehicleBrandFormFields'
import { VehicleModelsEditor } from '@/modules/admin/vehicle-brands/components/VehicleModelsEditor'

async function save(id: number, formData: FormData) {
  'use server'
  try {
    const parsed = parseVehicleBrandFormData(formData, { isActive: true })
    if (!parsed.success) {
      redirect(`${routes.admin.vehicleBrands.edit(id)}?error=${encodeURIComponent(getZodErrorMessage(parsed.error))}`)
    }

    const { name, origin, sortOrder, isActive } = parsed.data
    const file           = formData.get('logo') as File | null
    const currentUrl     = formData.get('logo_current_url') as string
    const currentPublicId = formData.get('logo_public_id') as string
    const removed        = formData.get('logo_removed') === '1'

    const { url: logoUrl, publicId: logoPublicId } = await handleImageReplace(
      file && file.size > 0 ? file : null,
      removed,
      currentPublicId || null,
      currentUrl || null,
    )

    await updateVehicleBrand(id, { name, origin, sortOrder, isActive, logoUrl: logoUrl ?? undefined, logoPublicId: logoPublicId ?? undefined })
    logger.info({ id, name }, 'Vehicle brand updated')
    revalidatePath(routes.admin.vehicleBrands.index)
  } catch (err) {
    logger.error({ err }, 'Error updating vehicle brand')
    redirect(`${routes.admin.vehicleBrands.index}?error=` + encodeURIComponent('Error al guardar marca'))
  }
  redirect(`${routes.admin.vehicleBrands.index}?success=` + encodeURIComponent('Marca guardada'))
}

export default async function VehicleBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const brand = await getVehicleBrandWithModels(Number(id))
  if (!brand) notFound()

  const saveWithId = save.bind(null, brand.id)

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
            <form action={saveWithId} className="space-y-4">
              <VehicleBrandFormFields
                defaults={{
                  name: brand.name,
                  origin: brand.origin as 'chinese' | 'american' | 'foreign',
                  sortOrder: brand.sortOrder ?? 0,
                  isActive: brand.isActive ?? true,
                  logoUrl: brand.logoUrl,
                  logoPublicId: (brand as { logoPublicId?: string | null }).logoPublicId,
                }}
                includeIsActive
              />
              <FormActions>
                <SubmitButton className="w-full px-5 py-2 bg-navy text-white text-sm rounded-lg hover:bg-navy-dark transition-colors font-medium disabled:opacity-60">
                  Guardar cambios
                </SubmitButton>
              </FormActions>
            </form>
          </FormCard>
        </div>

        {/* Right: models editor */}
        <div className="xl:col-span-2">
          <VehicleModelsEditor brand={brand as Parameters<typeof VehicleModelsEditor>[0]['brand']} />
        </div>
      </div>
    </div>
  )
}
