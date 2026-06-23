'use client'

import { useState } from 'react'

interface Model { id: number; name: string; displacement?: string; fuel_type?: string; year_start?: number; year_end?: number | null; is_active: boolean }
interface Brand { id: number; name: string; origin: string; is_active: boolean; models?: Model[] }

export default function VehicleBrandEditor({ brand }: { brand: Brand }) {
  const [models, setModels] = useState<Model[]>(brand.models ?? [])
  const [form, setForm] = useState({ name: '', displacement: '', fuel_type: 'gasoline', year_start: '', year_end: '' })
  const [adding, setAdding] = useState(false)

  async function addModel() {
    setAdding(true)
    const res = await fetch(`/api/admin/vehicle-brands/${brand.id}/models`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        displacement: form.displacement || null,
        fuel_type: form.fuel_type || null,
        year_start: form.year_start ? Number(form.year_start) : null,
        year_end: form.year_end ? Number(form.year_end) : null,
      }),
    })
    if (res.ok) {
      const { model } = await res.json()
      setModels(m => [...m, { ...model, is_active: true }])
      setForm({ name: '', displacement: '', fuel_type: 'gasoline', year_start: '', year_end: '' })
    }
    setAdding(false)
  }

  async function removeModel(id: number) {
    await fetch(`/api/admin/vehicle-brands/${brand.id}/models/${id}`, { method: 'DELETE' })
    setModels(m => m.filter(x => x.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Existing models */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 font-medium text-gray-700 text-sm">
          Modelos ({models.filter(m => m.is_active).length})
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Modelo</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Cilindraje</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Combustible</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Años</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {models.filter(m => m.is_active).map(m => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{m.name}</td>
                <td className="px-4 py-2 text-gray-500">{m.displacement ?? '—'}</td>
                <td className="px-4 py-2 text-gray-500">{m.fuel_type ?? '—'}</td>
                <td className="px-4 py-2 text-gray-500">
                  {m.year_start}{m.year_end ? `–${m.year_end}` : m.year_start ? '–actual' : ''}
                </td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => removeModel(m.id)} className="text-xs text-red-500 hover:text-red-700">Eliminar</button>
                </td>
              </tr>
            ))}
            {models.filter(m => m.is_active).length === 0 && (
              <tr><td colSpan={5} className="text-center text-gray-400 py-6 text-sm">Sin modelos registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add model form */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-medium text-gray-700 text-sm mb-4">Agregar modelo</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Nombre del modelo *</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Wingle 5"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Cilindraje</label>
            <input
              value={form.displacement}
              onChange={e => setForm(f => ({ ...f, displacement: e.target.value }))}
              placeholder="2.2, 1.5T"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Combustible</label>
            <select
              value={form.fuel_type}
              onChange={e => setForm(f => ({ ...f, fuel_type: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]"
            >
              <option value="gasoline">Gasolina</option>
              <option value="diesel">Diésel</option>
              <option value="hybrid">Híbrido</option>
              <option value="electric">Eléctrico</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Año inicio</label>
              <input
                type="number"
                value={form.year_start}
                onChange={e => setForm(f => ({ ...f, year_start: e.target.value }))}
                placeholder="2018"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Año fin</label>
              <input
                type="number"
                value={form.year_end}
                onChange={e => setForm(f => ({ ...f, year_end: e.target.value }))}
                placeholder="actual"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]"
              />
            </div>
          </div>
        </div>
        <button
          onClick={addModel}
          disabled={!form.name.trim() || adding}
          className="mt-4 px-4 py-2 bg-[#0d1f3c] text-white text-sm rounded-lg disabled:opacity-40 hover:bg-[#0a1628] transition-colors"
        >
          {adding ? 'Guardando...' : '+ Agregar modelo'}
        </button>
      </div>
    </div>
  )
}
