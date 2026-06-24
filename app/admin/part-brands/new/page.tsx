import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createPartBrand } from '@/lib/db/part-brands'
import { handleImageReplace } from '@/lib/cloudinary'
import { logger } from '@/lib/logger'
import Link from 'next/link'
import { SubmitButton } from '@/app/admin/_components/SubmitButton'
import { routes } from '@/lib/routes'
import { AdminPageHeader } from '@/modules/admin/shared/components/AdminPageHeader'
import { FormActions, FormCard } from '@/modules/admin/shared/components/AdminFormControls'
import { parsePartBrandFormData } from '@/modules/admin/part-brands/form-schema'
import { getZodErrorMessage } from '@/modules/admin/shared/server/zod'
import { PartBrandFormFields } from '@/modules/admin/part-brands/components/PartBrandFormFields'

async function create(formData: FormData) {
  'use server'
  try {
    const parsed = parsePartBrandFormData(formData, { isActive: true })
    if (!parsed.success) {
      redirect(
        `${routes.admin.partBrands.create}?error=${encodeURIComponent(getZodErrorMessage(parsed.error))}`
      )
    }

    const { name, originCountry } = parsed.data
    const file          = formData.get('logo') as File | null
    const removed       = formData.get('logo_removed') === '1'

    const { url: logoUrl, publicId: logoPublicId } = await handleImageReplace(
      file && file.size > 0 ? file : null, removed, null, null
    )

    await createPartBrand({ name, originCountry, logoUrl: logoUrl ?? undefined, logoPublicId: logoPublicId ?? undefined })
    logger.info({ name }, 'Part brand created')
    revalidatePath(routes.admin.partBrands.index)
  } catch (err) {
    logger.error({ err }, 'Error creating part brand')
    redirect(`${routes.admin.partBrands.index}?error=` + encodeURIComponent('Error al crear marca'))
  }
  redirect(`${routes.admin.partBrands.index}?success=` + encodeURIComponent('Marca creada'))
}

export default function NewPartBrandPage() {
  return (
    <div className="p-8">
      <AdminPageHeader
        backHref={routes.admin.partBrands.index}
        backLabel="Volver a marcas de repuestos"
        title="Nueva marca de repuesto"
        description="Registra un fabricante de repuestos"
      />

      <FormCard>
        <form action={create} className="space-y-4">
          <PartBrandFormFields />
          <FormActions>
            <SubmitButton className="px-5 py-2 bg-navy text-white text-sm rounded-lg hover:bg-navy-dark transition-colors font-medium disabled:opacity-60">
              Crear marca
            </SubmitButton>
            <Link
              href={routes.admin.partBrands.index}
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
