import Link from 'next/link'
import { Plus } from 'lucide-react'
import { routes } from '@/lib/routes'
import { AnnouncementsTable } from '@/modules/admin/announcements/components/AnnouncementsTable'
import { announcementRepository } from '@/modules/admin/announcements/server/repository'

export default async function AnnouncementsPage() {
  const announcements = await announcementRepository.listForAdmin()

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-navy">Anuncios</h1>
          <p className="text-slate-400 text-sm mt-0.5">{announcements.length} anuncios registrados</p>
        </div>
        <Link
          href={routes.admin.announcements.create}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand/90 active:scale-[0.98] transition-all"
        >
          <Plus size={15} />
          Nuevo anuncio
        </Link>
      </div>
      <AnnouncementsTable announcements={announcements} />
    </div>
  )
}
