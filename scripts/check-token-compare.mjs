import assert from 'node:assert/strict'
import { timingSafeEqual } from 'node:crypto'

// Espejo de tokensMatch en lib/auth/bearer-token.ts — si cambias uno, cambia el otro.
const tokensMatch = (received, expected) => {
  const a = Buffer.from(received)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

const secret = 'a'.repeat(32)

assert.equal(
  tokensMatch(secret, secret),
  true,
  'dos tokens idénticos deben coincidir',
)

assert.equal(
  tokensMatch('b'.repeat(32), secret),
  false,
  'tokens distintos de igual longitud no deben coincidir',
)

assert.equal(
  tokensMatch(`${secret}x`, secret),
  false,
  'tokens de longitud distinta no deben coincidir',
)

// El caso de longitudes distintas nunca debe lanzar ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH.
assert.doesNotThrow(
  () => tokensMatch('corto', secret),
  'comparar longitudes distintas no debe lanzar excepción',
)

assert.equal(
  tokensMatch('', secret),
  false,
  'un token vacío (header ausente o sin prefijo Bearer) no debe coincidir',
)

// Un prefijo correcto no debe bastar: la comparación es sobre el token completo.
assert.equal(
  tokensMatch(`${'a'.repeat(31)}b`, secret),
  false,
  'compartir el prefijo no debe hacer coincidir los tokens',
)

console.log('check-token-compare: OK')
