'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { SubmitButton } from '@/app/admin/_components/SubmitButton'
import { formatMoney, orderSummary, toCents } from '@/lib/orders'
import { parseOrderFormData } from '@/modules/admin/orders/form-schema'
import { searchOrderProductsAction } from '@/modules/admin/orders/server/actions'
import type { OrderProductOption } from '@/modules/admin/orders/types'
import { FieldLabel, FormActions, TextArea, TextInput } from '@/modules/admin/shared/components/AdminFormControls'
import { ValidatedForm } from '@/modules/admin/shared/components/ValidatedForm'
import { getZodErrorMessage } from '@/modules/admin/shared/server/zod'
import type { ActionFormHandler } from '@/modules/admin/shared/types/action-result'

export interface OrderFormDefaults {
  customerName?: string
  customerIdNumber?: string
  customerPhone?: string
  discount?: string
  notes?: string
  estimatedDate?: string
  items?: { productId: number | null; description: string; quantity: number; unitPrice: string }[]
}

interface ItemRow {
  key: string
  productId: number | null
  description: string
  quantity: string
  unitPrice: string
}

interface OrderFormProps {
  action: ActionFormHandler
  mode: 'create' | 'edit'
  cancelHref: string
  defaults?: OrderFormDefaults
}

const cellInput =
  'w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-navy/25 focus:border-navy'

function newRow(partial?: Partial<ItemRow>): ItemRow {
  return { key: crypto.randomUUID(), productId: null, description: '', quantity: '1', unitPrice: '', ...partial }
}

// Un valor vacío o no numérico cuenta como 0 para el total en pantalla; el servidor lo valida de verdad.
function cents(value: string) {
  const amount = toCents(value)
  return Number.isFinite(amount) ? amount : 0
}

export function OrderForm({ action, mode, cancelHref, defaults }: OrderFormProps) {
  const [items, setItems] = useState<ItemRow[]>(() =>
    defaults?.items?.length
      ? defaults.items.map((item) =>
          newRow({
            productId: item.productId,
            description: item.description,
            quantity: String(item.quantity),
            unitPrice: item.unitPrice,
          }),
        )
      : [newRow()],
  )
  const [discount, setDiscount] = useState(defaults?.discount ?? '0')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<OrderProductOption[]>([])
  const [searching, startSearch] = useTransition()

  const payload = items.map((item) => ({
    productId: item.productId,
    description: item.description,
    quantity: Number(item.quantity),
    unitPrice: item.unitPrice.trim() === '' ? '' : (cents(item.unitPrice) / 100).toFixed(2),
  }))

  const summary = orderSummary({
    discount: cents(discount) / 100,
    items: items.map((item) => ({ quantity: Number(item.quantity) || 0, unitPrice: cents(item.unitPrice) / 100 })),
    payments: [],
  })

  function update(key: string, patch: Partial<ItemRow>) {
    setItems((rows) => rows.map((row) => (row.key === key ? { ...row, ...patch } : row)))
  }

  function search(value: string) {
    setQuery(value)
    if (value.trim().length < 2) {
      setResults([])
      return
    }
    // ponytail: sin debounce ni cancelación; a 8 resultados por consulta no hace falta.
    startSearch(async () => setResults(await searchOrderProductsAction(value)))
  }

  function addProduct(product: OrderProductOption) {
    const row = newRow({
      productId: product.id,
      description: product.code ? `${product.code} — ${product.title}` : product.title,
      unitPrice: product.price,
    })
    // Si solo está la fila vacía inicial, se reemplaza en vez de dejarla colgando.
    setItems((rows) => (rows.length === 1 && !rows[0].description && !rows[0].unitPrice ? [row] : [...rows, row]))
    setQuery('')
    setResults([])
  }

  return (
    <ValidatedForm
      action={action}
      className="space-y-6"
      validate={(formData) => {
        const parsed = parseOrderFormData(formData)
        return parsed.success ? null : getZodErrorMessage(parsed.error)
      }}
    >
      <input type="hidden" name="items" value={JSON.stringify(payload)} />

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-navy">Cliente</h2>
          <p className="text-xs text-slate-400">
            Opcional. Si lo dejas vacío, el documento dice &quot;Consumidor final&quot;.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <FieldLabel>Nombre</FieldLabel>
            <TextInput name="customerName" maxLength={150} defaultValue={defaults?.customerName ?? ''} />
          </div>
          <div>
            <FieldLabel>Cédula / RUC</FieldLabel>
            <TextInput name="customerIdNumber" maxLength={20} defaultValue={defaults?.customerIdNumber ?? ''} />
          </div>
          <div>
            <FieldLabel>Teléfono</FieldLabel>
            <TextInput name="customerPhone" maxLength={30} defaultValue={defaults?.customerPhone ?? ''} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-navy">Ítems</h2>

        <div className="relative">
          <FieldLabel>Buscar en el catálogo (opcional)</FieldLabel>
          <TextInput
            value={query}
            onChange={(event) => search(event.target.value)}
            // Enter aquí no debe enviar el pedido a medio llenar.
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.preventDefault()
            }}
            placeholder="Título, SKU o número de parte"
          />
          {query.trim().length >= 2 ? (
            <ul className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-sm divide-y divide-slate-100">
              {results.map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => addProduct(product)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center justify-between gap-3"
                  >
                    <span className="truncate">
                      <span className="font-mono text-xs text-slate-400 mr-2">{product.code}</span>
                      {product.title}
                    </span>
                    <span className="shrink-0 text-xs text-slate-500">
                      ${product.price} · stock {product.stock}
                    </span>
                  </button>
                </li>
              ))}
              {results.length === 0 ? (
                <li className="px-3 py-2 text-sm text-slate-400">{searching ? 'Buscando…' : 'Sin resultados'}</li>
              ) : null}
            </ul>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-400">
                <th className="text-left font-semibold pb-2">Descripción</th>
                <th className="text-left font-semibold pb-2 w-24">Cantidad</th>
                <th className="text-left font-semibold pb-2 w-32">Valor unitario</th>
                <th className="text-right font-semibold pb-2 w-28">Importe</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.key}>
                  <td className="py-1 pr-2">
                    <input
                      aria-label="Descripción"
                      className={cellInput}
                      value={item.description}
                      maxLength={255}
                      onChange={(event) => update(item.key, { description: event.target.value })}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <input
                      aria-label="Cantidad"
                      className={cellInput}
                      type="number"
                      min={1}
                      step={1}
                      value={item.quantity}
                      onChange={(event) => update(item.key, { quantity: event.target.value })}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <input
                      aria-label="Valor unitario"
                      className={cellInput}
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(event) => update(item.key, { unitPrice: event.target.value })}
                    />
                  </td>
                  <td className="py-1 text-right tabular-nums">
                    {formatMoney((Number(item.quantity) || 0) * cents(item.unitPrice))}
                  </td>
                  <td className="py-1 text-right">
                    <button
                      type="button"
                      aria-label="Quitar ítem"
                      disabled={items.length === 1}
                      onClick={() => setItems((rows) => rows.filter((row) => row.key !== item.key))}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-30"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={() => setItems((rows) => [...rows, newRow()])}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:underline"
        >
          <Plus size={14} />
          Agregar ítem libre
        </button>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <FieldLabel>Fecha estimada de entrega</FieldLabel>
            <TextInput type="date" name="estimatedDate" defaultValue={defaults?.estimatedDate ?? ''} />
          </div>
          <div>
            <FieldLabel>Condiciones u observaciones</FieldLabel>
            <TextArea
              name="notes"
              rows={3}
              maxLength={1000}
              defaultValue={defaults?.notes ?? ''}
              placeholder="ej: El precio se respeta hasta la fecha estimada."
            />
            <p className="text-xs text-slate-400 mt-1">Este texto sale impreso en los documentos.</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Subtotal</span>
            <span className="tabular-nums">{formatMoney(summary.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="discount" className="text-slate-500">
              Descuento ($)
            </label>
            <input
              id="discount"
              name="discount"
              type="number"
              min={0}
              step="0.01"
              value={discount}
              onChange={(event) => setDiscount(event.target.value)}
              className={`${cellInput} w-32 text-right`}
            />
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-navy">
            <span>Total</span>
            <span className="tabular-nums">{formatMoney(summary.total)}</span>
          </div>
        </div>
      </section>

      <FormActions>
        <SubmitButton className="px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-dark active:scale-[0.98] transition-all disabled:opacity-60">
          {mode === 'create' ? 'Crear pedido' : 'Guardar cambios'}
        </SubmitButton>
        <Link
          href={cancelHref}
          className="px-5 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </Link>
      </FormActions>
    </ValidatedForm>
  )
}
