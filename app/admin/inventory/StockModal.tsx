'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ArrowRightLeft, PackagePlus, PackageMinus, SlidersHorizontal, X } from 'lucide-react'

interface Product {
  id: number
  code: string | null
  title: string
  stock?: number
}

type MovementType = 'entry' | 'exit' | 'transfer' | 'adjustment'

interface Props {
  products: Product[]
  selectedProductId: number | null
  onOpenChange: (open: boolean) => void
  onSelectProduct: (productId: number | null) => void
  onSuccess: (productId: number, newStock: number) => void
}

const movementMeta: Record<MovementType, { label: string; icon: typeof PackagePlus; hint: string }> = {
  entry: {
    label: 'Ingreso',
    icon: PackagePlus,
    hint: 'Suma unidades al stock actual. Ideal para compras o reposiciones.',
  },
  exit: {
    label: 'Salida',
    icon: PackageMinus,
    hint: 'Resta unidades del stock por venta interna, daño o consumo.',
  },
  transfer: {
    label: 'Traslado',
    icon: ArrowRightLeft,
    hint: 'Registra una salida por traslado. Usa la nota para indicar destino.',
  },
  adjustment: {
    label: 'Ajuste',
    icon: SlidersHorizontal,
    hint: 'Corrige el stock y deja el valor final real despues del conteo.',
  },
}

export function StockModal({
  products,
  selectedProductId,
  onOpenChange,
  onSelectProduct,
  onSuccess,
}: Props) {
  const open = selectedProductId !== null
  const [form, setForm] = useState({
    productId: '',
    movementType: 'entry' as MovementType,
    quantity: '',
    finalStock: '',
    reason: '',
  })
  const [loading, setLoading] = useState(false)
  const effectiveProductId = form.productId || (selectedProductId ? String(selectedProductId) : '')

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === Number(effectiveProductId)) ?? null,
    [effectiveProductId, products],
  )

  const projectedStock = useMemo(() => {
    if (!selectedProduct || selectedProduct.stock === undefined) return null

    if (form.movementType === 'adjustment') {
      if (form.finalStock === '') return null
      return Number(form.finalStock)
    }

    if (form.quantity === '') return null

    const amount = Math.abs(Number(form.quantity))
    if (Number.isNaN(amount)) return null

    if (form.movementType === 'entry') return selectedProduct.stock + amount
    return selectedProduct.stock - amount
  }, [form.finalStock, form.movementType, form.quantity, selectedProduct])

  function closeModal() {
    onOpenChange(false)
    onSelectProduct(null)
    setForm({
      productId: '',
      movementType: 'entry',
      quantity: '',
      finalStock: '',
      reason: '',
    })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return

    const productId = Number(effectiveProductId)
    if (!productId) {
      toast.error('Selecciona un producto')
      return
    }

    setLoading(true)

    try {
      const payload =
        form.movementType === 'adjustment'
          ? {
              productId,
              movementType: form.movementType,
              finalStock: Number(form.finalStock),
              reason: form.reason || undefined,
            }
          : {
              productId,
              movementType: form.movementType,
              quantity: Math.abs(Number(form.quantity)),
              reason: form.reason || undefined,
            }

      const res = await fetch('/api/admin/inventory/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error')

      toast.success('Movimiento registrado correctamente')
      onSuccess(productId, data.newStock)
      closeModal()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al registrar movimiento')
    } finally {
      setLoading(false)
    }
  }

  const activeMeta = movementMeta[form.movementType]
  const ActiveIcon = activeMeta.icon

  return (
    <>
      <button
        type="button"
        onClick={() => onSelectProduct(products[0]?.id ?? null)}
        disabled={products.length === 0}
        className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <ArrowRightLeft size={15} />
        Nuevo movimiento
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="font-semibold text-navy">Movimiento de inventario</h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  Registra ingresos, salidas, traslados o ajustes desde un solo flujo.
                </p>
              </div>
              <button onClick={closeModal} className="rounded p-1 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-5 p-5">
              <div className="grid gap-4 md:grid-cols-[1.35fr_1fr]">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Producto <span className="text-brand">*</span>
                  </label>
                  <select
                    required
                    value={effectiveProductId}
                    onChange={(e) => setForm((current) => ({ ...current, productId: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                  >
                    <option value="">Seleccionar producto...</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.code ? `[${product.code}] ` : ''}{product.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Tipo de movimiento
                  </label>
                  <select
                    value={form.movementType}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        movementType: e.target.value as MovementType,
                        quantity: '',
                        finalStock: '',
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                  >
                    <option value="entry">Ingreso</option>
                    <option value="exit">Salida</option>
                    <option value="transfer">Traslado</option>
                    <option value="adjustment">Ajuste</option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <span className="rounded-full bg-white p-2 text-slate-700 shadow-sm">
                    <ActiveIcon size={16} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{activeMeta.label}</p>
                    <p className="mt-1 text-sm text-slate-600">{activeMeta.hint}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {form.movementType === 'adjustment' ? (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Stock final real <span className="text-brand">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={form.finalStock}
                      onChange={(e) => setForm((current) => ({ ...current, finalStock: e.target.value }))}
                      placeholder="Ej: 18"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Cantidad <span className="text-brand">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={form.quantity}
                      onChange={(e) => setForm((current) => ({ ...current, quantity: e.target.value }))}
                      placeholder="Ej: 6"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                    />
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Nota / motivo
                  </label>
                  <input
                    type="text"
                    required={form.movementType === 'transfer'}
                    value={form.reason}
                    onChange={(e) => setForm((current) => ({ ...current, reason: e.target.value }))}
                    placeholder={
                      form.movementType === 'transfer'
                        ? 'Ej: traslado a sucursal norte'
                        : form.movementType === 'exit'
                          ? 'Ej: pieza danada o uso interno'
                          : form.movementType === 'entry'
                            ? 'Ej: compra proveedor X'
                            : 'Ej: conteo fisico'
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>
              </div>

              {selectedProduct ? (
                <div className="grid gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Producto</p>
                    <p className="mt-1 text-sm font-medium text-gray-800">{selectedProduct.title}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Stock actual</p>
                    <p className="mt-1 text-sm font-semibold text-gray-800">{selectedProduct.stock ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Stock resultante</p>
                    <p className={`mt-1 text-sm font-semibold ${projectedStock !== null && projectedStock < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                      {projectedStock ?? '—'}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={loading || (projectedStock !== null && projectedStock < 0)}
                  className="flex-1 rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-dark disabled:opacity-60"
                >
                  {loading ? 'Guardando…' : 'Registrar movimiento'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
