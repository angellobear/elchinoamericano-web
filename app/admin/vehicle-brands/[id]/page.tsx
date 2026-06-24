import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getVehicleBrandWithModels, updateVehicleBrand } from '@/lib/db/vehicle-brands'
import { handleImageReplace } from '@/lib/cloudinary'
import { logger } from '@/lib/logger'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SubmitButton } from '@/app/admin/_components/SubmitButton'
import { ImageUploadField } from '@/app/admin/_components/ImageUploadField'
import VehicleBrandEditor from './VehicleBrandEditor'

async function save(id: number, formData: FormData) {
  'use server'
  try {
    const name           = String(formData.get('name')).trim()
    const origin         = String(formData.get('origin'))
    const sortOrder      = Number(formData.get('sortOrder')) || 0
    const isActive       = formData.get('isActive') === 'on'
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
    revalidatePath('/admin/vehicle-brands')
  } catch (err) {
    logger.error({ err }, 'Error updating vehicle brand')
    redirect('/admin/vehicle-brands?error=' + encodeURIComponent('Error al guardar marca'))
  }
  redirect('/admin/vehicle-brands?success=' + encodeURIComponent('Marca guardada'))
}

export default async function VehicleBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const brand = await getVehicleBrandWithModels(Number(id))
  if (!brand) notFound()

  const saveWithId = save.bind(null, brand.id)

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/admin/vehicle-brands" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0d1f3c] transition-colors mb-3">
          <ArrowLeft size={14} />
          Volver a marcas de vehículos
        </Link>
        <h1 className="text-2xl font-bold text-[#0d1f3c]">{brand.name}</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: brand edit form */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Datos de la marca</h2>
            <form action={saveWithId} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nombre <span className="text-[#e03030]">*</span>
                </label>
                <input
                  name="name"
                  required
                  defaultValue={brand.name}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Origen</label>
                <select
                  name="origin"
                  defaultValue={brand.origin}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:border-transparent bg-white"
                >
                  <option value="chinese">China</option>
                  <option value="american">EE.UU.</option>
                  <option value="foreign">Otro (extranjero)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Orden</label>
                <input
                  name="sortOrder"
                  type="number"
                  min={0}
                  defaultValue={brand.sortOrder ?? 0}
                  className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:border-transparent"
                />
              </div>

              <ImageUploadField
                name="logo"
                label="Logo"
                currentUrl={brand.logoUrl}
                currentPublicId={(brand as { logoPublicId?: string | null }).logoPublicId}
              />

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  defaultChecked={brand.isActive ?? true}
                  className="w-4 h-4 rounded border-gray-300 text-[#0d1f3c] focus:ring-[#0d1f3c]"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Marca activa</label>
              </div>

              <SubmitButton className="w-full px-5 py-2 bg-[#0d1f3c] text-white text-sm rounded-lg hover:bg-[#0a1628] transition-colors font-medium disabled:opacity-60">
                Guardar cambios
              </SubmitButton>
            </form>
          </div>
        </div>

        {/* Right: models editor */}
        <div className="xl:col-span-2">
          <VehicleBrandEditor brand={brand as Parameters<typeof VehicleBrandEditor>[0]['brand']} />
        </div>
      </div>
    </div>
  )
}
