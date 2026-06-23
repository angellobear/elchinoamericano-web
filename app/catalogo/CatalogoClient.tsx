"use client"

import { useState, useMemo, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { SlidersHorizontal, Search, X, ChevronLeft, ChevronRight } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import CatalogFilters, { FilterState, PRICE_RANGES } from "@/components/CatalogFilters"
import ProductGrid from "@/components/ProductGrid"
import RequestPartForm from "@/components/RequestPartForm"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { products } from "@/data/products"

const PAGE_SIZE = 8

// Use "|" as array separator to avoid %2C encoding in URLs
const SEP = "|"

const DEFAULT_FILTERS: FilterState = {
  priceRange: "all",
  categories: [],
  carBrands: [],
}

function countActiveFilters(f: FilterState): number {
  let n = 0
  if (f.priceRange !== "all") n++
  n += f.categories.length
  n += f.carBrands.length
  return n
}

function parseArrayParam(val: string | null): string[] {
  if (!val) return []
  return val.split(SEP).filter(Boolean)
}

function ActiveFilterChips({
  filters,
  search,
  onRemoveCategory,
  onRemoveBrand,
  onRemovePrice,
  onClear,
}: {
  filters: FilterState
  search: string
  onRemoveCategory: (c: string) => void
  onRemoveBrand: (b: string) => void
  onRemovePrice: () => void
  onClear: () => void
}) {
  const activeCount = countActiveFilters(filters) + (search ? 1 : 0)
  if (activeCount === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      {search && (
        <Chip
          label={`"${search}"`}
          onRemove={onClear}
        />
      )}
      {filters.priceRange !== "all" && (
        <Chip
          label={PRICE_RANGES.find((r) => r.id === filters.priceRange)?.label ?? ""}
          onRemove={onRemovePrice}
        />
      )}
      {filters.categories.map((cat) => (
        <Chip
          key={cat}
          label={cat.charAt(0).toUpperCase() + cat.slice(1)}
          onRemove={() => onRemoveCategory(cat)}
        />
      ))}
      {filters.carBrands.map((brand) => (
        <Chip
          key={brand}
          label={brand.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          onRemove={() => onRemoveBrand(brand)}
        />
      ))}
      <button
        onClick={onClear}
        className="text-xs text-brand font-semibold hover:text-brand/75 transition-colors"
      >
        Limpiar todos
      </button>
    </div>
  )
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-navy text-white text-xs font-semibold px-2.5 py-1.5 rounded-full">
      {label}
      <button
        onClick={onRemove}
        aria-label={`Quitar filtro ${label}`}
        className="hover:text-white/60 transition-colors"
      >
        <X size={11} />
      </button>
    </span>
  )
}

function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number
  totalPages: number
  onPage: (p: number) => void
}) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-1 mt-10">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        aria-label="Página anterior"
        className="w-9 h-9 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:border-navy hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          aria-current={p === page ? "page" : undefined}
          className={`w-9 h-9 flex items-center justify-center rounded-md text-sm font-semibold transition-colors border ${
            p === page
              ? "bg-navy border-navy text-white"
              : "border-slate-200 text-slate-600 hover:border-navy hover:text-navy"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        aria-label="Página siguiente"
        className="w-9 h-9 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:border-navy hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  )
}

export default function CatalogoClient() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [search, setSearch] = useState(() => searchParams.get("q") ?? "")
  const [filters, setFilters] = useState<FilterState>(() => ({
    priceRange: searchParams.get("precio") ?? "all",
    categories: parseArrayParam(searchParams.get("categoria")),
    carBrands: parseArrayParam(searchParams.get("marca")),
  }))
  const [page, setPage] = useState(() =>
    Math.max(1, Number(searchParams.get("pagina") ?? "1"))
  )

  const activeCount = countActiveFilters(filters)

  const buildUrl = useCallback(
    (q: string, f: FilterState, p: number) => {
      const params = new URLSearchParams()
      if (q) params.set("q", q)
      if (f.priceRange !== "all") params.set("precio", f.priceRange)
      if (f.categories.length) params.set("categoria", f.categories.join(SEP))
      if (f.carBrands.length) params.set("marca", f.carBrands.join(SEP))
      if (p > 1) params.set("pagina", String(p))
      const qs = params.toString()
      router.replace(qs ? `/catalogo?${qs}` : "/catalogo", { scroll: false })
    },
    [router]
  )

  function handleSearch(q: string) {
    setSearch(q)
    setPage(1)
    buildUrl(q, filters, 1)
  }

  function handleFiltersChange(f: FilterState) {
    setFilters(f)
    setPage(1)
    buildUrl(search, f, 1)
  }

  function handleClear() {
    setFilters(DEFAULT_FILTERS)
    setSearch("")
    setPage(1)
    router.replace("/catalogo", { scroll: false })
  }

  function handlePage(p: number) {
    setPage(p)
    buildUrl(search, filters, p)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const filtered = useMemo(() => {
    const priceRange = PRICE_RANGES.find((r) => r.id === filters.priceRange)!
    const q = search.toLowerCase()
    return products.filter((p) => {
      const matchSearch =
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        p.compatible.toLowerCase().includes(q) ||
        p.brandProduct.toLowerCase().includes(q)
      const matchPrice =
        p.price >= priceRange.min &&
        (priceRange.max === Infinity ? true : p.price <= priceRange.max)
      const matchCategory =
        filters.categories.length === 0 || filters.categories.includes(p.category)
      const matchBrand =
        filters.carBrands.length === 0 || filters.carBrands.includes(p.carBrand)
      return matchSearch && matchPrice && matchCategory && matchBrand
    })
  }, [search, filters])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const safePage = Math.min(page, Math.max(1, totalPages))
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <main className="min-h-screen bg-slate-50 pt-16">
      {/* Sticky page header — title, count, search, filter button ONLY */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div>
              <h1 className="font-display font-bold text-navy text-2xl leading-none">Catálogo</h1>
              <p className="text-slate-500 text-xs mt-1">
                {filtered.length}{" "}
                {filtered.length === 1 ? "repuesto encontrado" : "repuestos encontrados"}
                {totalPages > 1 && (
                  <span className="text-slate-400"> · Página {safePage} de {totalPages}</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative flex-1 sm:w-64 sm:flex-none">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Buscar repuesto..."
                  className="w-full pl-8 pr-8 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors bg-white"
                />
                {search && (
                  <button
                    onClick={() => handleSearch("")}
                    aria-label="Limpiar búsqueda"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Mobile filters trigger */}
              <Sheet>
                <SheetTrigger asChild>
                  <button className="lg:hidden relative inline-flex items-center gap-1.5 border border-slate-200 bg-white text-slate-700 text-sm font-medium px-3 py-2 rounded-md hover:border-navy/30 transition-colors shrink-0 min-h-[36px]">
                    <SlidersHorizontal size={14} />
                    Filtros
                    {activeCount > 0 && (
                      <span className="bg-brand text-white text-[9px] font-bold rounded-full min-w-[16px] min-h-[16px] flex items-center justify-center px-1 leading-none">
                        {activeCount}
                      </span>
                    )}
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 px-6 pt-10 overflow-y-auto">
                  <CatalogFilters
                    filters={filters}
                    onChange={handleFiltersChange}
                    activeCount={activeCount}
                    onClear={handleClear}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Layout: aside + content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop aside */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-[120px] bg-white rounded-xl border border-slate-200 p-5">
              <CatalogFilters
                filters={filters}
                onChange={handleFiltersChange}
                activeCount={activeCount}
                onClear={handleClear}
              />
            </div>
          </aside>

          {/* Main: chips + grid + pagination */}
          <div className="flex-1 min-w-0">
            {/* Active filter chips — above the cards */}
            <AnimatePresence>
              {(activeCount > 0 || search) && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <ActiveFilterChips
                    filters={filters}
                    search={search}
                    onRemoveCategory={(cat) =>
                      handleFiltersChange({ ...filters, categories: filters.categories.filter((c) => c !== cat) })
                    }
                    onRemoveBrand={(brand) =>
                      handleFiltersChange({ ...filters, carBrands: filters.carBrands.filter((b) => b !== brand) })
                    }
                    onRemovePrice={() => handleFiltersChange({ ...filters, priceRange: "all" })}
                    onClear={handleClear}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {filtered.length === 0 ? (
              <RequestPartForm searchQuery={search} />
            ) : (
              <>
                <ProductGrid products={paginated} />
                <Pagination page={safePage} totalPages={totalPages} onPage={handlePage} />
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
