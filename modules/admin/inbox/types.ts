import type { InboxFilters } from '@/lib/db/inbox'
import { addDays, ecuadorDayStart, INBOX_TYPES, resolveInboxRange, type InboxType } from '@/modules/inbox/schema'

export const INBOX_PERMISSION_KEYS = ['inbox'] as const

export interface InboxSearchParams {
  type?: string
  unread?: string
  hidden?: string
  from?: string
  to?: string
  search?: string
  page?: string
}

/** Query params → filtros de DB. Lo usan la página y la acción "marcar todo como leído". */
export function filtersFromParams(params: InboxSearchParams, today: string) {
  const range = resolveInboxRange(params, today)
  const type = INBOX_TYPES.find((t) => t === params.type) as InboxType | undefined
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1)
  const filters: InboxFilters = {
    type,
    unreadOnly: params.unread === '1',
    includeHidden: params.hidden === '1',
    from: ecuadorDayStart(range.from),
    toExclusive: ecuadorDayStart(addDays(range.to, 1)),
    search: params.search?.trim() || undefined,
  }
  return { filters, range, page }
}
