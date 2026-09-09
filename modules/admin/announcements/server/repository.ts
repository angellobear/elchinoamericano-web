import { deleteAnnouncement, getAnnouncements, updateAnnouncement } from '@/lib/db/announcements'
import type { ActiveQueryOptions } from '@/lib/db/soft-delete'
import type { AnnouncementListItem } from '@/modules/admin/announcements/types'

export interface AnnouncementRepository {
  listForAdmin(options?: ActiveQueryOptions): Promise<AnnouncementListItem[]>
  updateStatus(id: number, isActive: boolean): Promise<void>
  remove(id: number): Promise<void>
}

export const announcementRepository: AnnouncementRepository = {
  async listForAdmin(options) {
    const rows = await getAnnouncements({ includeInactive: true, withTrashed: options?.withTrashed })

    return rows.map((row) => ({
      id: row.id,
      title: row.title ?? null,
      imageUrl: row.imageUrl,
      linkUrl: row.linkUrl ?? null,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      isActive: row.isActive ?? true,
    }))
  },

  async updateStatus(id, isActive) {
    await updateAnnouncement(id, { isActive })
  },

  async remove(id) {
    await deleteAnnouncement(id)
  },
}
