import { getProductStats } from '@/lib/db/products'
import { getCategories } from '@/lib/db/categories'
import { Package, PackageX, AlertTriangle, Tag, Boxes, Car, Wrench, Plus } from 'lucide-react'
import Link from 'next/link'

async function getStats() {
  const [ps, cats] = await Promise.all([getProductStats(), getCategories()])
  return { ...ps, categories: cats.length }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const kpis = [
    { label: 'Productos activos', value: stats.total,      icon: Package,       bg: 'bg-[#0d1f3c]' },
    { label: 'Sin stock',         value: stats.outOfStock,  icon: PackageX,      bg: 'bg-[#e03030]' },
    { label: 'Stock bajo (≤5)',   value: stats.lowStock,    icon: AlertTriangle, bg: 'bg-amber-500' },
    { label: 'Categorías',        value: stats.categories,  icon: Tag,           bg: 'bg-slate-600' },
  ]

  const quickLinks = [
    { href: '/admin/products/new',   label: 'Nuevo producto',   icon: Package,  desc: 'Agregar al catálogo' },
    { href: '/admin/inventory',      label: 'Ver inventario',   icon: Boxes,    desc: 'Ajustar stock' },
    { href: '/admin/vehicle-brands', label: 'Marcas vehículos', icon: Car,      desc: 'Gestionar marcas' },
    { href: '/admin/part-brands',    label: 'Marcas repuestos', icon: Wrench,   desc: 'Proveedores de piezas' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0d1f3c]">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Resumen general del sistema</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map(({ label, value, icon: Icon, bg }) => (
          <div key={label} className={`${bg} text-white rounded-xl p-5 flex flex-col gap-3`}>
            <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center">
              <Icon size={16} />
            </div>
            <div>
              <p className="text-3xl font-bold leading-none">{value}</p>
              <p className="text-sm opacity-70 mt-1.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Accesos rápidos</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickLinks.map(({ href, label, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col gap-2 p-4 bg-gray-50 hover:bg-[#0d1f3c] rounded-xl transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 bg-white group-hover:bg-white/15 rounded-lg flex items-center justify-center transition-colors shadow-sm">
                <Icon size={15} className="text-[#0d1f3c] group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 group-hover:text-white transition-colors leading-tight">{label}</p>
                <p className="text-xs text-gray-400 group-hover:text-white/60 transition-colors mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* New product CTA */}
      <div className="mt-4 flex justify-end">
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#e03030] text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus size={15} />
          Nuevo producto
        </Link>
      </div>
    </div>
  )
}
