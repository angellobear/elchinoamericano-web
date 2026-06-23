import { getInventory } from '@/lib/db/products'
import InventoryTable from './InventoryTable'

export default async function InventoryPage() {
  const products = await getInventory()
  const alerts = products.filter(p => p.stock <= (p.minStockAlert ?? 5))

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#0d1f3c] mb-2">Inventario</h1>
      {alerts.length > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
          ⚠️ {alerts.length} producto{alerts.length > 1 ? 's' : ''} con stock bajo o agotado
        </div>
      )}
      <InventoryTable products={products} />
    </div>
  )
}
