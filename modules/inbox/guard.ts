import { createHmac, timingSafeEqual } from 'node:crypto'

// Protección de la API interna de leads. Lógica pura (sin Next ni DB) para probarla con tsx.
// ponytail: un navegador anónimo nunca prueba al 100% que viene de nuestra web; esto frena el
// spam a ciegas (curl directo, otros sitios). Cloudflare Turnstile es la mejora si hace falta.

export const LEAD_TOKEN_TTL_MS = 2 * 60 * 60 * 1000

function sign(secret: string, exp: number) {
  return createHmac('sha256', secret).update(`inbox-lead.${exp}`).digest('base64url')
}

/** Token `exp.firma` de corta vida que la página pide antes de registrar un lead. */
export function signLeadToken(secret: string, now = Date.now()) {
  const exp = now + LEAD_TOKEN_TTL_MS
  return `${exp}.${sign(secret, exp)}`
}

export function verifyLeadToken(token: unknown, secret: string, now = Date.now()) {
  if (typeof token !== 'string' || token.length > 100) return false
  const [expRaw, sig] = token.split('.')
  const exp = Number(expRaw)
  // Vencido, o con un vencimiento más lejano del que nosotros emitimos.
  if (!Number.isInteger(exp) || !sig || exp <= now || exp > now + LEAD_TOKEN_TTL_MS + 60_000) return false
  const expected = Buffer.from(sign(secret, exp))
  const given = Buffer.from(sig)
  return expected.length === given.length && timingSafeEqual(expected, given)
}

/**
 * Solo peticiones hechas por nuestras propias páginas. Los navegadores mandan Sec-Fetch-Site;
 * si falta (navegadores viejos) se compara el host de Origin con el host de la petición.
 */
export function isSameOriginRequest(h: { secFetchSite: string | null; origin: string | null; host: string | null }) {
  if (h.secFetchSite) return h.secFetchSite === 'same-origin'
  if (!h.origin || !h.host) return false
  try {
    return new URL(h.origin).host === h.host
  } catch {
    return false
  }
}
