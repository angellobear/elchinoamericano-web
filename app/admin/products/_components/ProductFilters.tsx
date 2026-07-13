'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { SearchSelect } from '@/components/ui/search-select'

const STORAGE_KEY = 'admin_products_filters'

interface Option { id: number; name: string }

interface ProductFiltersProps {
  categories: Option[]
  vehicleBrands: Option[]
  defaults: {
    search?: string
    type?: string
    categoryIds?: string[]
    vehicleBrandIds?: string[]
    status?: string
    limit?: string
  }
}

export function ProductFilters({ categories, vehicleBrands, defaults }: ProductFiltersProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [hasSearch, setHasSearch] = useState(!!defaults.search)
  const [type, setType] = useState(defaults.type ?? '')
  const [status, setStatus] = useState(defaults.status ?? 'active')
  const [categoryIds, setCategoryIds] = useState<string[]>(defaults.categoryIds ?? [])
  const [vehicleBrandIds, setVehicleBrandIds] = useState<string[]>(defaults.vehicleBrandIds ?? [])

  const hasFilters = hasSearch
    || !!type
    || categoryIds.length > 0
    || vehicleBrandIds.length > 0
    || (!!status && status !== 'active')

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

  function navigate(overrides?: {
    type?: string
    status?: string
    categoryIds?: string[]
    vehicleBrandIds?: string[]
  }) {
    const params = new URLSearchParams()
    const search = inputRef.current?.value ?? ''
    const resolvedType = overrides?.type ?? type
    const resolvedStatus = overrides?.status ?? status
    const resolvedCategoryIds = overrides?.categoryIds ?? categoryIds
    const resolvedVehicleBrandIds = overrides?.vehicleBrandIds ?? vehicleBrandIds

    if (search) params.set('search', search)
    if (resolvedType) params.set('type', resolvedType)
    if (resolvedCategoryIds.length) params.set('categoryId', resolvedCategoryIds.join(','))
    if (resolvedVehicleBrandIds.length) params.set('vehicleBrandId', resolvedVehicleBrandIds.join(','))
    if (resolvedStatus !== 'active') params.set('status', resolvedStatus)
    if (defaults.limit && defaults.limit !== '10') params.set('limit', defaults.limit)

    const qs = params.toString()
    const url = qs ? `/admin/products?${qs}` : '/admin/products'
    sessionStorage.setItem(STORAGE_KEY, qs ? `?${qs}` : '')
    router.push(url)
  }

  function handleType(val: string) {
    setType(val)
    navigate({ type: val })
  }

  function handleStatus(val: string) {
    setStatus(val)
    navigate({ status: val })
  }

  function handleCategoryIds(val: string[]) {
    setCategoryIds(val)
    navigate({ categoryIds: val })
  }

  function handleVehicleBrandIds(val: string[]) {
    setVehicleBrandIds(val)
    navigate({ vehicleBrandIds: val })
  }

  const typeOptions = [
    { value: 'original', label: 'Original' },
    { value: 'oem', label: 'OEM' },
    { value: 'aftermarket', label: 'Alterno / Aftermarket' },
  ]
  const statusOptions = [
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Inactivos' },
    { value: 'all', label: 'Todos' },
  ]

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
          onClick={() => navigate()}
          className="px-4 py-2.5 bg-navy text-white text-sm font-medium rounded-lg hover:bg-navy-dark active:scale-[0.98] transition-all"
        >
          Buscar
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem(STORAGE_KEY)
              setCategoryIds([])
              setVehicleBrandIds([])
              setType('')
              setStatus('active')
              if (inputRef.current) inputRef.current.value = ''
              setHasSearch(false)
              router.push('/admin/products')
            }}
            className="px-4 py-2.5 bg-brand/10 text-brand text-sm font-medium rounded-lg hover:bg-brand/20 active:scale-[0.98] transition-all whitespace-nowrap"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="min-w-36">
          <SearchSelect
            value={type}
            onChange={handleType}
            options={typeOptions}
            placeholder="Todos los tipos"
          />
        </div>
        <div className="min-w-44">
          <SearchSelect
            multiple
            value={categoryIds}
            onChange={handleCategoryIds}
            options={categories.map(c => ({ value: String(c.id), label: c.name }))}
            placeholder="Categorías"
          />
        </div>
        <div className="min-w-44">
          <SearchSelect
            multiple
            value={vehicleBrandIds}
            onChange={handleVehicleBrandIds}
            options={vehicleBrands.map(b => ({ value: String(b.id), label: b.name }))}
            placeholder="Marcas de vehículo"
          />
        </div>
        <div className="min-w-32">
          <SearchSelect
            value={status}
            onChange={handleStatus}
            options={statusOptions}
            placeholder="Estado"
          />
        </div>
      </div>
    </div>
  )
}
