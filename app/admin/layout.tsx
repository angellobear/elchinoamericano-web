import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getJwtPayload } from '@/lib/auth/check-permission'

const NAV = [
  { href: '/admin/dashboard',      label: 'Dashboard' },
  { href: '/admin/products',       label: 'Productos' },
  { href: '/admin/inventory',      label: 'Inventario' },
  { href: '/admin/categories',     label: 'Categorías' },
  { href: '/admin/vehicle-brands', label: 'Marcas de Vehículos' },
  { href: '/admin/part-brands',    label: 'Marcas de Repuestos' },
  { href: '/admin/suppliers',      label: 'Proveedores' },
  { href: '/admin/users',          label: 'Usuarios' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const payload = await getJwtPayload()
  if (!payload) redirect('/login')

  const isSuperAdmin = payload.role === 'superadmin'

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-[#0d1f3c] text-white flex flex-col">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#e03030] rounded flex items-center justify-center text-xs font-bold">CA</div>
            <span className="text-sm font-semibold leading-tight">
              El Chino<br />
              <span className="text-[#e03030]">Americano</span>
            </span>
          </div>
          <p className="text-white/40 text-xs mt-2">Admin Panel</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.filter(item => item.href !== '/admin/users' || isSuperAdmin).map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <p className="text-white/40 text-xs px-3 mb-1 truncate">{payload.email}</p>
          <a
            href="/api/auth/logout"
            className="block px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            Cerrar sesión
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
