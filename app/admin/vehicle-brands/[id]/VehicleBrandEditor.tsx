'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Pencil, Trash2, Check, X } from 'lucide-react'

interface Model {
  id: number
  name: string
  displacement?: string | null
  fuelType?: string | null
  transmission?: string | null
  bodyType?: string | null
  isActive?: boolean | null
}

interface Brand { id: number; name: string; origin: string; isActive?: boolean | null; models?: Model[] }

const emptyForm = { name: '', displacement: '', fuelType: 'gasoline', transmission: '', bodyType: '' }

export default function VehicleBrandEditor({ brand }: { brand: Brand }) {
  const [models, setModels] = useState<Model[]>(
    (brand.models ?? []).filter(m => m.isActive !== false)
  )
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState(emptyForm)

  async function addModel() {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/vehicle-brands/${brand.id}/models`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          displacement: form.displacement || null,
          fuelType: form.fuelType || null,
          transmission: form.transmission || null,
          bodyType: form.bodyType || null,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const { model } = await res.json()
      setModels(m => [...m, { ...model, isActive: true }])
      setForm(emptyForm)
      toast.success('Modelo agregado')
    } catch {
      toast.error('Error al agregar modelo')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(m: Model) {
    setEditingId(m.id)
    setEditForm({
      name: m.name,
      displacement: m.displacement ?? '',
      fuelType: m.fuelType ?? 'gasoline',
      transmission: m.transmission ?? '',
      bodyType: m.bodyType ?? '',
    })
  }

  async function saveEdit(id: number) {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/vehicle-brands/${brand.id}/models/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          displacement: editForm.displacement || null,
          fuelType: editForm.fuelType || null,
          transmission: editForm.transmission || null,
          bodyType: editForm.bodyType || null,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      setModels(m => m.map(x => x.id === id ? { ...x, ...editForm } : x))
      setEditingId(null)
      toast.success('Modelo actualizado')
    } catch {
      toast.error('Error al actualizar modelo')
    } finally {
      setSaving(false)
    }
  }

  async function removeModel(id: number) {
    try {
      const res = await fetch(`/api/admin/vehicle-brands/${brand.id}/models/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setModels(m => m.filter(x => x.id !== id))
      toast.success('Modelo eliminado')
    } catch {
      toast.error('Error al eliminar modelo')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 font-medium text-gray-700 text-sm">
          Modelos ({models.length})
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Modelo</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Cilindraje</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Combustible</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Transmisión</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Carrocería</th>
              <th className="px-4 py-2 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {models.map(m => (
              <tr key={m.id} className="hover:bg-gray-50">
                {editingId === m.id ? (
                  <>
                    <td className="px-2 py-2">
                      <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#0d1f3c]" />
                    </td>
                    <td className="px-2 py-2">
                      <input value={editForm.displacement} onChange={e => setEditForm(f => ({ ...f, displacement: e.target.value }))}
                        placeholder="2.2" className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#0d1f3c]" />
                    </td>
                    <td className="px-2 py-2">
                      <select value={editForm.fuelType} onChange={e => setEditForm(f => ({ ...f, fuelType: e.target.value }))}
                        className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#0d1f3c]">
                        <option value="gasoline">Gasolina</option>
                        <option value="diesel">Diésel</option>
                        <option value="hybrid">Híbrido</option>
                        <option value="electric">Eléctrico</option>
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <select value={editForm.transmission} onChange={e => setEditForm(f => ({ ...f, transmission: e.target.value }))}
                        className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#0d1f3c]">
                        <option value="">—</option>
                        <option value="manual">Manual</option>
                        <option value="automatic">Automática</option>
                        <option value="cvt">CVT</option>
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <input value={editForm.bodyType} onChange={e => setEditForm(f => ({ ...f, bodyType: e.target.value }))}
                        placeholder="SUV, sedan..." className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#0d1f3c]" />
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => saveEdit(m.id)} disabled={saving}
                          className="p-1 rounded text-emerald-600 hover:bg-emerald-50 disabled:opacity-40">
                          <Check size={13} />
                        </button>
                        <button onClick={() => setEditingId(null)}
                          className="p-1 rounded text-gray-400 hover:bg-gray-100">
                          <X size={13} />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-2.5 font-medium">{m.name}</td>
                    <td className="px-4 py-2.5 text-gray-500">{m.displacement ?? '—'}</td>
                    <td className="px-4 py-2.5 text-gray-500">{m.fuelType ?? '—'}</td>
                    <td className="px-4 py-2.5 text-gray-500">{m.transmission ?? '—'}</td>
                    <td className="px-4 py-2.5 text-gray-500">{m.bodyType ?? '—'}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => startEdit(m)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-[#0d1f3c]">
                          <Pencil size={12} />
                        </button>
                        <button onClick={() => removeModel(m.id)}
                          className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-[#e03030]">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {models.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-8 text-sm">
                  Sin modelos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-medium text-gray-700 text-sm mb-4">Agregar modelo</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Nombre del modelo *</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Wingle 5"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Cilindraje</label>
            <input value={form.displacement} onChange={e => setForm(f => ({ ...f, displacement: e.target.value }))}
              placeholder="2.2, 1.5T" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Combustible</label>
            <select value={form.fuelType} onChange={e => setForm(f => ({ ...f, fuelType: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] bg-white">
              <option value="gasoline">Gasolina</option>
              <option value="diesel">Diésel</option>
              <option value="hybrid">Híbrido</option>
              <option value="electric">Eléctrico</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Transmisión</label>
            <select value={form.transmission} onChange={e => setForm(f => ({ ...f, transmission: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] bg-white">
              <option value="">—</option>
              <option value="manual">Manual</option>
              <option value="automatic">Automática</option>
              <option value="cvt">CVT</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Carrocería</label>
            <input value={form.bodyType} onChange={e => setForm(f => ({ ...f, bodyType: e.target.value }))}
              placeholder="SUV, sedan, pickup..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]" />
          </div>
        </div>
        <button
          onClick={addModel}
          disabled={!form.name.trim() || saving}
          className="mt-4 px-4 py-2 bg-[#0d1f3c] text-white text-sm rounded-lg disabled:opacity-40 hover:bg-[#0a1628] transition-colors"
        >
          {saving ? 'Guardando…' : '+ Agregar modelo'}
        </button>
      </div>
    </div>
  )
}
