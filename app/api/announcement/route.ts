import { NextResponse } from 'next/server'
import { getActiveAnnouncement } from '@/lib/db/announcements'
import { logger } from '@/lib/logger'

// ponytail: el modal lo pide el cliente después de montar, así que las páginas
// públicas siguen siendo estáticas y el LCP no se toca. 5 min de caché basta.
export const revalidate = 300

export async function GET() {
  // El modal es accesorio: si la DB falla no tumbamos el build ni la página.
  const announcement = await getActiveAnnouncement().catch((err) => {
    logger.error({ err }, 'Error loading active announcement')
    return null
  })

  if (!announcement) return NextResponse.json(null)

  return NextResponse.json({
    id: announcement.id,
    title: announcement.title,
    description: announcement.description,
    imageUrl: announcement.imageUrl,
    linkUrl: announcement.linkUrl,
  })
}
