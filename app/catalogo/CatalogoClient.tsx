"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import CatalogFilters from "@/components/CatalogFilters"
import ProductGrid from "@/components/ProductGrid"
import RequestPartForm from "@/components/RequestPartForm"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import type { Product } from "@/types"
import {
  buildCatalogUrl,
  CATALOG_PAGE_SIZE,
  CATALOG_QUALITY_OPTIONS,
  countActiveFilters,
  DEFAULT_CATALOG_FILTERS,
  type FilterState,
} from "@/lib/catalog"
import { toVehicleBrandKey, type PublicVehicleBrand } from "@/lib/vehicle-brands-public"

interface CatalogCategoryOption {
  id: string
  label: string
}

interface CatalogoClientProps {
  brands: PublicVehicleBrand[]
  categories: CatalogCategoryOption[]
  products: Product[]
  breadcrumbLabel?: string
  headerDescription?: string
  headerTitle?: string
  initialFilters: FilterState
  initialPage: number
  initialSearch: string
}

function hasImage(product: Product) {
  return !!(product.images && product.images.length > 0)
}

function sortProducts(products: Product[]) {
  return [...products].sort((a, b) => {
    // 1. Featured first
    if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1
    // 2. With image before without
    const aImg = hasImage(a), bImg = hasImage(b)
    if (aImg !== bImg) return aImg ? -1 : 1
    // 3. Most recently modified
    const aDate = a.updated_at ? new Date(a.updated_at).getTime() : 0
    const bDate = b.updated_at ? new Date(b.updated_at).getTime() : 0
    return bDate - aDate
  })
}

function getFilteredProducts(allProducts: Product[], search: string, filters: FilterState) {
  const normalizedSearch = search.trim().toLowerCase()

  return allProducts.filter((product) => {
    const matchesSearch =
      normalizedSearch === "" ||
      product.title.toLowerCase().includes(normalizedSearch) ||
      (product.short_description ?? "").toLowerCase().includes(normalizedSearch) ||
      (product.part_brand?.name ?? "").toLowerCase().includes(normalizedSearch) ||
      product.code.toLowerCase().includes(normalizedSearch)
    const matchesQuality =
      filters.qualities.length === 0 || filters.qualities.includes(product.type)
    const matchesCategory =
      filters.categories.length === 0 ||
      filters.categories.includes(product.category?.key ?? "")
    const vehicleBrandKeys =
      product.compatibilities?.map((compatibility) =>
        compatibility.model?.brand?.name ? toVehicleBrandKey(compatibility.model.brand.name) : ""
      ) ?? []
    const matchesBrand =
      filters.carBrands.length === 0 ||
      filters.carBrands.some((brand) => vehicleBrandKeys.includes(brand))

    return matchesSearch && matchesQuality && matchesCategory && matchesBrand
  })
}

// For each dimension, count available options using all OTHER active filters.
// This ensures options never count to zero while selected, and correctly hides
// truly unavailable options given the current filter combination.
function computeFacetCounts(allProducts: Product[], search: string, filters: FilterState) {
  const forBrands = getFilteredProducts(allProducts, search, { ...filters, carBrands: [] })
  const forCategories = getFilteredProducts(allProducts, search, { ...filters, categories: [] })
  const forQualities = getFilteredProducts(allProducts, search, { ...filters, qualities: [] })

  const brandCounts: Record<string, number> = {}
  for (const product of forBrands) {
    const seen = new Set<string>()
    for (const compat of product.compatibilities ?? []) {
      const key = compat.model?.brand?.name ? toVehicleBrandKey(compat.model.brand.name) : ""
      if (key && !seen.has(key)) {
        seen.add(key)
        brandCounts[key] = (brandCounts[key] ?? 0) + 1
      }
    }
  }

  const categoryCounts: Record<string, number> = {}
  for (const product of forCategories) {
    const key = product.category?.key
    if (key) categoryCounts[key] = (categoryCounts[key] ?? 0) + 1
  }

  const qualityCounts: Record<string, number> = {}
  for (const product of forQualities) {
    qualityCounts[product.type] = (qualityCounts[product.type] ?? 0) + 1
  }

  return { brandCounts, categoryCounts, qualityCounts }
}

const QUALITY_LABEL = Object.fromEntries(
  CATALOG_QUALITY_OPTIONS.map((q) => [q.id, q.label])
) as Record<string, string>

function ActiveFilterChips({
  brands,
  categories,
  filters,
  search,
  onRemoveQuality,
  onRemoveCategory,
  onRemoveBrand,
  onClear,
}: {
  brands: PublicVehicleBrand[]
  categories: CatalogCategoryOption[]
  filters: FilterState
  search: string
  onRemoveQuality: (quality: string) => void
  onRemoveCategory: (category: string) => void
  onRemoveBrand: (brand: string) => void
  onClear: () => void
}) {
  const activeCount = countActiveFilters(filters) + (search ? 1 : 0)
  if (activeCount === 0) return null
  const brandLabels = new Map(brands.map((brand) => [brand.key, brand.name]))
  const categoryLabels = new Map(categories.map((category) => [category.id, category.label]))

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      {search && (
        <Chip label={`"${search}"`} onRemove={onClear} />
      )}
      {filters.qualities.map((quality) => (
        <Chip
          key={quality}
          label={QUALITY_LABEL[quality] ?? quality}
          onRemove={() => onRemoveQuality(quality)}
        />
      ))}
      {filters.categories.map((category) => (
        <Chip
          key={category}
          label={categoryLabels.get(category) ?? category}
          onRemove={() => onRemoveCategory(category)}
        />
      ))}
      {filters.carBrands.map((brand) => (
        <Chip
          key={brand}
          label={brandLabels.get(brand) ?? brand}
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
    <span className="inline-flex items-center gap-1.5 bg-white text-navy border border-[#d6dde6] text-xs font-semibold px-3 py-2 rounded-full">
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

function paginationItems(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const set = new Set([1, 2, page - 1, page, page + 1, total - 1, total].filter(p => p >= 1 && p <= total))
  const sorted = [...set].sort((a, b) => a - b)
  const result: (number | "…")[] = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("…")
    result.push(sorted[i])
  }
  return result
}

function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number
  totalPages: number
  onPage: (page: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-1 mt-10">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        aria-label="Página anterior"
        className="w-9.5 h-9.5 flex items-center justify-center rounded-md border border-[#d6dde6] text-slate-600 hover:border-navy hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {paginationItems(page, totalPages).map((item, idx) =>
        item === "…" ? (
          <span key={`ellipsis-${idx}`} className="w-9.5 h-9.5 flex items-center justify-center text-slate-400 text-sm select-none">
            …
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onPage(item)}
            aria-current={item === page ? "page" : undefined}
            className={`w-9.5 h-9.5 flex items-center justify-center rounded-[9px] text-sm font-semibold transition-colors border ${
              item === page
                ? "bg-brand border-brand text-white"
                : "border-[#d6dde6] text-slate-600 hover:border-navy hover:text-navy"
            }`}
          >
            {item}
          </button>
        )
      )}

      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        aria-label="Página siguiente"
        className="w-9.5 h-9.5 flex items-center justify-center rounded-md border border-[#d6dde6] text-slate-600 hover:border-navy hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  )
}

export default function CatalogoClient({
  brands,
  categories,
  products,
  breadcrumbLabel = "Catálogo",
  headerDescription,
  headerTitle = "Catálogo de repuestos",
  initialFilters,
  initialPage,
  initialSearch,
}: CatalogoClientProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [search, setSearch] = useState(initialSearch)
  const [filters, setFilters] = useState(initialFilters)
  const [page, setPage] = useState(initialPage)

  const filteredProducts = sortProducts(getFilteredProducts(products, search, filters))
  const facetCounts = computeFacetCounts(products, search, filters)
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / CATALOG_PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginatedProducts = filteredProducts.slice(
    (safePage - 1) * CATALOG_PAGE_SIZE,
    safePage * CATALOG_PAGE_SIZE
  )
  const activeCount = countActiveFilters(filters)

  function syncRoute(nextSearch: string, nextFilters: FilterState, nextPage: number) {
    const nextUrl = buildCatalogUrl(nextSearch, nextFilters, nextPage)

    startTransition(() => {
      router.replace(nextUrl, { scroll: false })
    })
  }

  function handleSearch(nextSearch: string) {
    setSearch(nextSearch)
    setPage(1)
    syncRoute(nextSearch, filters, 1)
  }

  function handleFiltersChange(nextFilters: FilterState) {
    setFilters(nextFilters)
    setPage(1)
    syncRoute(search, nextFilters, 1)
  }

  function handleClear() {
    setFilters(DEFAULT_CATALOG_FILTERS)
    setSearch("")
    setPage(1)
    syncRoute("", DEFAULT_CATALOG_FILTERS, 1)
  }

  function handlePage(nextPage: number) {
    setPage(nextPage)
    syncRoute(search, filters, nextPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const filterProps = {
    brands,
    categories,
    filters,
    onChange: handleFiltersChange,
    activeCount,
    onClear: handleClear,
    brandCounts: facetCounts.brandCounts,
    categoryCounts: facetCounts.categoryCounts,
    qualityCounts: facetCounts.qualityCounts,
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] pt-16">
      {/* Header band */}
      <div className="bg-navy px-4 sm:px-6 lg:px-8 pt-[30px] pb-[38px]">
        <div className="max-w-7xl mx-auto">
          <p className="text-3.25 font-medium text-[#9fb0c8]">
            Inicio <span className="text-[#5f7090]">/</span> <span className="text-white">{breadcrumbLabel}</span>
          </p>
          <div className="flex items-end justify-between mt-3 gap-4 flex-wrap">
            <div>
              <h1 className="font-display font-bold text-[#f4f7fb] uppercase leading-none text-[clamp(2rem,5vw,3.25rem)]">
                {headerTitle}
              </h1>
              {headerDescription && (
                <p className="max-w-3xl text-[#9fb0c8] text-3.75 mt-2 leading-relaxed">
                  {headerDescription}
                </p>
              )}
              <p className="text-[#9fb0c8] text-3.75 mt-2">
                <b className="text-white">{filteredProducts.length}</b>{" "}
                {filteredProducts.length === 1 ? "repuesto encontrado" : "repuestos encontrados"}
                {totalPages > 1 && <span className="text-[#5f7090]"> · Página {safePage} de {totalPages}</span>}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-slate-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64 sm:flex-none">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => handleSearch(event.target.value)}
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

              <Sheet>
                <SheetTrigger asChild>
                  <button className="lg:hidden relative inline-flex items-center gap-1.5 border border-slate-200 bg-white text-slate-700 text-sm font-medium px-3 py-2 rounded-md hover:border-navy/30 transition-colors shrink-0 min-h-9">
                    <SlidersHorizontal size={14} />
                    Filtros
                    {activeCount > 0 && (
                      <span className="bg-brand text-white text-2.25 font-bold rounded-full min-w-4 min-h-4 flex items-center justify-center px-1 leading-none">
                        {activeCount}
                      </span>
                    )}
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 px-6 pt-10 overflow-y-auto">
                  <CatalogFilters {...filterProps} />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-[266px] shrink-0">
            <div className="sticky top-30 bg-white rounded-[14px] border border-slate-200 p-5">
              <CatalogFilters {...filterProps} />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <h2 id="products-heading" className="sr-only">Listado de repuestos</h2>
            <AnimatePresence>
              {(activeCount > 0 || search) && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <ActiveFilterChips
                    brands={brands}
                    categories={categories}
                    filters={filters}
                    search={search}
                    onRemoveQuality={(quality) =>
                      handleFiltersChange({
                        ...filters,
                        qualities: filters.qualities.filter((item) => item !== quality),
                      })
                    }
                    onRemoveCategory={(category) =>
                      handleFiltersChange({
                        ...filters,
                        categories: filters.categories.filter((item) => item !== category),
                      })
                    }
                    onRemoveBrand={(brand) =>
                      handleFiltersChange({
                        ...filters,
                        carBrands: filters.carBrands.filter((item) => item !== brand),
                      })
                    }
                    onClear={handleClear}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {filteredProducts.length === 0 ? (
              <RequestPartForm searchQuery={search} />
            ) : (
              <>
                <ProductGrid products={paginatedProducts} />
                <Pagination page={safePage} totalPages={totalPages} onPage={handlePage} />
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
