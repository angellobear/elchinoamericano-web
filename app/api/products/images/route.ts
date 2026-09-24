import { NextRequest, NextResponse } from 'next/server'
import { uploadImage } from '@/lib/cloudinary'

// ponytail: una imagen por petición — el body de Vercel serverless tope ~4.5 MB.
const MAX_BYTES = 4 * 1024 * 1024

/**
 * Sube UNA imagen de producto a Cloudinary y devuelve su URL.
 * No requiere que el producto exista: la URL se usa luego en `images` de /api/products/import.
 * multipart/form-data: file (requerido)
 */
export async function POST(req: NextRequest) {
  const importToken = process.env.PRODUCT_IMPORT_TOKEN
  if (!importToken || importToken.length < 32) {
    return NextResponse.json({ error: 'PRODUCT_IMPORT_TOKEN no configurado correctamente' }, { status: 500 })
  }

  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (token !== importToken) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Se espera multipart/form-data' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'Falta el archivo en "file"' }, { status: 400 })
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: `Tipo no permitido: ${file.type || 'desconocido'}` }, { status: 415 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'La imagen supera 4 MB' }, { status: 413 })
  }

  try {
    const { url, publicId } = await uploadImage(file, 'products')
    return NextResponse.json({ success: true, url, publicId })
  } catch (err: unknown) {
    console.error('[products/images] error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error inesperado' }, { status: 502 })
  }
}
