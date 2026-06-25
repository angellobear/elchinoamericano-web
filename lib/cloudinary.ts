import { createHash } from 'crypto'

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME!
const API_KEY = process.env.CLOUDINARY_API_KEY!
const API_SECRET = process.env.CLOUDINARY_API_SECRET!

/** Sube un archivo (Buffer/Blob/File) a Cloudinary. Devuelve { url, publicId }. */
export async function uploadImage(file: File, folder = 'uploads'): Promise<{ url: string; publicId: string }> {
  const buf = Buffer.from(await file.arrayBuffer())
  const b64 = `data:${file.type};base64,${buf.toString('base64')}`

  const ts = Math.round(Date.now() / 1000)
  const sig = createHash('sha256')
    .update(`folder=${folder}&timestamp=${ts}${API_SECRET}`)
    .digest('hex')

  const body = new FormData()
  body.append('file', b64)
  body.append('folder', folder)
  body.append('timestamp', String(ts))
  body.append('api_key', API_KEY)
  body.append('signature', sig)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
    method: 'POST',
    body,
  })
  if (!res.ok) throw new Error(`Cloudinary upload failed: ${await res.text()}`)
  const data = await res.json()
  return { url: data.secure_url, publicId: data.public_id }
}

/** Elimina una imagen de Cloudinary por su publicId. */
export async function deleteImage(publicId: string): Promise<void> {
  const ts = Math.round(Date.now() / 1000)
  const sig = createHash('sha256')
    .update(`public_id=${publicId}&timestamp=${ts}${API_SECRET}`)
    .digest('hex')

  const body = new URLSearchParams({ public_id: publicId, timestamp: String(ts), api_key: API_KEY, signature: sig })
  await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/destroy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
}

/** Maneja replace de imagen: sube la nueva (si hay), elimina la vieja (si tenía publicId). */
export async function handleImageReplace(
  file: File | null,
  removed: boolean,
  oldPublicId: string | null | undefined,
  oldUrl: string | null | undefined,
  folder = 'uploads',
): Promise<{ url: string | null; publicId: string | null }> {
  if (file && file.size > 0) {
    if (oldPublicId) await deleteImage(oldPublicId).catch(() => {})
    const { url, publicId } = await uploadImage(file, folder)
    return { url, publicId }
  }
  if (removed) {
    if (oldPublicId) await deleteImage(oldPublicId).catch(() => {})
    return { url: null, publicId: null }
  }
  return { url: oldUrl ?? null, publicId: oldPublicId ?? null }
}
