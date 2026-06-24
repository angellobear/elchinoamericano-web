import { NextRequest, NextResponse } from 'next/server'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { logger } from '@/lib/logger'

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME
const API_KEY = process.env.CLOUDINARY_API_KEY
const API_SECRET = process.env.CLOUDINARY_API_SECRET

// POST: subir imagen → devuelve { url, publicId }
export async function POST(req: NextRequest) {
  const payload = await getJwtPayload()
  if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Sin archivo' }, { status: 400 })

    const buf = Buffer.from(await file.arrayBuffer())
    const b64 = `data:${file.type};base64,${buf.toString('base64')}`

    const fd = new FormData()
    fd.append('file', b64)
    fd.append('upload_preset', 'unsigned_uploads')
    fd.append('folder', 'elchino-admin')
    fd.append('api_key', API_KEY!)

    // Signed upload
    const ts = Math.round(Date.now() / 1000)
    const toSign = `folder=elchino-admin&timestamp=${ts}${API_SECRET}`
    const { createHash } = await import('crypto')
    const sig = createHash('sha256').update(toSign).digest('hex')

    const body = new FormData()
    body.append('file', b64)
    body.append('folder', 'elchino-admin')
    body.append('timestamp', String(ts))
    body.append('api_key', API_KEY!)
    body.append('signature', sig)

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
      method: 'POST',
      body,
    })

    if (!res.ok) {
      const err = await res.text()
      logger.error({ err }, 'Cloudinary upload failed')
      return NextResponse.json({ error: 'Error al subir imagen' }, { status: 500 })
    }

    const data = await res.json()
    logger.info({ publicId: data.public_id }, 'Image uploaded')
    return NextResponse.json({ url: data.secure_url, publicId: data.public_id })
  } catch (err) {
    logger.error({ err }, 'Upload route error')
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// DELETE: eliminar imagen de Cloudinary por publicId
export async function DELETE(req: NextRequest) {
  const payload = await getJwtPayload()
  if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const { publicId } = await req.json()
    if (!publicId) return NextResponse.json({ error: 'Sin publicId' }, { status: 400 })

    const ts = Math.round(Date.now() / 1000)
    const toSign = `public_id=${publicId}&timestamp=${ts}${API_SECRET}`
    const { createHash } = await import('crypto')
    const sig = createHash('sha256').update(toSign).digest('hex')

    const body = new URLSearchParams({
      public_id: publicId,
      timestamp: String(ts),
      api_key: API_KEY!,
      signature: sig,
    })

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/destroy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })

    if (!res.ok) {
      logger.error({ publicId }, 'Cloudinary delete failed')
      return NextResponse.json({ error: 'Error al eliminar imagen' }, { status: 500 })
    }

    logger.info({ publicId }, 'Image deleted from Cloudinary')
    return NextResponse.json({ ok: true })
  } catch (err) {
    logger.error({ err }, 'Delete route error')
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
