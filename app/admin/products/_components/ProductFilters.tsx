'use client'

import { useRef } from 'react'
import { Search, X } from 'lucide-react'

interface Option { id: number; name: string }

interface ProductFiltersProps {
  categories: Option[]
  vehicleBrands: Option[]
  defaults: {
    search?: string
    type?: string
    categoryId?: string
    vehicleBrandId?: string
    status?: string
  }
}

const selectCls = 'border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors'

export function ProductFilters({ categories, vehicleBrands, defaults }: ProductFiltersProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const submit = () => formRef.current?.requestSubmit()

  const clearSearch = () => {
    if (searchRef.current) searchRef.current.value = ''
    submit()
  }

  return (
    <form ref={formRef} method="get" className="mb-5 space-y-3">
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            ref={searchRef}
            name="search"
            defaultValue={defaults.search}
            placeholder="Buscar por título, descripción, SKU, código de repuesto..."
            className="w-full border border-slate-200 rounded-lg pl-9 pr-9 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit() } }}
          />
          {defaults.search && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button type="submit" className="px-4 py-2.5 bg-navy text-white text-sm font-medium rounded-lg hover:bg-navy-dark active:scale-[0.98] transition-all">
          Buscar
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select name="type" defaultValue={defaults.type ?? ''} className={selectCls} onChange={submit}>
          <option value="">Todos los tipos</option>
          <option value="original">Original</option>
          <option value="oem">OEM</option>
          <option value="aftermarket">Alterno / Aftermarket</option>
        </select>

        <select name="categoryId" defaultValue={defaults.categoryId ?? ''} className={selectCls} onChange={submit}>
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select name="vehicleBrandId" defaultValue={defaults.vehicleBrandId ?? ''} className={selectCls} onChange={submit}>
          <option value="">Todas las marcas</option>
          {vehicleBrands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <select name="status" defaultValue={defaults.status ?? 'active'} className={selectCls} onChange={submit}>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
          <option value="all">Todos</option>
        </select>
      </div>
    </form>
  )
}
