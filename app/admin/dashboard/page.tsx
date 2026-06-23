import { getProductStats } from '@/lib/db/products'
import { getCategories } from '@/lib/db/categories'

async function getStats() {
  const [ps, cats] = await Promise.all([getProductStats(), getCategories()])
  return { ...ps, categories: cats.length }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const cards = [
    { label: 'Productos activos', value: stats.total,      color: 'bg-[#0d1f3c] text-white' },
    { label: 'Sin stock',         value: stats.outOfStock,  color: 'bg-[#e03030] text-white' },
    { label: 'Stock bajo (≤5)',   value: stats.lowStock,    color: 'bg-amber-500 text-white' },
    { label: 'Categorías',        value: stats.categories,  color: 'bg-gray-700 text-white' },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#0d1f3c] mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className={`${c.color} rounded-xl p-5`}>
            <p className="text-3xl font-bold">{c.value}</p>
            <p className="text-sm opacity-80 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-2">Accesos rápidos</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/admin/products/new', label: '+ Nuevo producto' },
            { href: '/admin/inventory',    label: 'Ver inventario' },
            { href: '/admin/vehicle-brands', label: 'Marcas de vehículos' },
          ].map(l => (
            <a key={l.href} href={l.href} className="px-4 py-2 bg-[#0d1f3c] text-white text-sm rounded-lg hover:bg-[#0a1628] transition-colors">
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
