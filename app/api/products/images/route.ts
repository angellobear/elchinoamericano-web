import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db/client'
import { products } from '@/lib/db/schema'
import { addImage } from '@/lib/db/products'
import { uploadImage, deleteImage } from '@/lib/cloudinary'
import { buildProductPath } from '@/lib/product-slugs'

// ponytail: una imagen por petición — el body de Vercel serverless tope ~4.5 MB.
const MAX_BYTES = 4 * 1024 * 1024

/**
 * Sube UNA imagen a Cloudinary y la agrega a un producto existente.
 * multipart/form-data: file (requerido), code o sku (uno requerido), altText?, isPrimary? ("true")
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

  const code = String(form.get('code') ?? '').trim().toUpperCase()
  const sku = String(form.get('sku') ?? '').trim().toUpperCase()
  if (!code && !sku) {
    return NextResponse.json({ error: 'Envía "code" o "sku" del producto' }, { status: 400 })
  }

  const db = await getDb()
  // code es único; sku no, así que si hay varios con el mismo sku se pide el code.
  const matches = await db.query.products.findMany({
    where: code ? eq(products.code, code) : eq(products.sku, sku),
    columns: { id: true, code: true, slug: true },
    limit: 2,
  })
  if (matches.length === 0) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
  }
  if (matches.length > 1) {
    return NextResponse.json({ error: 'Varios productos con ese SKU, usa "code"' }, { status: 409 })
  }
  const product = matches[0]

  const altText = String(form.get('altText') ?? '').trim() || undefined
  const isPrimary = form.get('isPrimary') === 'true'

  let uploaded: { url: string; publicId: string } | undefined
  try {
    uploaded = await uploadImage(file, 'products')
    await addImage(product.id, { url: uploaded.url, cloudinaryPublicId: uploaded.publicId, altText, isPrimary })
  } catch (err: unknown) {
    console.error('[products/images] error:', err)
    if (uploaded) await deleteImage(uploaded.publicId).catch(() => {})
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error inesperado' }, { status: 500 })
  }

  revalidatePath(buildProductPath(product))
  revalidatePath('/catalogo')

  return NextResponse.json({ success: true, productId: product.id, url: uploaded.url })
}
