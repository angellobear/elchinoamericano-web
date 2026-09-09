import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getAnnouncementById, updateAnnouncement } from '@/lib/db/announcements'
import { handleImageReplace } from '@/lib/cloudinary'
import { logger } from '@/lib/logger'
import { routes } from '@/lib/routes'
import { AnnouncementForm } from '@/modules/admin/announcements/components/AnnouncementForm'
import { AdminPageHeader } from '@/modules/admin/shared/components/AdminPageHeader'
import { FormCard } from '@/modules/admin/shared/components/AdminFormControls'
import { getZodErrorMessage } from '@/modules/admin/shared/server/zod'
import { errorResult, successResult, type ActionState } from '@/modules/admin/shared/types/action-result'
import { parseAnnouncementFormData } from '@/modules/admin/announcements/form-schema'

async function save(id: number, _: ActionState, formData: FormData) {
  'use server'
  try {
    const parsed = parseAnnouncementFormData(formData, { isActive: true })
    if (!parsed.success) {
      return errorResult(getZodErrorMessage(parsed.error))
    }

    const { title, description, linkUrl, startsAt, endsAt, isActive } = parsed.data
    const file = formData.get('image') as File | null
    const currentUrl = formData.get('image_current_url') as string
    const currentPublicId = formData.get('image_public_id') as string
    const removed = formData.get('image_removed') === '1'

    const { url: imageUrl, publicId: imagePublicId } = await handleImageReplace(
      file && file.size > 0 ? file : null,
      removed,
      currentPublicId || null,
      currentUrl || null,
      'announcements',
    )

    if (!imageUrl) {
      return errorResult('La imagen del anuncio es obligatoria.')
    }

    await updateAnnouncement(id, {
      title: title ?? null,
      description: description ?? null,
      linkUrl: linkUrl ?? null,
      startsAt,
      endsAt,
      isActive,
      imageUrl,
      imagePublicId,
    })
    logger.info({ id, title }, 'Announcement updated')
    revalidatePath(routes.admin.announcements.index)
    revalidatePath('/api/announcement')
  } catch (err) {
    logger.error({ err }, 'Error updating announcement')
    return errorResult('Error al guardar anuncio')
  }

  return successResult('Anuncio guardado', undefined, { redirectTo: routes.admin.announcements.index })
}

export default async function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const announcement = await getAnnouncementById(Number(id))
  if (!announcement || announcement.deletedAt) notFound()

  const saveWithId = save.bind(null, announcement.id)

  return (
    <div className="p-4 md:p-8">
      <AdminPageHeader
        backHref={routes.admin.announcements.index}
        backLabel="Volver a anuncios"
        title="Editar anuncio"
        description={announcement.title ?? 'Anuncio sin título'}
      />

      <FormCard>
        <AnnouncementForm
          action={saveWithId}
          mode="edit"
          defaults={{
            title: announcement.title ?? undefined,
            description: announcement.description ?? undefined,
            linkUrl: announcement.linkUrl ?? undefined,
            startsAt: announcement.startsAt,
            endsAt: announcement.endsAt,
            isActive: announcement.isActive ?? true,
            imageUrl: announcement.imageUrl,
            imagePublicId: announcement.imagePublicId,
          }}
        />
      </FormCard>
    </div>
  )
}
