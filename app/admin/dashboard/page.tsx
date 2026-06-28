import { getProductStats } from '@/lib/db/products'
import { getCategories } from '@/lib/db/categories'
import { Package, PackageX, AlertTriangle, Tag, Boxes, Car, Wrench } from 'lucide-react'
import Link from 'next/link'

async function getStats() {
  const [ps, cats] = await Promise.all([getProductStats(), getCategories()])
  return { ...ps, categories: cats.length }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const kpis = [
    { label: 'Productos activos', value: stats.total,      icon: Package,       iconBg: 'bg-navy/10',     iconColor: 'text-navy'     },
    { label: 'Sin stock',         value: stats.outOfStock, icon: PackageX,      iconBg: 'bg-brand/10',    iconColor: 'text-brand'    },
    { label: 'Stock bajo (≤5)',   value: stats.lowStock,   icon: AlertTriangle, iconBg: 'bg-amber-100',   iconColor: 'text-amber-600'},
    { label: 'Categorías',        value: stats.categories, icon: Tag,           iconBg: 'bg-slate-100',   iconColor: 'text-slate-600'},
  ]

  const quickLinks = [
    { href: '/admin/products/new',    label: 'Nuevo producto',    icon: Package, desc: 'Agregar al catálogo'   },
    { href: '/admin/inventory',       label: 'Ver inventario',    icon: Boxes,   desc: 'Ajustar stock'         },
    { href: '/admin/vehicle-brands',  label: 'Marcas vehículos',  icon: Car,     desc: 'Gestionar marcas'      },
    { href: '/admin/part-brands',     label: 'Marcas repuestos',  icon: Wrench,  desc: 'Proveedores de piezas' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-navy">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-0.5">Resumen general del sistema</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col gap-4">
            <div className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}>
              <Icon size={17} className={iconColor} />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy leading-none">{value}</p>
              <p className="text-xs text-slate-400 mt-1.5 leading-snug">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Accesos rápidos</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickLinks.map(({ href, label, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col gap-3 p-4 rounded-xl border border-slate-100 hover:border-brand/30 hover:bg-brand/3 transition-colors duration-150"
            >
              <div className="w-8 h-8 bg-slate-100 group-hover:bg-brand group-hover:text-white rounded-lg flex items-center justify-center transition-colors duration-150 shrink-0">
                <Icon size={15} className="text-slate-500 group-hover:text-white transition-colors duration-150" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 leading-tight">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
