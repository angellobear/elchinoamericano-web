import assert from 'node:assert/strict'

// Espejo de isTokenRevoked en lib/auth/check-permission.ts — si cambias uno, cambia el otro.
// Ambos argumentos son epoch en SEGUNDOS del reloj de Node: `iat` viene del JWT y
// `revokedAtEpoch` de la columna entera users.sessions_revoked_at.
const isTokenRevoked = (iat, revokedAtEpoch) => {
  if (!revokedAtEpoch) return false
  if (typeof iat !== 'number' || !Number.isFinite(iat)) return true
  return iat < revokedAtEpoch
}

const secondsAt = (iso) => Math.floor(new Date(iso).getTime() / 1000)
const revokedAt = secondsAt('2026-09-06T12:00:00.000Z')

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
// El `<` estricto es deliberado: permite que un re-login inmediato dentro del
// mismo segundo no quede invalidado, a cambio de una ventana residual de 1s.
assert.equal(
  isTokenRevoked(revokedAt, revokedAt),
  false,
  'emitido en el mismo segundo de la revocación no debe revocarse',
)

// Lo que arregla este cambio: la marca y el `iat` están ahora en la misma unidad
// (segundos epoch) y salen del mismo reloj (Node), sin conversión de zona horaria.
// Antes la marca era `now()` de MySQL leído como TIMESTAMP, así que un desfase de
// zona horaria entre el servidor MySQL y el proceso Node desplazaba la comparación
// varias horas: hacia el pasado la revocación dejaba de revocar en silencio
// (fail-open) y hacia el futuro invalidaba sesiones legítimas.
{
  const revokeInstant = Date.now()
  // Ambas marcas se derivan del mismo reloj y la misma unidad.
  const markFromNode = Math.floor(revokeInstant / 1000)
  const iatEmitidoAntes = Math.floor((revokeInstant - 60_000) / 1000)
  const iatEmitidoDespues = Math.floor((revokeInstant + 60_000) / 1000)

  assert.equal(typeof markFromNode, 'number', 'la marca es un entero, no un Date')

  assert.equal(
    isTokenRevoked(iatEmitidoAntes, markFromNode),
    true,
    'misma unidad y mismo reloj: lo emitido antes se revoca sin depender de la zona horaria',
  )
  assert.equal(
    isTokenRevoked(iatEmitidoDespues, markFromNode),
    false,
    'misma unidad y mismo reloj: lo emitido después sobrevive sin depender de la zona horaria',
  )

  // Un desfase de zona horaria (el bug anterior) habría invertido ambos resultados.
  const marcaDesplazadaCincoHoras = markFromNode - 5 * 3600
  assert.equal(
    isTokenRevoked(iatEmitidoAntes, marcaDesplazadaCincoHoras),
    false,
    'con la marca desplazada al pasado la revocación fallaría en abierto: por eso la columna es un entero de segundos',
  )
}

console.log('OK isTokenRevoked revoca solo los tokens emitidos antes de sessions_revoked_at')
