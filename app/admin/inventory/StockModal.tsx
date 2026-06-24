'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { X, Plus } from 'lucide-react'

interface Product { id: number; code: string | null; title: string }

interface Props {
  products: Product[]
  onSuccess: (productId: number, newStock: number) => void
}

export function StockModal({ products, onSuccess }: Props) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    productId: '',
    quantity: '',
    movementType: 'purchase',
    reason: '',
  })
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/inventory/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId:    Number(form.productId),
          quantity:     Number(form.quantity),
          movementType: form.movementType,
          reason:       form.reason || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error')
      toast.success('Stock registrado correctamente')
      onSuccess(Number(form.productId), data.newStock)
      setForm({ productId: '', quantity: '', movementType: 'purchase', reason: '' })
      setOpen(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al registrar stock')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#e03030] text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
      >
        <Plus size={15} />
        Ingresar stock
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-[#0d1f3c]">Ingresar stock</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={submit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Producto <span className="text-[#e03030]">*</span>
                </label>
                <select
                  required
                  value={form.productId}
                  onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] bg-white"
                >
                  <option value="">Seleccionar producto...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.code ? `[${p.code}] ` : ''}{p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Cantidad <span className="text-[#e03030]">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={form.quantity}
                    onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                    placeholder={form.movementType === 'adjustment' ? '-5, +10' : '10'}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo</label>
                  <select
                    value={form.movementType}
                    onChange={e => setForm(f => ({ ...f, movementType: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] bg-white"
                  >
                    <option value="purchase">Compra</option>
                    <option value="adjustment">Ajuste</option>
                  </select>
                </div>
              </div>

              {form.movementType === 'adjustment' && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  Para ajustes usa cantidad negativa si el stock estaba de más, o positiva si faltaba.
                </p>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Razón / nota</label>
                <input
                  type="text"
                  value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="ej: compra a proveedor X"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#0d1f3c] text-white text-sm rounded-lg hover:bg-[#0a1628] transition-colors font-medium disabled:opacity-60"
                >
                  {loading ? 'Guardando…' : 'Registrar ingreso'}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
