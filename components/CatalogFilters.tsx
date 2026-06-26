"use client"

import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  CATALOG_PRICE_RANGES,
  type FilterState,
} from "@/lib/catalog"
import type { PublicVehicleBrand } from "@/lib/vehicle-brands-public"

const CATEGORIES = [
  { id: "motor", label: "Motor" },
  { id: "frenos", label: "Frenos" },
  { id: "suspension", label: "Suspensión" },
  { id: "filtros", label: "Filtros" },
  { id: "carroceria", label: "Carrocería" },
  { id: "enfriamiento", label: "Enfriamiento" },
]

interface CatalogFiltersProps {
  brands: PublicVehicleBrand[]
  filters: FilterState
  onChange: (f: FilterState) => void
  activeCount: number
  onClear: () => void
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
}: {
  checked: boolean
  onChange: () => void
  label: string
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
          "text-sm transition-colors duration-150",
          checked ? "text-navy font-semibold" : "text-slate-600 group-hover:text-slate-900"
        )}
      >
        {label}
      </span>
    </label>
  )
}

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]
}

export default function CatalogFilters({
  brands,
  filters,
  onChange,
  activeCount,
  onClear,
}: CatalogFiltersProps) {
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

      {/* Price range */}
      <FilterSection title="Precio">
        <div className="flex flex-col gap-2">
          {CATALOG_PRICE_RANGES.map((range) => (
            <label
              key={range.id}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer text-sm transition-colors duration-150",
                filters.priceRange === range.id
                  ? "bg-navy text-white font-semibold"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <input
                type="radio"
                name="price"
                checked={filters.priceRange === range.id}
                onChange={() => onChange({ ...filters, priceRange: range.id })}
                className="sr-only"
              />
              {range.label}
            </label>
          ))}
        </div>
      </FilterSection>

      <div className="h-px bg-slate-100" />

      {/* Marca de vehículo */}
      <FilterSection title="Marca de vehículo">
        <div className="flex flex-col gap-2">
          {brands.map((brand) => (
            <Checkbox
              key={brand.id}
              checked={filters.carBrands.includes(brand.key)}
              onChange={() =>
                onChange({ ...filters, carBrands: toggle(filters.carBrands, brand.key) })
              }
              label={brand.name}
            />
          ))}
        </div>
      </FilterSection>

      <div className="h-px bg-slate-100" />

      {/* Category */}
      <FilterSection title="Categoría">
        <div className="flex flex-col gap-2">
          {CATEGORIES.map((cat) => (
            <Checkbox
              key={cat.id}
              checked={filters.categories.includes(cat.id)}
              onChange={() =>
                onChange({ ...filters, categories: toggle(filters.categories, cat.id) })
              }
              label={cat.label}
            />
          ))}
        </div>
      </FilterSection>
    </div>
  )
}
