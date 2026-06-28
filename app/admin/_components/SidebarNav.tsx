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
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {visible.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ${
                active
                  ? 'bg-white/12 text-white font-medium'
                  : 'text-white/55 hover:text-white hover:bg-white/8'
              }`}
            >
              <span className={`flex items-center justify-center w-7 h-7 rounded-md shrink-0 transition-colors ${
                active ? 'bg-brand text-white' : 'text-white/40'
              }`}>
                <Icon size={15} />
              </span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User card */}
      <div className="p-3 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/6 mb-1">
          <div className="w-7 h-7 rounded-md bg-brand/80 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold leading-none">
              {email.slice(0, 1).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-medium truncate">{email}</p>
            <p className="text-white/35 text-xs capitalize">{role}</p>
          </div>
        </div>
        <a
          href="/api/auth/logout"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/45 hover:text-white hover:bg-white/8 transition-colors duration-150"
        >
          <LogOut size={14} className="shrink-0" />
          Cerrar sesión
        </a>
      </div>
    </>
  )
}
