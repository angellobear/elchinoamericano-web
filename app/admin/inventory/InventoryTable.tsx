'use client'

import { useState } from 'react'

interface InventoryProduct {
  id: number
  code: string | null
  title: string
  stock: number
  minStockAlert: number | null
  category: { name: string } | null
}

export default function InventoryTable({ products }: { products: InventoryProduct[] }) {
  const [stockMap, setStockMap] = useState<Record<number, number>>(() =>
    Object.fromEntries(products.map(p => [p.id, p.stock]))
  )
  const [saving, setSaving] = useState<Record<number, boolean>>({})

  async function save(id: number) {
    setSaving(s => ({ ...s, [id]: true }))
    await fetch(`/api/admin/inventory/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: stockMap[id] }),
    })
    setSaving(s => ({ ...s, [id]: false }))
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Código</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Producto</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Categoría</th>
            <th className="text-center px-4 py-3 font-medium text-gray-600">Stock</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map(p => {
            const current = stockMap[p.id] ?? p.stock
            const isLow = current <= (p.minStockAlert ?? 5)
            const changed = current !== p.stock
            return (
              <tr key={p.id} className={`hover:bg-gray-50 ${isLow ? 'bg-red-50' : ''}`}>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.code}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{p.title}</td>
                <td className="px-4 py-3 text-gray-500">{p.category?.name ?? '—'}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={current}
                      onChange={e => setStockMap(m => ({ ...m, [p.id]: Number(e.target.value) }))}
                      className={`w-20 text-center border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] ${
                        isLow ? 'border-red-300 text-[#e03030] font-medium' : 'border-gray-300'
                      }`}
                    />
                    {isLow && <span className="text-[#e03030] text-xs">⚠</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => save(p.id)}
                    disabled={!changed || saving[p.id]}
                    className="px-3 py-1.5 bg-[#0d1f3c] text-white text-xs rounded-lg disabled:opacity-40 hover:bg-[#0a1628] transition-colors"
                  >
                    {saving[p.id] ? '...' : 'Guardar'}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
