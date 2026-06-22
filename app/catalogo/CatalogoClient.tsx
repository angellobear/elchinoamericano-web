"use client"

import { useState, useMemo, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { SlidersHorizontal, Search, X, ChevronLeft, ChevronRight } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import CatalogFilters, { FilterState, PRICE_RANGES } from "@/components/CatalogFilters"
import ProductGrid from "@/components/ProductGrid"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { products } from "@/data/products"

const PAGE_SIZE = 8

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
  return val.split(",").filter(Boolean)
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-navy/8 text-navy text-xs font-semibold px-2.5 py-1 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-brand transition-colors">
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
      if (f.categories.length) params.set("categoria", f.categories.join(","))
      if (f.carBrands.length) params.set("marca", f.carBrands.join(","))
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
      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div>
              <h1 className="font-display font-bold text-navy text-3xl">Catálogo</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                {filtered.length}{" "}
                {filtered.length === 1 ? "repuesto encontrado" : "repuestos encontrados"}
                {totalPages > 1 && (
                  <span className="text-slate-400">
                    {" "}· Página {safePage} de {totalPages}
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 sm:w-72 sm:flex-none">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Buscar repuesto..."
                  className="w-full pl-8 pr-9 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors bg-white"
                />
                {search && (
                  <button
                    onClick={() => handleSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Mobile filters trigger */}
              <Sheet>
                <SheetTrigger asChild>
                  <button className="lg:hidden relative inline-flex items-center gap-2 border border-slate-200 bg-white text-slate-700 text-sm font-medium px-3 py-2 rounded-md hover:border-navy/30 transition-colors shrink-0">
                    <SlidersHorizontal size={15} />
                    Filtros
                    {activeCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[18px] min-h-[18px] bg-brand text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
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

          {/* Active filter chips */}
          <AnimatePresence>
            {activeCount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap items-center gap-2 mt-4 overflow-hidden"
              >
                {filters.priceRange !== "all" && (
                  <ActiveChip
                    label={PRICE_RANGES.find((r) => r.id === filters.priceRange)?.label ?? ""}
                    onRemove={() => handleFiltersChange({ ...filters, priceRange: "all" })}
                  />
                )}
                {filters.categories.map((cat) => (
                  <ActiveChip
                    key={cat}
                    label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                    onRemove={() =>
                      handleFiltersChange({ ...filters, categories: filters.categories.filter((c) => c !== cat) })
                    }
                  />
                ))}
                {filters.carBrands.map((brand) => (
                  <ActiveChip
                    key={brand}
                    label={brand.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    onRemove={() =>
                      handleFiltersChange({ ...filters, carBrands: filters.carBrands.filter((b) => b !== brand) })
                    }
                  />
                ))}
                <button
                  onClick={handleClear}
                  className="text-xs text-brand font-semibold hover:text-brand/75 transition-colors"
                >
                  Limpiar todos
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Layout: aside + grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop aside */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-24 bg-white rounded-xl border border-slate-200 p-5">
              <CatalogFilters
                filters={filters}
                onChange={handleFiltersChange}
                activeCount={activeCount}
                onClear={handleClear}
              />
            </div>
          </aside>

          {/* Main grid + pagination */}
          <div className="flex-1 min-w-0">
            <ProductGrid products={paginated} />
            <Pagination page={safePage} totalPages={totalPages} onPage={handlePage} />
          </div>
        </div>
      </div>
    </main>
  )
}
