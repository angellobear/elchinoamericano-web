'use client'

import { useState } from 'react'
import { Save, AlertTriangle } from 'lucide-react'

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
  const [saved, setSaved] = useState<Record<number, boolean>>({})

  async function save(id: number) {
    setSaving(s => ({ ...s, [id]: true }))
    await fetch(`/api/admin/inventory/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: stockMap[id] }),
    })
    setSaving(s => ({ ...s, [id]: false }))
    setSaved(s => ({ ...s, [id]: true }))
    setTimeout(() => setSaved(s => ({ ...s, [id]: false })), 2000)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Código</th>
            <th className="text-left px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Producto</th>
            <th className="text-left px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Categoría</th>
            <th className="text-center px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Stock</th>
            <th className="px-4 py-3.5 w-28"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {products.map(p => {
            const current = stockMap[p.id] ?? p.stock
            const isLow   = current <= (p.minStockAlert ?? 5)
            const changed = current !== p.stock

            return (
              <tr key={p.id} className={`transition-colors ${isLow ? 'bg-amber-50/50 hover:bg-amber-50' : 'hover:bg-gray-50/70'}`}>
                <td className="px-4 py-3.5 font-mono text-xs text-gray-400">{p.code}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    {isLow && <AlertTriangle size={12} className="text-amber-500 shrink-0" />}
                    <span className="font-medium text-gray-800">{p.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-gray-500">{p.category?.name ?? '—'}</td>
                <td className="px-4 py-3.5 text-center">
                  <input
                    type="number"
                    min={0}
                    value={current}
                    onChange={e => setStockMap(m => ({ ...m, [p.id]: Number(e.target.value) }))}
                    className={`w-20 text-center border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] transition-colors ${
                      isLow
                        ? 'border-amber-300 text-amber-700 bg-amber-50'
                        : 'border-gray-200 text-gray-800'
                    }`}
                  />
                </td>
                <td className="px-4 py-3.5 text-right">
                  <button
                    onClick={() => save(p.id)}
                    disabled={!changed || saving[p.id]}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      saved[p.id]
                        ? 'bg-emerald-100 text-emerald-700'
                        : changed && !saving[p.id]
                          ? 'bg-[#0d1f3c] text-white hover:bg-[#0a1628] cursor-pointer'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Save size={11} />
                    {saving[p.id] ? 'Guardando…' : saved[p.id] ? 'Guardado' : 'Guardar'}
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
