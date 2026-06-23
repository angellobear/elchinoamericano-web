import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

// Called from admin Server Actions after saving a product
export async function POST(req: NextRequest) {
  const { slug } = await req.json().catch(() => ({}))
  revalidatePath('/catalogo')
  if (slug) revalidatePath(`/catalogo/${slug}`)
  revalidatePath('/')  // landing may show featured products
  return NextResponse.json({ revalidated: true })
}
