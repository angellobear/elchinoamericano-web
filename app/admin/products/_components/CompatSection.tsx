'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { SearchSelect } from '@/components/ui/search-select'

interface VehicleModel { id: number; name: string }
interface VehicleBrand { id: number; name: string; models: VehicleModel[] }

interface CompatEntry {
  vehicleModelId: number
  yearStart?: number | null
  yearEnd?: number | null
}

interface Props {
  initialCompat?: CompatEntry[]
}

interface Row {
  brandId: string
  modelId: string
  yearStart: string
  yearEnd: string
}

export function CompatSection({ initialCompat = [] }: Props) {
  const [brands, setBrands] = useState<VehicleBrand[]>([])
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<Row[]>([])

  useEffect(() => {
    fetch('/api/admin/vehicle-brands')
      .then(r => r.json())
      .then((data: VehicleBrand[]) => {
        setBrands(data)
        setRows(initialCompat.map(c => {
          const brand = data.find(b => b.models.some(m => m.id === c.vehicleModelId))
          return {
            brandId: String(brand?.id ?? ''),
            modelId: String(c.vehicleModelId),
            yearStart: c.yearStart ? String(c.yearStart) : '',
            yearEnd: c.yearEnd ? String(c.yearEnd) : '',
          }
        }))
      })
      .finally(() => setLoading(false))
  // ponytail: initialCompat is stable (server-rendered prop)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function addRow() {
    setRows(r => [...r, { brandId: '', modelId: '', yearStart: '', yearEnd: '' }])
  }

  function removeRow(i: number) {
    setRows(r => r.filter((_, idx) => idx !== i))
  }

  function updateBrand(i: number, value: string) {
    if (value) {
      fetch('/api/admin/vehicle-brands')
        .then(r => r.json())
        .then(setBrands)
    }
    setRows(r => r.map((row, idx) =>
      idx === i ? { ...row, brandId: value, modelId: '' } : row
    ))
  }

  function updateModel(i: number, value: string) {
    setRows(r => r.map((row, idx) =>
      idx === i ? { ...row, modelId: value } : row
    ))
  }

  function updateYear(i: number, key: 'yearStart' | 'yearEnd', value: string) {
    setRows(r => r.map((row, idx) =>
      idx === i ? { ...row, [key]: value } : row
    ))
  }

  if (loading) {
    return <p className="text-sm text-gray-400 italic">Cargando marcas y modelos...</p>
  }

  const brandOptions = brands.map(b => ({ value: String(b.id), label: b.name }))

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
        const modelOptions = (brand?.models ?? []).map(m => ({ value: String(m.id), label: m.name }))

        return (
          <div key={i} className="grid grid-cols-[1fr_1fr_80px_80px_32px] gap-2 items-center">
            <SearchSelect
              value={row.brandId}
              onChange={v => updateBrand(i, v)}
              options={brandOptions}
              placeholder="Marca..."
              searchPlaceholder="Buscar marca..."
            />

            <input type="hidden" name={`compat[${i}][modelId]`} value={row.modelId} />
            <SearchSelect
              value={row.modelId}
              onChange={v => updateModel(i, v)}
              options={modelOptions}
              placeholder="Modelo..."
              searchPlaceholder="Buscar modelo..."
              disabled={!row.brandId}
            />

            <input
              type="number"
              name={`compat[${i}][yearStart]`}
              value={row.yearStart}
              onChange={e => updateYear(i, 'yearStart', e.target.value)}
              placeholder="2018"
              min={1990}
              max={2030}
              className="h-9 border border-gray-200 rounded-lg px-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
            />

            <input
              type="number"
              name={`compat[${i}][yearEnd]`}
              value={row.yearEnd}
              onChange={e => updateYear(i, 'yearEnd', e.target.value)}
              placeholder="2024"
              min={1990}
              max={2030}
              className="h-9 border border-gray-200 rounded-lg px-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
            />

            <button
              type="button"
              onClick={() => removeRow(i)}
              className="flex items-center justify-center h-9 w-9 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
        className="inline-flex items-center gap-1.5 text-sm text-navy hover:text-brand transition-colors"
      >
        <Plus size={14} />
        Agregar compatibilidad
      </button>
    </div>
  )
}
