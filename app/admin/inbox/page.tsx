import Link from 'next/link'
import { PackageSearch, ShoppingCart } from 'lucide-react'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { listInbox } from '@/lib/db/inbox'
import { routes } from '@/lib/routes'
import { todayInEcuador } from '@/lib/today-ecuador'
import { InboxRowActions } from '@/modules/admin/inbox/components/InboxRowActions'
import { MarkAllReadButton } from '@/modules/admin/inbox/components/MarkAllReadButton'
import { filtersFromParams, INBOX_PERMISSION_KEYS, normalizeInboxParams } from '@/modules/admin/inbox/types'
import { hasModulePermission } from '@/modules/admin/shared/server/permissions'
import { INBOX_PAGE_SIZE, INBOX_TYPE_LABEL, summarizeInbox } from '@/modules/inbox/schema'

const dateFmt = new Intl.DateTimeFormat('es-EC', {
  timeZone: 'America/Guayaquil', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
})

const field = 'px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy'

export default async function InboxPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = normalizeInboxParams(await searchParams)
  const { filters, range, page } = filtersFromParams(params, todayInEcuador())
  const [{ rows, total }, payload] = await Promise.all([listInbox(filters, page), getJwtPayload()])
  const canEdit = hasModulePermission(payload, INBOX_PERMISSION_KEYS, 'can_edit')
  const canDelete = hasModulePermission(payload, INBOX_PERMISSION_KEYS, 'can_delete')
  const pages = Math.max(1, Math.ceil(total / INBOX_PAGE_SIZE))

  const pageHref = (p: number) => {
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v)
    qs.set('page', String(p))
    return `${routes.admin.inbox.index}?${qs}`
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-navy">Bandeja</h1>
          <p className="text-slate-400 text-sm mt-0.5">Solicitudes de repuestos y pedidos del carrito</p>
        </div>
        {canEdit && <MarkAllReadButton params={params} />}
      </div>

      {/* Form GET nativo: los filtros quedan en la URL y se pueden compartir. */}
      <form method="get" className="flex flex-wrap items-end gap-3 mb-5 p-4 bg-white border border-slate-200 rounded-xl">
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
          Tipo
          <select name="type" defaultValue={filters.type ?? ''} className={field}>
            <option value="">Todos</option>
            <option value="part_request">Solicitudes</option>
            <option value="cart">Pedidos de carrito</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
          Desde
          <input type="date" name="from" defaultValue={range.from} className={field} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
          Hasta
          <input type="date" name="to" defaultValue={range.to} className={field} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500 flex-1 min-w-48">
          Buscar
          <input type="search" name="search" defaultValue={filters.search ?? ''} placeholder="Nombre o teléfono" className={field} />
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600 py-2">
          <input type="checkbox" name="unread" value="1" defaultChecked={filters.unreadOnly} /> Solo no leídos
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600 py-2">
          <input type="checkbox" name="hidden" value="1" defaultChecked={filters.includeHidden} /> Mostrar ocultos
        </label>
        <button type="submit" className="px-4 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy/90 transition-colors">
          Filtrar
        </button>
        <Link href={routes.admin.inbox.index} className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-navy">
          Últimos 30 días
        </Link>
      </form>

      <p className="text-xs text-slate-400 mb-2">{total} {total === 1 ? 'mensaje' : 'mensajes'}</p>

      {rows.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-400 bg-white border border-slate-200 rounded-xl">
          No hay mensajes con estos filtros.
        </div>
      ) : (
        <ul className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {rows.map((row) => {
            const unread = !row.readAt
            const Icon = row.type === 'cart' ? ShoppingCart : PackageSearch
            return (
              <li key={row.id} className={`flex items-center gap-3 px-4 py-3 ${row.hiddenAt ? 'opacity-50' : ''}`}>
                <span className={`w-2 h-2 rounded-full shrink-0 ${unread ? 'bg-brand' : 'bg-transparent'}`} aria-label={unread ? 'No leído' : undefined} />
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold shrink-0 ${
                  row.type === 'cart' ? 'bg-brand/10 text-brand' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Icon size={12} />
                  {INBOX_TYPE_LABEL[row.type]}
                </span>
                <Link href={routes.admin.inbox.detail(row.id)} className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${unread ? 'font-bold text-navy' : 'text-slate-700'}`}>
                    {row.name} <span className="font-normal text-slate-400">· {row.phone}</span>
                  </p>
                  <p className="text-xs text-slate-500 truncate">{summarizeInbox(row.type, row.payload)}</p>
                </Link>
                <span className="text-xs text-slate-400 shrink-0 hidden sm:block">
                  {row.createdAt ? dateFmt.format(row.createdAt) : ''}
                </span>
                <InboxRowActions id={row.id} isRead={!unread} isHidden={!!row.hiddenAt} canEdit={canEdit} canDelete={canDelete} />
              </li>
            )
          })}
        </ul>
      )}

      {(pages > 1 || page > 1) && (
        <nav className="flex items-center justify-center gap-3 mt-4 text-sm">
          {page > 1 && <Link href={pageHref(Math.min(page - 1, pages))} className="text-navy font-medium hover:underline">← Anterior</Link>}
          <span className="text-slate-400">Página {page} de {pages}</span>
          {page < pages && <Link href={pageHref(page + 1)} className="text-navy font-medium hover:underline">Siguiente →</Link>}
        </nav>
      )}
    </div>
  )
}
