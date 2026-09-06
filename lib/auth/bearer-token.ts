import { timingSafeEqual } from 'node:crypto'

/**
 * Compara un token recibido contra el secreto esperado en tiempo constante.
 *
 * `timingSafeEqual` lanza `ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH` si los buffers
 * difieren en longitud, así que comparamos longitudes antes. Esa comparación
 * filtra únicamente la longitud del secreto, nunca su contenido.
 *
 * NOTA: `scripts/check-token-compare.mjs` es un espejo de esta función.
 * Si cambias una, cambia la otra.
 */
export function tokensMatch(received: string, expected: string): boolean {
  const a = Buffer.from(received)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/** Extrae el token de un header `Authorization: Bearer <token>`. */
export function extractBearerToken(authHeader: string | null): string {
  const header = authHeader ?? ''
  return header.startsWith('Bearer ') ? header.slice(7) : ''
}
