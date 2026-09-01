'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Pencil, Trash2, Check, X, ToggleLeft, ToggleRight, ChevronDown, Plus, Search } from 'lucide-react'
import { routes } from '@/lib/routes'
import { vehicleModelFormSchema } from '@/modules/admin/vehicle-brands/form-schema'
import { SearchSelect, type SearchSelectOption } from '@/components/ui/search-select'

interface Model {
  id: number
  name: string
  displacement?: string | null
  fuelType?: string | null
  transmission?: string | null
  driveType?: string | null
  bodyType?: string | null
  isActive?: boolean | null
}

interface Brand {
  id: number
  name: string
  origin: string
  isActive?: boolean | null
  models?: Model[]
}

const emptyForm = {
  name: '',
  displacement: '',
  fuelType: 'gasoline',
  transmission: '',
  driveType: '',
  bodyType: '',
}

const FUEL_TYPE_OPTIONS: SearchSelectOption[] = [
  { value: 'gasoline', label: 'Gasolina' },
  { value: 'diesel', label: 'Diésel' },
  { value: 'hybrid', label: 'Híbrido' },
  { value: 'electric', label: 'Eléctrico' },
]

const TRANSMISSION_OPTIONS: SearchSelectOption[] = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatic', label: 'Automática' },
  { value: 'cvt', label: 'CVT' },
]

// El SearchSelect ya limpia con la X, asi que la opcion vacia "—" sobra.
function toSelectOptions(options: readonly { value: string; label: string }[]): SearchSelectOption[] {
  return options.filter((option) => option.value !== '').map((option) => ({ ...option }))
}

const DRIVE_TYPE_OPTIONS = [
  { value: '', label: '—' },
  { value: '4x2', label: '4x2' },
  { value: '4x4', label: '4x4' },
  { value: 'awd', label: 'AWD' },
  { value: 'fwd', label: 'FWD' },
  { value: 'rwd', label: 'RWD' },
] as const

const BODY_TYPE_OPTIONS = [
  { value: '', label: '—' },
  { value: 'sedan', label: 'Sedán' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'suv', label: 'SUV' },
  { value: 'crossover', label: 'Crossover' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'coupe', label: 'Coupé' },
  { value: 'wagon', label: 'Wagon' },
  { value: 'van', label: 'Van' },
  { value: 'bus', label: 'Bus' },
  { value: 'camion', label: 'Camión' },
] as const

function getBodyTypeLabel(value?: string | null) {
  if (!value) return '—'
  return BODY_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value
}

function getBodyTypeOptions(currentValue?: string | null) {
  if (!currentValue || BODY_TYPE_OPTIONS.some((option) => option.value === currentValue)) {
    return BODY_TYPE_OPTIONS
  }

  return [...BODY_TYPE_OPTIONS, { value: currentValue, label: currentValue }]
}

function getPayloadErrorMessage() {
  return 'Revisa los datos del modelo antes de guardar.'
}

async function getResponseErrorMessage(res: Response, fallback: string) {
  try {
    const data = await res.json() as { error?: string }
    if (res.status === 403) return 'No tienes permisos para administrar modelos de esta marca.'
    return data.error || fallback
  } catch {
    return res.status === 403 ? 'No tienes permisos para administrar modelos de esta marca.' : fallback
  }
}

export function VehicleModelsEditor({ brand }: { brand: Brand }) {
  const [models, setModels] = useState<Model[]>(brand.models ?? [])
  const [modelSearch, setModelSearch] = useState('')

  const modelQuery = modelSearch.trim().toLowerCase()
  const visibleModels = [...models]
    .filter((model) =>
      !modelQuery ||
      [model.name, model.displacement, model.fuelType, model.transmission, model.driveType, model.bodyType]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(modelQuery)),
    )
    .sort((a, b) => a.name.localeCompare(b.name))
  const [form, setForm] = useState(emptyForm)
  const [formOpen, setFormOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState(emptyForm)

  async function addModel() {
    const parsed = vehicleModelFormSchema.safeParse({
      ...form,
      displacement: form.displacement || undefined,
      fuelType: form.fuelType || undefined,
      transmission: form.transmission || undefined,
      driveType: form.driveType || undefined,
      bodyType: form.bodyType || undefined,
    })

    if (!parsed.success) {
      toast.error(getPayloadErrorMessage())
      return
    }

    setSaving(true)
    try {
      const res = await fetch(routes.admin.vehicleBrands.models(brand.id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      if (!res.ok) throw new Error(await getResponseErrorMessage(res, 'Error al agregar modelo'))
      const { model } = await res.json()
      setModels((current) => [...current, { ...model, isActive: true }])
      setForm(emptyForm)
      setFormOpen(false)
      toast.success('Modelo agregado')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al agregar modelo')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(model: Model) {
    setEditingId(model.id)
    setEditForm({
      name: model.name,
      displacement: model.displacement ?? '',
      fuelType: model.fuelType ?? 'gasoline',
      transmission: model.transmission ?? '',
      driveType: model.driveType ?? '',
      bodyType: model.bodyType ?? '',
    })
  }

  async function saveEdit(id: number) {
    const parsed = vehicleModelFormSchema.safeParse({
      ...editForm,
      displacement: editForm.displacement || undefined,
      fuelType: editForm.fuelType || undefined,
      transmission: editForm.transmission || undefined,
      driveType: editForm.driveType || undefined,
      bodyType: editForm.bodyType || undefined,
    })

    if (!parsed.success) {
      toast.error(getPayloadErrorMessage())
      return
    }

    setSaving(true)
    try {
      const res = await fetch(routes.admin.vehicleBrands.model(brand.id, id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      if (!res.ok) throw new Error(await getResponseErrorMessage(res, 'Error al actualizar modelo'))
      setModels((current) => current.map((model) => (model.id === id ? { ...model, ...parsed.data } : model)))
      setEditingId(null)
      toast.success('Modelo actualizado')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar modelo')
    } finally {
      setSaving(false)
    }
  }

  async function toggleModelStatus(model: Model) {
    const payload = {
      name: model.name,
      displacement: model.displacement || undefined,
      fuelType: model.fuelType || undefined,
      transmission: model.transmission || undefined,
      driveType: model.driveType || undefined,
      bodyType: model.bodyType || undefined,
      isActive: model.isActive === false,
    }

    const parsed = vehicleModelFormSchema.safeParse(payload)
    if (!parsed.success) {
      toast.error(getPayloadErrorMessage())
      return
    }

    setSaving(true)
    try {
      const res = await fetch(routes.admin.vehicleBrands.model(brand.id, model.id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      if (!res.ok) throw new Error(await getResponseErrorMessage(res, 'Error al cambiar el estado del modelo'))

      setModels((current) =>
        current.map((item) => (
          item.id === model.id ? { ...item, isActive: parsed.data.isActive } : item
        )),
      )
      toast.success(model.isActive === false ? 'Modelo activado' : 'Modelo desactivado')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al cambiar el estado del modelo')
    } finally {
      setSaving(false)
    }
  }

  async function removeModel(id: number) {
    if (!window.confirm('¿Eliminar este modelo? Esta acción no se puede deshacer.')) return
    try {
      const res = await fetch(routes.admin.vehicleBrands.model(brand.id, id), { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setModels((current) => current.filter((model) => model.id !== id))
      toast.success('Modelo eliminado')
    } catch {
      toast.error('Error al eliminar modelo')
    }
  }

  return (
    <div className="space-y-4">
      {/* Agregar modelo — collapsible, kept mounted to preserve form state */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setFormOpen((o) => !o)}
          className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Plus size={15} />
            Agregar modelo
          </span>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-200 ${formOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* ponytail: hidden not unmounted — keeps form values when accordion closes */}
        <div className={formOpen ? 'p-5 border-t border-gray-100' : 'hidden'}>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Nombre del modelo *</label>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Wingle 5"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Cilindraje</label>
              <input
                value={form.displacement}
                onChange={(event) => setForm((current) => ({ ...current, displacement: event.target.value }))}
                placeholder="2.2, 1.5T"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Combustible</label>
              <SearchSelect
                value={form.fuelType}
                onChange={(value) => setForm((current) => ({ ...current, fuelType: value }))}
                options={FUEL_TYPE_OPTIONS}
                placeholder="—"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Transmisión</label>
              <SearchSelect
                value={form.transmission}
                onChange={(value) => setForm((current) => ({ ...current, transmission: value }))}
                options={TRANSMISSION_OPTIONS}
                placeholder="—"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tracción</label>
              <SearchSelect
                value={form.driveType}
                onChange={(value) => setForm((current) => ({ ...current, driveType: value }))}
                options={toSelectOptions(DRIVE_TYPE_OPTIONS)}
                placeholder="—"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tipo</label>
              <SearchSelect
                value={form.bodyType}
                onChange={(value) => setForm((current) => ({ ...current, bodyType: value }))}
                options={toSelectOptions(BODY_TYPE_OPTIONS)}
                placeholder="—"
              />
            </div>
          </div>
          <button
            onClick={addModel}
            disabled={!form.name.trim() || saving}
            className="mt-4 px-4 py-2 bg-navy text-white text-sm rounded-lg disabled:opacity-40 hover:bg-navy-dark transition-colors"
          >
            {saving ? 'Guardando…' : '+ Agregar modelo'}
          </button>
        </div>
      </div>

      {/* Models table with max height scroll */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
          <span className="font-medium text-gray-700 text-sm">
            Modelos ({visibleModels.length}{visibleModels.length !== models.length ? ` de ${models.length}` : ''})
          </span>
          <div className="relative w-full sm:w-64">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={modelSearch}
              onChange={(event) => setModelSearch(event.target.value)}
              placeholder="Buscar modelo..."
              className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
            />
          </div>
        </div>
        <div className="overflow-auto max-h-96">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
              <tr>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Modelo</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Cilindraje</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Combustible</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Transmisión</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Tracción</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Tipo</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Estado</th>
                <th className="px-4 py-2 w-28"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visibleModels.map((model) => (
                <tr key={model.id} className={`hover:bg-gray-50 ${model.isActive === false ? 'bg-gray-50/60' : ''}`}>
                  {editingId === model.id ? (
                    <>
                      <td className="px-2 py-2">
                        <input
                          value={editForm.name}
                          onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-navy"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          value={editForm.displacement}
                          onChange={(event) => setEditForm((current) => ({ ...current, displacement: event.target.value }))}
                          placeholder="2.2"
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-navy"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <SearchSelect
                          value={editForm.fuelType}
                          onChange={(value) => setEditForm((current) => ({ ...current, fuelType: value }))}
                          options={FUEL_TYPE_OPTIONS}
                          placeholder="—"
                          className="min-h-8 py-1 text-xs"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <SearchSelect
                          value={editForm.transmission}
                          onChange={(value) => setEditForm((current) => ({ ...current, transmission: value }))}
                          options={TRANSMISSION_OPTIONS}
                          placeholder="—"
                          className="min-h-8 py-1 text-xs"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <SearchSelect
                          value={editForm.driveType}
                          onChange={(value) => setEditForm((current) => ({ ...current, driveType: value }))}
                          options={toSelectOptions(DRIVE_TYPE_OPTIONS)}
                          placeholder="—"
                          className="min-h-8 py-1 text-xs"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <SearchSelect
                          value={editForm.bodyType}
                          onChange={(value) => setEditForm((current) => ({ ...current, bodyType: value }))}
                          options={toSelectOptions(getBodyTypeOptions(editForm.bodyType))}
                          placeholder="—"
                          className="min-h-8 py-1 text-xs"
                        />
                      </td>
                      <td className="px-4 py-2.5 text-gray-500">
                        {editForm.name ? (
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                            model.isActive === false ? 'bg-gray-100 text-gray-500' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {model.isActive === false ? 'Inactivo' : 'Activo'}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => saveEdit(model.id)}
                            disabled={saving}
                            className="p-1 rounded text-emerald-600 hover:bg-emerald-50 disabled:opacity-40"
                          >
                            <Check size={13} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 rounded text-gray-400 hover:bg-gray-100"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2.5 font-medium">{model.name}</td>
                      <td className="px-4 py-2.5 text-gray-500">{model.displacement ?? '—'}</td>
                      <td className="px-4 py-2.5 text-gray-500">{model.fuelType ?? '—'}</td>
                      <td className="px-4 py-2.5 text-gray-500">{model.transmission ?? '—'}</td>
                      <td className="px-4 py-2.5 text-gray-500">{model.driveType ? model.driveType.toUpperCase() : '—'}</td>
                      <td className="px-4 py-2.5 text-gray-500">{getBodyTypeLabel(model.bodyType)}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                          model.isActive === false ? 'bg-gray-100 text-gray-500' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {model.isActive === false ? 'Inactivo' : 'Activo'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => toggleModelStatus(model)}
                            disabled={saving}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-amber-600 disabled:opacity-40"
                            title={model.isActive === false ? 'Activar' : 'Desactivar'}
                          >
                            {model.isActive === false ? <ToggleLeft size={12} /> : <ToggleRight size={12} />}
                          </button>
                          <button
                            onClick={() => startEdit(model)}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-navy"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => removeModel(model.id)}
                            className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-brand"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {visibleModels.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-gray-400 py-8 text-sm">
                    {modelSearch ? 'Ningun modelo coincide con la busqueda' : 'Sin modelos registrados'}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
