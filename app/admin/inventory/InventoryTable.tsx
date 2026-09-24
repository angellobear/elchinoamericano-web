'use client'

import { useState } from 'react'
import { AlertTriangle, ArrowRightLeft, Search } from 'lucide-react'
import { StockModal } from './StockModal'

interface InventoryProduct {
  id: number
  code: string | null
  title: string
  sku: string | null
  replacementCode: string | null
  stock: number
  minStockAlert: number | null
  category: { name: string } | null
}

export default function InventoryTable({ products }: { products: InventoryProduct[] }) {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [rows, setRows] = useState(products)
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const visibleRows = q
    ? rows.filter((p) =>
        [p.code, p.title, p.sku, p.replacementCode, p.category?.name].some((v) => v?.toLowerCase().includes(q)),
      )
    : rows

  function handleMovementSuccess(productId: number, newStock: number) {
    setRows((currentRows) =>
      currentRows.map((row) => (row.id === productId ? { ...row, stock: newStock } : row)),
    )
    setSelectedProductId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por código, nombre, SKU o categoría..."
            aria-label="Buscar en inventario"
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
          />
        </div>
        <StockModal
          products={rows}
          selectedProductId={selectedProductId}
          onOpenChange={(open) => {
            if (!open) setSelectedProductId(null)
          }}
          onSelectProduct={setSelectedProductId}
          onSuccess={handleMovementSuccess}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Código</th>
              <th className="text-left px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Producto</th>
              <th className="text-left px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Categoría</th>
              <th className="text-center px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Stock actual</th>
              <th className="text-right px-4 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {visibleRows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-gray-400">
                  Ningún producto coincide con &quot;{query}&quot;
                </td>
              </tr>
            )}
            {visibleRows.map((product) => {
              const threshold = product.minStockAlert ?? 5
              const isLow = product.stock <= threshold

              return (
                <tr
                  key={product.id}
                  className={`transition-colors ${isLow ? 'bg-amber-50/50 hover:bg-amber-50' : 'hover:bg-gray-50/70'}`}
                >
                  <td className="px-4 py-3.5 font-mono text-xs text-gray-400">{product.code ?? '—'}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      {isLow ? <AlertTriangle size={12} className="text-amber-500 shrink-0" /> : null}
                      <div>
                        <p className="font-medium text-gray-800">{product.title}</p>
                        {isLow ? (
                          <p className="text-xs text-amber-700">
                            Minimo sugerido: {threshold}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-500">{product.category?.name ?? '—'}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`inline-flex min-w-16 justify-center rounded-full px-3 py-1 text-sm font-semibold ${
                        isLow ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedProductId(product.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:border-navy hover:text-navy"
                    >
                      <ArrowRightLeft size={13} />
                      Registrar movimiento
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
