'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface VehicleModel { id: number; name: string }
interface VehicleBrand { id: number; name: string; models: VehicleModel[] }

interface CompatEntry {
  vehicleModelId: number
  yearStart?: number | null
  yearEnd?: number | null
}

interface Props {
  brands: VehicleBrand[]
  initialCompat?: CompatEntry[]
}

interface Row {
  brandId: string
  modelId: string
  yearStart: string
  yearEnd: string
}

export function CompatSection({ brands, initialCompat = [] }: Props) {
  const [rows, setRows] = useState<Row[]>(() =>
    initialCompat.map(c => {
      const brand = brands.find(b => b.models.some(m => m.id === c.vehicleModelId))
      return {
        brandId:   String(brand?.id ?? ''),
        modelId:   String(c.vehicleModelId),
        yearStart: c.yearStart ? String(c.yearStart) : '',
        yearEnd:   c.yearEnd   ? String(c.yearEnd)   : '',
      }
    })
  )

  function addRow() {
    setRows(r => [...r, { brandId: '', modelId: '', yearStart: '', yearEnd: '' }])
  }

  function removeRow(i: number) {
    setRows(r => r.filter((_, idx) => idx !== i))
  }

  function update(i: number, key: keyof Row, value: string) {
    setRows(r => r.map((row, idx) => {
      if (idx !== i) return row
      const updated = { ...row, [key]: value }
      if (key === 'brandId') updated.modelId = '' // reset model on brand change
      return updated
    }))
  }

  return (
    <div className="space-y-2">
      {rows.length > 0 && (
        <div className="grid grid-cols-[1fr_1fr_80px_80px_32px] gap-2 mb-1">
          <span className="text-xs font-medium text-gray-500 px-1">Marca</span>
          <span className="text-xs font-medium text-gray-500 px-1">Modelo</span>
          <span className="text-xs font-medium text-gray-500 px-1 text-center">Desde</span>
          <span className="text-xs font-medium text-gray-500 px-1 text-center">Hasta</span>
          <span />
        </div>
      )}

      {rows.map((row, i) => {
        const brand = brands.find(b => String(b.id) === row.brandId)
        const models = brand?.models ?? []

        return (
          <div key={i} className="grid grid-cols-[1fr_1fr_80px_80px_32px] gap-2 items-center">
            {/* brand select — visual only, no name attr */}
            <select
              value={row.brandId}
              onChange={e => update(i, 'brandId', e.target.value)}
              className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] bg-white"
            >
              <option value="">Marca...</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>

            {/* modelId — this goes to server */}
            <select
              name={`compat[${i}][modelId]`}
              value={row.modelId}
              onChange={e => update(i, 'modelId', e.target.value)}
              disabled={!row.brandId}
              className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] bg-white disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">Modelo...</option>
              {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>

            <input
              type="number"
              name={`compat[${i}][yearStart]`}
              value={row.yearStart}
              onChange={e => update(i, 'yearStart', e.target.value)}
              placeholder="2018"
              min={1990}
              max={2030}
              className="border border-gray-200 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]"
            />

            <input
              type="number"
              name={`compat[${i}][yearEnd]`}
              value={row.yearEnd}
              onChange={e => update(i, 'yearEnd', e.target.value)}
              placeholder="2024"
              min={1990}
              max={2030}
              className="border border-gray-200 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]"
            />

            <button
              type="button"
              onClick={() => removeRow(i)}
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )
      })}

      {rows.length === 0 && (
        <p className="text-sm text-gray-400 italic">Sin compatibilidades — agrega una con el botón.</p>
      )}

      <button
        type="button"
        onClick={addRow}
        className="inline-flex items-center gap-1.5 text-sm text-[#0d1f3c] hover:text-[#e03030] transition-colors"
      >
        <Plus size={14} />
        Agregar compatibilidad
      </button>
    </div>
  )
}
