import type { AnnouncementListItem } from '@/modules/admin/announcements/types'

export type AnnouncementWindowStatus = 'Inactivo' | 'Programado' | 'Vigente' | 'Expirado'

/**
 * Misma regla que el WHERE de getActiveAnnouncement: ambas fechas inclusivas,
 * comparadas como texto YYYY-MM-DD (orden lexicográfico = orden cronológico).
 */
export function announcementWindowStatus(
  item: Pick<AnnouncementListItem, 'isActive' | 'startsAt' | 'endsAt'>,
  today: string,
): AnnouncementWindowStatus {
  if (!item.isActive) return 'Inactivo'
  if (today < item.startsAt) return 'Programado'
  if (today > item.endsAt) return 'Expirado'
  return 'Vigente'
}

export const ANNOUNCEMENT_STATUS_TONE: Record<AnnouncementWindowStatus, string> = {
  Inactivo: 'bg-gray-100 text-slate-500',
  Programado: 'bg-amber-50 text-amber-700',
  Expirado: 'bg-gray-100 text-slate-500',
  Vigente: 'bg-emerald-50 text-emerald-700',
}
