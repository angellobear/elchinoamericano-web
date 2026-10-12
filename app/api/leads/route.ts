import { createHash } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { isSameOriginRequest, signLeadToken, verifyLeadToken } from '@/modules/inbox/guard'
import { recordLead } from '@/modules/inbox/server/record-lead'

// API interna de la bandeja: solo la llaman nuestras propias páginas (lib/lead-beacon.ts).
// Cualquier otro origen, o sin token válido, recibe 403.

const MAX_BODY_BYTES = 16 * 1024

function tokenSecret() {
  const jwt = process.env.JWT_SECRET
  if (!jwt) throw new Error('JWT_SECRET no está definido.')
  // Llave derivada: el token de leads no sirve como JWT ni al revés.
  return createHash('sha256').update(`inbox-lead-token:${jwt}`).digest('hex')
}

function sameOrigin(req: NextRequest) {
  return isSameOriginRequest({
    secFetchSite: req.headers.get('sec-fetch-site'),
    origin: req.headers.get('origin'),
    host: req.headers.get('x-forwarded-host') ?? req.headers.get('host'),
  })
}

function clientIp(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip')?.trim()
  return ip ? ip.slice(0, 45) : null
}

const forbidden = () => new NextResponse(null, { status: 403 })
const noStore = { 'Cache-Control': 'no-store' }

export async function GET(req: NextRequest) {
  if (!sameOrigin(req)) return forbidden()
  return NextResponse.json({ token: signLeadToken(tokenSecret()) }, { headers: noStore })
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return forbidden()

  const raw = await req.text().catch(() => '')
  if (!raw || raw.length > MAX_BODY_BYTES) return new NextResponse(null, { status: 400 })

  let body: { token?: unknown } & Record<string, unknown>
  try {
    body = JSON.parse(raw)
  } catch {
    return new NextResponse(null, { status: 400 })
  }
  if (!body || typeof body !== 'object' || !verifyLeadToken(body.token, tokenSecret())) return forbidden()

  try {
    const result = await recordLead(body, clientIp(req))
    if (result !== 'saved') logger.info({ result, type: body.type }, 'Lead not saved')
  } catch (err) {
    logger.error({ err, type: body.type }, 'Error saving lead')
  }
  // Siempre 204: el cliente no espera ni muestra nada.
  return new NextResponse(null, { status: 204, headers: noStore })
}
