import Link from 'next/link'
import Image from 'next/image'
import { Megaphone, Pencil } from 'lucide-react'
import { todayInEcuador } from '@/lib/today-ecuador'
import { routes } from '@/lib/routes'
import type { AnnouncementListItem } from '@/modules/admin/announcements/types'
import { ANNOUNCEMENT_STATUS_TONE, announcementWindowStatus } from '@/modules/admin/announcements/window'
import { AnnouncementStatusToggle } from '@/modules/admin/announcements/components/AnnouncementStatusToggle'
import { AnnouncementDeleteButton } from '@/modules/admin/announcements/components/AnnouncementDeleteButton'

interface AnnouncementsTableProps {
  announcements: AnnouncementListItem[]
}

export function AnnouncementsTable({ announcements }: AnnouncementsTableProps) {
  const today = todayInEcuador()

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">Anuncio</th>
              <th className="text-left px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">Vigencia</th>
              <th className="text-center px-4 py-3.5 font-semibold text-slate-400 text-xs uppercase tracking-wider">Estado</th>
              <th className="px-4 py-3.5 w-28"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {announcements.map((item) => {
              const status = announcementWindowStatus(item, today)
              const name = item.title ?? 'Anuncio sin título'

              return (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <Image
                        src={item.imageUrl}
                        alt={name}
                        width={56}
                        height={40}
                        className="w-14 h-10 object-cover rounded-md border border-slate-100 bg-slate-50 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 truncate">{name}</p>
                        {item.linkUrl ? (
                          <p className="text-xs text-slate-400 truncate">{item.linkUrl}</p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                    {item.startsAt} → {item.endsAt}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${ANNOUNCEMENT_STATUS_TONE[status]}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={routes.admin.announcements.edit(item.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-navy transition-colors"
                        title="Editar"
                      >
                        <Pencil size={13} />
                      </Link>
                      <AnnouncementStatusToggle id={item.id} isActive={item.isActive} />
                      <AnnouncementDeleteButton id={item.id} name={name} />
                    </div>
                  </td>
                </tr>
              )
            })}
            {announcements.length === 0 && (
              <tr>
                <td colSpan={4} className="py-16 text-center">
                  <Megaphone size={32} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-400">No hay anuncios registrados</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
