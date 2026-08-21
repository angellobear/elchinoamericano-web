import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { buildProductPath } from '@/lib/product-slugs'
import { SITE_URL } from '@/lib/seo'

const INDEXNOW_KEY = 'c2da09cf3ac8be47650f6b21e7f56906'

async function notifyIndexNow(urls: string[]) {
  await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ host: new URL(SITE_URL).hostname, key: INDEXNOW_KEY, urlList: urls }),
  }).catch(() => {}) // ponytail: fire-and-forget, indexing is best-effort
}

// Called from admin Server Actions after saving a product
export async function POST(req: NextRequest) {
  const { slug, code, path } = await req.json().catch(() => ({}))
  revalidatePath('/catalogo')
  if (path) revalidatePath(path)
  else if (code && slug) revalidatePath(buildProductPath({ code, slug }))
  revalidatePath('/')

  const productPath = path ?? (code && slug ? buildProductPath({ code, slug }) : null)
  const urls = [`${SITE_URL}/catalogo`, ...(productPath ? [`${SITE_URL}${productPath}`] : [])]
  notifyIndexNow(urls)

  return NextResponse.json({ revalidated: true })
}
