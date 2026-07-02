"use client"

import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  CATALOG_QUALITY_OPTIONS,
  type FilterState,
} from "@/lib/catalog"
import type { PublicVehicleBrand } from "@/lib/vehicle-brands-public"

interface CatalogCategoryOption {
  id: string
  label: string
}

interface CatalogFiltersProps {
  brands: PublicVehicleBrand[]
  categories: CatalogCategoryOption[]
  filters: FilterState
  onChange: (f: FilterState) => void
  activeCount: number
  onClear: () => void
  brandCounts: Record<string, number>
  categoryCounts: Record<string, number>
  qualityCounts: Record<string, number>
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</h3>
      {children}
    </div>
  )
}

function Checkbox({
  checked,
  onChange,
  label,
  count,
}: {
  checked: boolean
  onChange: () => void
  label: string
  count: number
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div
        onClick={onChange}
        className={cn(
          "w-4 h-4 rounded border-2 shrink-0 transition-colors duration-150 flex items-center justify-center",
          checked
            ? "bg-navy border-navy"
            : "border-slate-300 group-hover:border-navy/50"
        )}
      >
        {checked && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span
        onClick={onChange}
        className={cn(
          "text-sm transition-colors duration-150 flex-1",
          checked ? "text-navy font-semibold" : "text-slate-600 group-hover:text-slate-900"
        )}
      >
        {label}
      </span>
      <span className={cn(
        "text-xs tabular-nums",
        checked ? "text-navy/60" : "text-slate-400"
      )}>
        {count}
      </span>
    </label>
  )
}

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]
}

export default function CatalogFilters({
  brands,
  categories,
  filters,
  onChange,
  activeCount,
  onClear,
  brandCounts,
  categoryCounts,
  qualityCounts,
}: CatalogFiltersProps) {
  const visibleBrands = brands.filter(
    (brand) => (brandCounts[brand.key] ?? 0) > 0 || filters.carBrands.includes(brand.key)
  )
  const visibleCategories = categories.filter(
    (cat) => (categoryCounts[cat.id] ?? 0) > 0 || filters.categories.includes(cat.id)
  )
  const visibleQualities = CATALOG_QUALITY_OPTIONS.filter(
    (q) => (qualityCounts[q.id] ?? 0) > 0 || filters.qualities.includes(q.id)
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-navy text-lg">Filtros</h2>
        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-brand text-xs font-semibold hover:text-brand/80 transition-colors"
          >
            <X size={12} />
            Limpiar ({activeCount})
          </button>
        )}
      </div>

      <div className="h-px bg-slate-100" />

      {/* Quality */}
      {visibleQualities.length > 0 && (
        <>
          <FilterSection title="Calidad">
            <div className="flex flex-col gap-2">
              {visibleQualities.map((q) => (
                <Checkbox
                  key={q.id}
                  checked={filters.qualities.includes(q.id)}
                  onChange={() =>
                    onChange({ ...filters, qualities: toggle(filters.qualities, q.id) })
                  }
                  label={q.label}
                  count={qualityCounts[q.id] ?? 0}
                />
              ))}
            </div>
          </FilterSection>
          <div className="h-px bg-slate-100" />
        </>
      )}

      {/* Marca de vehículo */}
      {visibleBrands.length > 0 && (
        <>
          <FilterSection title="Marca de vehículo">
            <div className="flex flex-col gap-2">
              {visibleBrands.map((brand) => (
                <Checkbox
                  key={brand.id}
                  checked={filters.carBrands.includes(brand.key)}
                  onChange={() =>
                    onChange({ ...filters, carBrands: toggle(filters.carBrands, brand.key) })
                  }
                  label={brand.name}
                  count={brandCounts[brand.key] ?? 0}
                />
              ))}
            </div>
          </FilterSection>
          <div className="h-px bg-slate-100" />
        </>
      )}

      {/* Categoría */}
      {visibleCategories.length > 0 && (
        <FilterSection title="Categoría">
          <div className="flex flex-col gap-2">
            {visibleCategories.map((cat) => (
              <Checkbox
                key={cat.id}
                checked={filters.categories.includes(cat.id)}
                onChange={() =>
                  onChange({ ...filters, categories: toggle(filters.categories, cat.id) })
                }
                label={cat.label}
                count={categoryCounts[cat.id] ?? 0}
              />
            ))}
          </div>
        </FilterSection>
      )}
    </div>
  )
}
