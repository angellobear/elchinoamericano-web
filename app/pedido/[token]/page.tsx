import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DeliveryPhotos } from '@/components/orders/DeliveryPhotos'
import { OrderDocument } from '@/components/orders/OrderDocument'
import { cache } from 'react'
import { getOrderByToken } from '@/lib/db/orders'
import { PUBLIC_TOKEN_PATTERN, buildOrderDocument, formatDocNumber } from '@/lib/orders'
import { SITE_LOCALE, SITE_NAME, toAbsoluteUrl } from '@/lib/seo'

// Imagen propia de los enlaces de pedido (public/og-pedido.jpg); el resto del sitio usa la general.
const SHARE_IMAGE = { path: '/og-pedido.jpg', alt: `Tu pedido en ${SITE_NAME}`, width: 1424, height: 752 }

// Página privada por enlace: nunca se indexa, nunca se cachea y no filtra el token como referrer.
export const dynamic = 'force-dynamic'

// Una sola consulta por petición: la usan la metadata y la página.
// Un token con formato inválido ni siquiera llega a la base.
const findOrder = cache(async (token: string) =>
  PUBLIC_TOKEN_PATTERN.test(token) ? ((await getOrderByToken(token)) ?? null) : null,
)

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params
  const order = await findOrder(token)

  // Vista previa al compartir el enlace (WhatsApp, redes): dice de qué pedido se trata para que
  // el cliente confíe en el enlace. Solo el número: las apps guardan la vista previa, así que un
  // estado o un saldo quedarían desactualizados, y aquí no va ningún dato personal.
  const title = order ? `Tu pedido ${formatDocNumber('PED', order.id)} | ${SITE_NAME}` : `Estado de tu pedido | ${SITE_NAME}`
  const description = `Revisa aquí el detalle de tu pedido, tus abonos y el saldo pendiente. Enlace personal enviado por ${SITE_NAME}.`
  const image = toAbsoluteUrl(SHARE_IMAGE.path)

  return {
    title,
    description,
    robots: { index: false, follow: false, nocache: true },
    referrer: 'no-referrer',
    openGraph: {
      type: 'website',
      locale: SITE_LOCALE,
      siteName: SITE_NAME,
      title,
      description,
      images: [{ url: image, alt: SHARE_IMAGE.alt, width: SHARE_IMAGE.width, height: SHARE_IMAGE.height }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  }
}

export default async function PublicOrderPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const order = await findOrder(token)
  if (!order) notFound()

  const data = buildOrderDocument(order, { publicView: true })

  return (
    <main className="flex-1 bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
        <OrderDocument kind="status" data={data}>
          {data.photos.length > 0 ? (
            <section className="mt-6 border-t border-slate-100 pt-5 print:hidden">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Evidencia de entrega</p>
              <DeliveryPhotos photos={data.photos} />
            </section>
          ) : null}
        </OrderDocument>
      </div>
      <p className="mx-auto mt-4 max-w-3xl text-center text-xs text-slate-400">
        Este enlace es personal. Compártelo solo con quien deba ver tu pedido.
      </p>
    </main>
  )
}
