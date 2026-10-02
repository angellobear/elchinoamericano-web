import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DeliveryPhotos } from '@/components/orders/DeliveryPhotos'
import { OrderDocument } from '@/components/orders/OrderDocument'
import { getOrderByToken } from '@/lib/db/orders'
import { PUBLIC_TOKEN_PATTERN, buildOrderDocument } from '@/lib/orders'
import { SITE_NAME } from '@/lib/seo'

// Página privada por enlace: nunca se indexa, nunca se cachea y no filtra el token como referrer.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: `Estado de tu pedido | ${SITE_NAME}`,
  description: 'Consulta el estado, los abonos y el saldo de tu pedido.',
  robots: { index: false, follow: false, nocache: true },
  referrer: 'no-referrer',
}

export default async function PublicOrderPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  // Un token con formato inválido ni siquiera llega a la base.
  if (!PUBLIC_TOKEN_PATTERN.test(token)) notFound()

  const order = await getOrderByToken(token)
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
