import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { getInboxMessage } from '@/lib/db/inbox'
import { buildProductPath } from '@/lib/product-slugs'
import { routes } from '@/lib/routes'
import { MarkReadOnOpen } from '@/modules/admin/inbox/components/MarkReadOnOpen'
import { InboxRowActions } from '@/modules/admin/inbox/components/InboxRowActions'
import { INBOX_PERMISSION_KEYS } from '@/modules/admin/inbox/types'
import { hasModulePermission } from '@/modules/admin/shared/server/permissions'
import { customerWhatsAppUrl, INBOX_TYPE_LABEL, type CartPayload, type PartRequestPayload } from '@/modules/inbox/schema'

const dateFmt = new Intl.DateTimeFormat('es-EC', { timeZone: 'America/Guayaquil', dateStyle: 'long', timeStyle: 'short' })

export default async function InboxDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const messageId = Number(id)
  if (!Number.isInteger(messageId)) notFound()

  const [message, payload] = await Promise.all([getInboxMessage(messageId), getJwtPayload()])
  if (!message) notFound()

  const canEdit = hasModulePermission(payload, INBOX_PERMISSION_KEYS, 'can_edit')
  const canDelete = hasModulePermission(payload, INBOX_PERMISSION_KEYS, 'can_delete')

  const isCart = message.type === 'cart'
  const cart = message.payload as CartPayload
  const part = message.payload as PartRequestPayload
  const subject = isCart ? 'tu pedido' : `tu solicitud de ${part.repuesto}`
  const waUrl = customerWhatsAppUrl(message.phone, `Hola ${message.name}, te escribimos de El Chino Americano por ${subject}.`)

  const rows: [string, string][] = isCart ? [] : [
    ['Repuesto', part.repuesto],
    ['Vehículo', [part.marcaVehiculo, part.modelo, part.anio, part.cilindraje].filter(Boolean).join(' ')],
    ['Búsqueda', part.searchQuery],
    ['Nota', part.nota],
  ]

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      {/* Se marca leído desde el cliente: hacerlo en el render deshacía "No leído" al re-renderizar tras la acción. */}
      {canEdit && !message.readAt && <MarkReadOnOpen id={message.id} />}
      <Link href={routes.admin.inbox.index} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy mb-4">
        <ArrowLeft size={14} /> Bandeja
      </Link>

      <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold mb-2 ${
              isCart ? 'bg-brand/10 text-brand' : 'bg-slate-100 text-slate-600'
            }`}>
              {INBOX_TYPE_LABEL[message.type]}
            </span>
            <h1 className="text-xl font-bold text-navy">{message.name}</h1>
            <p className="text-sm text-slate-500">{message.phone}</p>
            <p className="text-xs text-slate-400 mt-1">{message.createdAt ? dateFmt.format(message.createdAt) : ''}</p>
          </div>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-wa hover:bg-wa/90 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <MessageCircle size={16} /> Contactar por WhatsApp
          </a>
        </div>

        {isCart ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                <th className="py-2 font-semibold">Producto</th>
                <th className="py-2 font-semibold text-center">Cant.</th>
                <th className="py-2 font-semibold text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cart.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2">
                    <a href={buildProductPath(item)} target="_blank" rel="noopener noreferrer" className="text-navy hover:underline">
                      {item.title}
                    </a>
                    <span className="block text-xs text-slate-400 font-mono">{item.code}</span>
                  </td>
                  <td className="py-2 text-center">{item.qty}</td>
                  <td className="py-2 text-right">${(item.unitPrice * item.qty).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="pt-3 text-right text-slate-500">Total estimado</td>
                <td className="pt-3 text-right font-bold text-navy">${cart.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            {rows.filter(([, v]) => v).map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-slate-400">{label}</dt>
                <dd className="text-slate-700 whitespace-pre-line">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="border-t border-slate-100 pt-4">
          <InboxRowActions
            id={message.id}
            isRead={!!message.readAt}
            isHidden={!!message.hiddenAt}
            canEdit={canEdit}
            canDelete={canDelete}
            withLabels
            backHref={routes.admin.inbox.index}
          />
        </div>
      </div>
    </div>
  )
}
