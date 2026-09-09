import { revalidatePath } from 'next/cache'
import { createAnnouncement } from '@/lib/db/announcements'
import { handleImageReplace } from '@/lib/cloudinary'
import { logger } from '@/lib/logger'
import { routes } from '@/lib/routes'
import { AdminPageHeader } from '@/modules/admin/shared/components/AdminPageHeader'
import { FormCard } from '@/modules/admin/shared/components/AdminFormControls'
import { parseAnnouncementFormData } from '@/modules/admin/announcements/form-schema'
import { getZodErrorMessage } from '@/modules/admin/shared/server/zod'
import { errorResult, successResult, type ActionState } from '@/modules/admin/shared/types/action-result'
import { AnnouncementForm } from '@/modules/admin/announcements/components/AnnouncementForm'

async function create(_: ActionState, formData: FormData) {
  'use server'
  try {
    const parsed = parseAnnouncementFormData(formData, { isActive: true })
    if (!parsed.success) {
      return errorResult(getZodErrorMessage(parsed.error))
    }

    const file = formData.get('image') as File | null
    if (!file || file.size === 0) {
      return errorResult('La imagen del anuncio es obligatoria.')
    }

    const { title, description, linkUrl, startsAt, endsAt } = parsed.data
    const { url: imageUrl, publicId: imagePublicId } = await handleImageReplace(
      file, false, null, null, 'announcements',
    )

    if (!imageUrl) {
      return errorResult('No se pudo subir la imagen del anuncio.')
    }

    await createAnnouncement({ title, description, linkUrl, startsAt, endsAt, imageUrl, imagePublicId })
    logger.info({ title, startsAt, endsAt }, 'Announcement created')
    revalidatePath(routes.admin.announcements.index)
    revalidatePath('/api/announcement')
  } catch (err) {
    logger.error({ err }, 'Error creating announcement')
    return errorResult('Error al crear anuncio')
  }

  return successResult('Anuncio creado', undefined, { redirectTo: routes.admin.announcements.index })
}

export default function NewAnnouncementPage() {
  return (
    <div className="p-4 md:p-8">
      <AdminPageHeader
        backHref={routes.admin.announcements.index}
        backLabel="Volver a anuncios"
        title="Nuevo anuncio"
        description="Se muestra como modal en las páginas públicas dentro del rango de fechas"
      />

      <FormCard>
        <AnnouncementForm action={create} mode="create" />
      </FormCard>
    </div>
  )
}
