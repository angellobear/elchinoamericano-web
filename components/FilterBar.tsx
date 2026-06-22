"use client"

import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  { id: "all", label: "Todos" },
  { id: "motor", label: "Motor" },
  { id: "frenos", label: "Frenos" },
  { id: "suspension", label: "Suspensión" },
  { id: "filtros", label: "Filtros" },
  { id: "carroceria", label: "Carrocería" },
  { id: "enfriamiento", label: "Enfriamiento" },
]

const CAR_BRANDS = [
  { id: "all", label: "Todas" },
  { id: "ford", label: "Ford" },
  { id: "chevrolet", label: "Chevrolet" },
  { id: "chery", label: "Chery" },
  { id: "great_wall", label: "Great Wall" },
  { id: "dfsk", label: "DFSK" },
  { id: "jetour", label: "Jetour" },
  { id: "shineray", label: "Shineray" },
  { id: "byd", label: "BYD" },
  { id: "mg", label: "MG" },
  { id: "jac", label: "JAC" },
]

interface FilterBarProps {
  search: string
  category: string
  carBrand: string
  total: number
  onSearchChange: (v: string) => void
  onCategoryChange: (v: string) => void
  onCarBrandChange: (v: string) => void
}

export default function FilterBar({
  search,
  category,
  carBrand,
  total,
  onSearchChange,
  onCategoryChange,
  onCarBrandChange,
}: FilterBarProps) {
  return (
    <div className="sticky top-16 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-3">
        {/* Search */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar repuesto, marca o vehículo..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
          />
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150",
                category === cat.id
                  ? "bg-navy text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-navy/10 hover:text-navy"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Car brand chips */}
        <div className="flex flex-wrap gap-2">
          {CAR_BRANDS.map((brand) => (
            <button
              key={brand.id}
              onClick={() => onCarBrandChange(brand.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150",
                carBrand === brand.id
                  ? "bg-navy text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-navy/10 hover:text-navy"
              )}
            >
              {brand.label}
            </button>
          ))}
        </div>

        {/* Count */}
        <p className="text-xs text-slate-500">
          {total} {total === 1 ? "producto encontrado" : "productos encontrados"}
        </p>
      </div>
    </div>
  )
}
