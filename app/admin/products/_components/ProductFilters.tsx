'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'

const STORAGE_KEY = 'admin_products_filters'

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
    limit?: string
  }
}

const selectCls = 'border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors'

export function ProductFilters({ categories, vehicleBrands, defaults }: ProductFiltersProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const typeRef = useRef<HTMLSelectElement>(null)
  const categoryRef = useRef<HTMLSelectElement>(null)
  const vehicleBrandRef = useRef<HTMLSelectElement>(null)
  const statusRef = useRef<HTMLSelectElement>(null)
  const [hasSearch, setHasSearch] = useState(!!defaults.search)

  const hasFilters = hasSearch
    || !!defaults.type
    || !!defaults.categoryId
    || !!defaults.vehicleBrandId
    || (!!defaults.status && defaults.status !== 'active')

  // Restore saved filters on mount if page has no active filters
  useEffect(() => {
    if (hasFilters) {
      sessionStorage.setItem(STORAGE_KEY, window.location.search)
      return
    }
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved && saved !== '?' && saved !== '') {
      router.replace(`/admin/products${saved}`)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const navigate = () => {
    const params = new URLSearchParams()
    const search = inputRef.current?.value ?? ''
    const type = typeRef.current?.value ?? ''
    const categoryId = categoryRef.current?.value ?? ''
    const vehicleBrandId = vehicleBrandRef.current?.value ?? ''
    const status = statusRef.current?.value ?? 'active'

    if (search) params.set('search', search)
    if (type) params.set('type', type)
    if (categoryId) params.set('categoryId', categoryId)
    if (vehicleBrandId) params.set('vehicleBrandId', vehicleBrandId)
    if (status !== 'active') params.set('status', status)
    if (defaults.limit && defaults.limit !== '10') params.set('limit', defaults.limit)
    // page intentionally omitted — filter change resets to page 1

    const qs = params.toString()
    const url = qs ? `/admin/products?${qs}` : '/admin/products'
    sessionStorage.setItem(STORAGE_KEY, qs ? `?${qs}` : '')
    router.push(url)
  }

  return (
    <div className="mb-5 space-y-3">
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            ref={inputRef}
            defaultValue={defaults.search}
            onChange={(e) => setHasSearch(!!e.target.value)}
            placeholder="Buscar por título, descripción, SKU, código de repuesto..."
            className="w-full border border-slate-200 rounded-lg pl-9 pr-9 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); navigate() } }}
          />
          {hasSearch && (
            <button
              type="button"
              onClick={() => { if (inputRef.current) inputRef.current.value = ''; setHasSearch(false) }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={navigate}
          className="px-4 py-2.5 bg-navy text-white text-sm font-medium rounded-lg hover:bg-navy-dark active:scale-[0.98] transition-all"
        >
          Buscar
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={() => { sessionStorage.removeItem(STORAGE_KEY); router.push('/admin/products') }}
            className="px-4 py-2.5 bg-brand/10 text-brand text-sm font-medium rounded-lg hover:bg-brand/20 active:scale-[0.98] transition-all whitespace-nowrap"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select ref={typeRef} defaultValue={defaults.type ?? ''} className={selectCls} onChange={navigate}>
          <option value="">Todos los tipos</option>
          <option value="original">Original</option>
          <option value="oem">OEM</option>
          <option value="aftermarket">Alterno / Aftermarket</option>
        </select>

        <select ref={categoryRef} defaultValue={defaults.categoryId ?? ''} className={selectCls} onChange={navigate}>
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select ref={vehicleBrandRef} defaultValue={defaults.vehicleBrandId ?? ''} className={selectCls} onChange={navigate}>
          <option value="">Todas las marcas</option>
          {vehicleBrands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <select ref={statusRef} defaultValue={defaults.status ?? 'active'} className={selectCls} onChange={navigate}>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
          <option value="all">Todos</option>
        </select>
      </div>
    </div>
  )
}
