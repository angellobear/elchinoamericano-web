// Registro silencioso de leads desde el navegador. Nunca lanza ni bloquea: el cliente sigue
// su flujo a WhatsApp y esto viaja en segundo plano.

type LeadBody =
  | { type: "part_request"; name: string; phone: string; payload: Record<string, string> }
  | { type: "cart"; name: string; items: { id: number; qty: number }[] }
  | { type: "whatsapp"; payload: { source: string; item?: string; page: string } }

const ENDPOINT = "/api/leads"
const DOUBLE_CLICK_MS = 5000
const REFRESH_MARGIN_MS = 5 * 60 * 1000

let cached: { token: string; exp: number } | null = null
let inflight: Promise<string | null> | null = null
const recent = new Map<string, number>()

function getLeadToken(): Promise<string | null> {
  if (cached && cached.exp - Date.now() > REFRESH_MARGIN_MS) return Promise.resolve(cached.token)
  inflight ??= fetch(ENDPOINT, { credentials: "same-origin", cache: "no-store" })
    .then((res) => (res.ok ? res.json() : null))
    .then((data: { token?: string } | null) => {
      const token = data?.token
      if (!token) return null
      cached = { token, exp: Number(token.split(".")[0]) || 0 }
      return token
    })
    .catch(() => null)
    .finally(() => {
      inflight = null
    })
  return inflight
}

/** Pide el token antes del clic (hover/focus en un botón) para que el envío salga al instante. */
export function prefetchLeadToken() {
  void getLeadToken()
}

/** Registra el lead en la bandeja. Ignora el mismo envío repetido en pocos segundos (doble clic). */
export function recordLead(body: LeadBody) {
  const key = JSON.stringify(body)
  const now = Date.now()
  if (now - (recent.get(key) ?? 0) < DOUBLE_CLICK_MS) return
  recent.set(key, now)

  void getLeadToken().then((token) => {
    if (!token) return
    // keepalive: el envío sigue aunque la pestaña pase a segundo plano al abrir WhatsApp.
    return fetch(ENDPOINT, {
      method: "POST",
      keepalive: true,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, token }),
    })
  }).catch(() => {})
}
