import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createPartBrand } from '@/lib/db/part-brands'
import { handleImageReplace } from '@/lib/cloudinary'
import { logger } from '@/lib/logger'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SubmitButton } from '@/app/admin/_components/SubmitButton'
import { ImageUploadField } from '@/app/admin/_components/ImageUploadField'

async function create(formData: FormData) {
  'use server'
  try {
    const name          = String(formData.get('name')).trim()
    const originCountry = (formData.get('originCountry') as string)?.trim() || undefined
    const file          = formData.get('logo') as File | null
    const removed       = formData.get('logo_removed') === '1'

    const { url: logoUrl, publicId: logoPublicId } = await handleImageReplace(
      file && file.size > 0 ? file : null, removed, null, null
    )

    await createPartBrand({ name, originCountry, logoUrl: logoUrl ?? undefined, logoPublicId: logoPublicId ?? undefined })
    logger.info({ name }, 'Part brand created')
    revalidatePath('/admin/part-brands')
  } catch (err) {
    logger.error({ err }, 'Error creating part brand')
    redirect('/admin/part-brands?error=' + encodeURIComponent('Error al crear marca'))
  }
  redirect('/admin/part-brands?success=' + encodeURIComponent('Marca creada'))
}

export default function NewPartBrandPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/admin/part-brands" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0d1f3c] transition-colors mb-3">
          <ArrowLeft size={14} />
          Volver a marcas de repuestos
        </Link>
        <h1 className="text-2xl font-bold text-[#0d1f3c]">Nueva marca de repuesto</h1>
        <p className="text-gray-500 text-sm mt-0.5">Registra un fabricante de repuestos</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form action={create} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre <span className="text-[#e03030]">*</span>
            </label>
            <input
              name="name"
              required
              placeholder="ej: Bosch, NGK, Monroe"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">País de origen</label>
            <input
              name="originCountry"
              placeholder="ej: Alemania, Japón, China"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:border-transparent"
            />
          </div>

          <ImageUploadField name="logo" label="Logo de la marca" />

          <div className="flex gap-3 pt-2">
            <SubmitButton className="px-5 py-2 bg-[#0d1f3c] text-white text-sm rounded-lg hover:bg-[#0a1628] transition-colors font-medium disabled:opacity-60">
              Crear marca
            </SubmitButton>
            <Link
              href="/admin/part-brands"
              className="px-5 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
