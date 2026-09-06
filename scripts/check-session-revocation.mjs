import assert from 'node:assert/strict'

// Espejo de isTokenRevoked en lib/auth/check-permission.ts — si cambias uno, cambia el otro.
const isTokenRevoked = (iat, sessionsRevokedAt) => {
  if (!sessionsRevokedAt) return false
  if (typeof iat !== 'number' || !Number.isFinite(iat)) return true
  return iat * 1000 < sessionsRevokedAt.getTime()
}

const revokedAt = new Date('2026-09-06T12:00:00.000Z')
const secondsAt = (iso) => Math.floor(new Date(iso).getTime() / 1000)

assert.equal(
  isTokenRevoked(secondsAt('2026-09-06T11:59:59.000Z'), revokedAt),
  true,
  'un token emitido antes de la revocación debe quedar revocado',
)

assert.equal(
  isTokenRevoked(secondsAt('2026-09-06T12:00:01.000Z'), revokedAt),
  false,
  'un token emitido después de la revocación debe seguir siendo válido',
)

assert.equal(
  isTokenRevoked(secondsAt('2026-09-06T11:59:59.000Z'), null),
  false,
  'sin marca de revocación ningún token está revocado',
)

assert.equal(
  isTokenRevoked(undefined, revokedAt),
  true,
  'sin claim iat se revoca (fail-closed)',
)

// Caso borde: emitido exactamente en el mismo segundo de la revocación.
// MySQL TIMESTAMP e iat tienen precisión de segundos, así que no se revoca.
assert.equal(
  isTokenRevoked(secondsAt('2026-09-06T12:00:00.000Z'), revokedAt),
  false,
  'emitido en el mismo segundo de la revocación no debe revocarse',
)

console.log('OK isTokenRevoked revoca solo los tokens emitidos antes de sessions_revoked_at')
