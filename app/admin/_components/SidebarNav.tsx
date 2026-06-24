'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, Boxes, Tag,
  Car, Wrench, Truck, Users, LogOut,
} from 'lucide-react'

const NAV = [
  { href: '/admin/dashboard',      label: 'Dashboard',        icon: LayoutDashboard },
  { href: '/admin/products',       label: 'Productos',        icon: Package },
  { href: '/admin/inventory',      label: 'Inventario',       icon: Boxes },
  { href: '/admin/categories',     label: 'Categorías',       icon: Tag },
  { href: '/admin/vehicle-brands', label: 'Marcas Vehículos', icon: Car },
  { href: '/admin/part-brands',    label: 'Marcas Repuestos', icon: Wrench },
  { href: '/admin/suppliers',      label: 'Proveedores',      icon: Truck },
  { href: '/admin/users',          label: 'Usuarios',         icon: Users },
]

interface Props {
  isSuperAdmin: boolean
  email: string
  role: string
}

export function SidebarNav({ isSuperAdmin, email, role }: Props) {
  const pathname = usePathname()
  const visible = NAV.filter(i => i.href !== '/admin/users' || isSuperAdmin)

  return (
    <>
      <nav className="flex-1 p-3 space-y-0.5">
        {visible.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                active
                  ? 'bg-white/15 text-white font-medium border-l-2 border-brand'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon
                size={16}
                className={active ? 'text-brand shrink-0' : 'shrink-0 opacity-60'}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <div className="px-3 mb-2">
          <p className="text-white/60 text-xs truncate">{email}</p>
          <p className="text-white/30 text-xs capitalize">{role}</p>
        </div>
        <a
          href="/api/auth/logout"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <LogOut size={14} className="shrink-0" />
          Cerrar sesión
        </a>
      </div>
    </>
  )
}
