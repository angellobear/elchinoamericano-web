import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Toaster } from 'sonner'
import { getJwtPayload } from '@/lib/auth/check-permission'
import { SidebarNav } from './_components/SidebarNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const payload = await getJwtPayload()
  if (!payload) redirect('/login')

  return (
    <>
      <div className="min-h-screen flex bg-slate-50">
        <aside className="w-64 shrink-0 bg-navy text-white flex flex-col border-r border-white/6">
          {/* Sidebar header */}
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

          <SidebarNav
            isSuperAdmin={payload.role === 'superadmin'}
            email={payload.email}
            role={payload.role}
          />
        </aside>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      <Toaster position="top-right" richColors={true} />
    </>
  )
}
