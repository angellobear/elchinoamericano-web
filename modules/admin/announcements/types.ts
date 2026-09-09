export const ANNOUNCEMENT_PERMISSION_KEYS = ['announcements', 'anuncios'] as const

export interface AnnouncementListItem {
  id: number
  title: string | null
  imageUrl: string
  linkUrl: string | null
  startsAt: string
  endsAt: string
  isActive: boolean
}
