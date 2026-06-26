import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { buildProductPath } from '@/lib/product-slugs'

// Called from admin Server Actions after saving a product
export async function POST(req: NextRequest) {
  const { slug, code, path } = await req.json().catch(() => ({}))
  revalidatePath('/catalogo')
  if (path) revalidatePath(path)
  else if (code && slug) revalidatePath(buildProductPath({ code, slug }))
  revalidatePath('/')
  return NextResponse.json({ revalidated: true })
}
