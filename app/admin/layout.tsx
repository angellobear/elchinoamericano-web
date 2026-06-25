import { redirect } from 'next/navigation'
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
      <div className="min-h-screen flex bg-gray-50">
        <aside className="w-64 shrink-0 bg-navy text-white flex flex-col">
          <div className="p-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center text-xs font-bold tracking-wide shrink-0">
                CA
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight">
                  El Chino <span className="text-brand">Americano</span>
                </p>
                <p className="text-white/40 text-xs">Admin Panel</p>
              </div>
            </div>
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
