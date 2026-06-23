import { getInventory } from '@/lib/db/products'
import InventoryTable from './InventoryTable'
import { Boxes, AlertTriangle } from 'lucide-react'

export default async function InventoryPage() {
  const products = await getInventory()
  const alerts = products.filter(p => p.stock <= (p.minStockAlert ?? 5))

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0d1f3c]">Inventario</h1>
        <p className="text-gray-500 text-sm mt-0.5">{products.length} productos en inventario</p>
      </div>

      {alerts.length > 0 && (
        <div className="mb-5 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle size={16} className="text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800 font-medium">
            {alerts.length} producto{alerts.length > 1 ? 's' : ''} con stock bajo o agotado
          </p>
        </div>
      )}

      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
          <Boxes size={36} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400">No hay productos en el inventario</p>
        </div>
      ) : (
        <InventoryTable products={products} />
      )}
    </div>
  )
}
