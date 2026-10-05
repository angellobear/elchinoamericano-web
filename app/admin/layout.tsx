import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Toaster } from 'sonner'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { SidebarNav } from './_components/SidebarNav'
import { MobileAdminHeader } from './_components/MobileAdminHeader'
import { countUnread } from '@/lib/db/inbox'
import { INBOX_PERMISSION_KEYS } from '@/modules/admin/inbox/types'
import { hasModulePermission } from '@/modules/admin/shared/server/permissions'
import { adminPwaMetadata, adminViewport } from '@/lib/pwa'

export const metadata = adminPwaMetadata
export const viewport = adminViewport

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const payload = await getJwtPayload()
  if (!payload) redirect('/login')

  const isSuperAdmin = payload.role === 'superadmin'
  // Si la tabla aún no existe (parche sin aplicar) el panel no debe caerse: badge en 0.
  const unreadCount = hasModulePermission(payload, INBOX_PERMISSION_KEYS, 'can_view')
    ? await countUnread().catch(() => 0)
    : 0

  return (
    <>
      {/* print:*! — al imprimir un documento (pedidos) solo sale el contenido, sin panel ni scroll interno. */}
      <div className="min-h-screen bg-slate-50 md:flex print:block! print:min-h-0! print:bg-white!">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-64 shrink-0 bg-navy text-white flex-col border-r border-white/6 print:hidden!">
          <div className="h-16 px-5 flex items-center gap-3 border-b border-white/10 shrink-0">
            <Link href="/admin/dashboard" className="flex items-center gap-3 min-w-0">
              <div className="relative h-9 w-9 shrink-0">
                <Image
                  src="/logo-ca.png"
                  alt="El Chino Americano"
                  fill
                  className="object-contain"
                  sizes="36px"
                  priority
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight text-white truncate">
                  El Chino <span className="text-brand">Americano</span>
                </p>
                <p className="text-white/35 text-xs">Panel de administración</p>
              </div>
            </Link>
          </div>
          <SidebarNav isSuperAdmin={isSuperAdmin} email={payload.email} role={payload.role} unreadCount={unreadCount} />
        </aside>

        {/* Content area */}
        <div className="flex-1 flex flex-col min-h-screen md:min-h-0 md:overflow-hidden print:block! print:min-h-0! print:overflow-visible!">
          <MobileAdminHeader isSuperAdmin={isSuperAdmin} email={payload.email} role={payload.role} unreadCount={unreadCount} />
          <main className="flex-1 overflow-auto print:overflow-visible!">
            {children}
          </main>
        </div>
      </div>
      <Toaster position="top-right" richColors={true} />
    </>
  )
}
