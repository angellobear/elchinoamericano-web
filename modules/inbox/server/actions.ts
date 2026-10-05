'use server'

import { headers } from 'next/headers'
import { logger } from '@/lib/logger'
import { countRecentByIp, getPricedProducts, insertInboxMessage } from '@/lib/db/inbox'
import { errorResult, successResult, type ActionResult } from '@/modules/admin/shared/types/action-result'
import {
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MIN,
  buildCartSnapshot,
  inboxSubmissionSchema,
  type InboxSubmissionInput,
} from '@/modules/inbox/schema'

async function clientIp() {
  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip')?.trim()
  return ip ? ip.slice(0, 45) : null
}

/** Registra un lead del sitio público en la bandeja del admin. */
export async function submitInboxMessage(input: InboxSubmissionInput & { website?: string }): Promise<ActionResult> {
  // Honeypot: un bot llena el campo oculto. Se responde "ok" para que no reintente.
  if (input.website) return successResult('Recibido.')

  const parsed = inboxSubmissionSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.')
      ;(fieldErrors[key] ??= []).push(issue.message)
    }
    return errorResult(parsed.error.issues[0]?.message ?? 'Revisa los datos del formulario.', fieldErrors)
  }

  try {
    const ip = await clientIp()
    if (ip && (await countRecentByIp(ip, RATE_LIMIT_WINDOW_MIN)) >= RATE_LIMIT_MAX) {
      return errorResult('Demasiados intentos, intenta en unos minutos.')
    }

    const data = parsed.data
    if (data.type === 'cart') {
      const rows = await getPricedProducts(data.items.map((item) => item.id))
      const payload = buildCartSnapshot(data.items, rows)
      if (payload.items.length === 0) {
        return errorResult('Los productos de tu pedido ya no están disponibles.')
      }
      await insertInboxMessage({ type: 'cart', name: data.name, phone: data.phone, payload, ip })
    } else {
      await insertInboxMessage({ type: 'part_request', name: data.name, phone: data.phone, payload: data.payload, ip })
    }

    return successResult('Recibido.')
  } catch (err) {
    logger.error({ err, type: input.type }, 'Error saving inbox message')
    return errorResult('No pudimos enviar tu solicitud. Intenta de nuevo o escríbenos por WhatsApp.')
  }
}
