'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface Column { key: string; label: string; placeholder?: string }

interface Props {
  name: string
  columns: Column[]
  initialRows?: Record<string, string>[]
  addLabel?: string
}

export function DynamicRows({ name, columns, initialRows = [], addLabel = 'Agregar fila' }: Props) {
  const [rows, setRows] = useState<Record<string, string>[]>(
    initialRows.length ? initialRows : []
  )

  function addRow() {
    setRows(r => [...r, Object.fromEntries(columns.map(c => [c.key, '']))])
  }

  function removeRow(i: number) {
    setRows(r => r.filter((_, idx) => idx !== i))
  }

  function update(i: number, key: string, value: string) {
    setRows(r => r.map((row, idx) => idx === i ? { ...row, [key]: value } : row))
  }

  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex gap-2 items-center">
          {columns.map(col => (
            <div key={col.key} className="flex-1">
              <input
                type="text"
                name={`${name}[${i}][${col.key}]`}
                value={row[col.key] ?? ''}
                onChange={e => update(i, col.key, e.target.value)}
                placeholder={col.placeholder ?? col.label}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => removeRow(i)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      {rows.length === 0 && (
        <p className="text-sm text-gray-400 italic">Sin entradas — agrega una con el botón.</p>
      )}
      <button
        type="button"
        onClick={addRow}
        className="inline-flex items-center gap-1.5 text-sm text-[#0d1f3c] hover:text-[#e03030] transition-colors"
      >
        <Plus size={14} />
        {addLabel}
      </button>
    </div>
  )
}
