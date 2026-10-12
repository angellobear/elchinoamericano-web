import 'server-only'

import { getPricedProducts, hasRecentDuplicate, countRecentByIp, insertInboxMessage } from '@/lib/db/inbox'
import {
  DEDUPE_WINDOW_MIN,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MIN,
  buildCartSnapshot,
  inboxSubmissionSchema,
  type InboxPayload,
  type InboxType,
} from '@/modules/inbox/schema'

export type RecordLeadResult = 'saved' | 'invalid' | 'duplicate' | 'rate_limited' | 'empty_cart'

/**
 * Registra un lead del sitio público. Silencioso por diseño: el cliente ya está en WhatsApp,
 * así que el resultado solo sirve para logs; nunca se le muestra.
 */
export async function recordLead(input: unknown, ip: string | null): Promise<RecordLeadResult> {
  const parsed = inboxSubmissionSchema.safeParse(input)
  if (!parsed.success) return 'invalid'
  const data = parsed.data

  let row: { type: InboxType; name: string; phone: string; payload: InboxPayload; ip: string | null }
  if (data.type === 'cart') {
    const payload = buildCartSnapshot(data.items, await getPricedProducts(data.items.map((item) => item.id)))
    if (payload.items.length === 0) return 'empty_cart'
    row = { type: 'cart', name: data.name, phone: '', payload, ip }
  } else if (data.type === 'part_request') {
    row = { type: 'part_request', name: data.name, phone: data.phone, payload: data.payload, ip }
  } else {
    row = { type: 'whatsapp', name: '', phone: '', payload: data.payload, ip }
  }

  if (await hasRecentDuplicate(row, DEDUPE_WINDOW_MIN)) return 'duplicate'
  if (ip && (await countRecentByIp(ip, row.type, RATE_LIMIT_WINDOW_MIN)) >= RATE_LIMIT_MAX[row.type]) {
    return 'rate_limited'
  }

  await insertInboxMessage(row)
  return 'saved'
}
