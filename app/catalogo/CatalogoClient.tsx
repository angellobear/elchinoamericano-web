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
import { products } from "@/data/products"
import {
  buildCatalogUrl,
  CATALOG_PAGE_SIZE,
  CATALOG_PRICE_RANGES,
  countActiveFilters,
  DEFAULT_CATALOG_FILTERS,
  type FilterState,
} from "@/lib/catalog"
import { toVehicleBrandKey, type PublicVehicleBrand } from "@/lib/vehicle-brands-public"

interface CatalogoClientProps {
  brands: PublicVehicleBrand[]
  initialFilters: FilterState
  initialPage: number
  initialSearch: string
}

function getFilteredProducts(search: string, filters: FilterState) {
  const normalizedSearch = search.trim().toLowerCase()
  const selectedPriceRange =
    CATALOG_PRICE_RANGES.find((range) => range.id === filters.priceRange) ??
    CATALOG_PRICE_RANGES[0]

  return products.filter((product) => {
    const effectivePrice = product.offer_price ?? product.price
    const matchesSearch =
      normalizedSearch === "" ||
      product.title.toLowerCase().includes(normalizedSearch) ||
      (product.short_description ?? "").toLowerCase().includes(normalizedSearch) ||
      (product.part_brand?.name ?? "").toLowerCase().includes(normalizedSearch) ||
      product.code.toLowerCase().includes(normalizedSearch)
    const matchesPrice =
      effectivePrice >= selectedPriceRange.min &&
      (selectedPriceRange.max === Infinity
        ? true
        : effectivePrice <= selectedPriceRange.max)
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

    return matchesSearch && matchesPrice && matchesCategory && matchesBrand
  })
}

function ActiveFilterChips({
  brands,
  filters,
  search,
  onRemoveCategory,
  onRemoveBrand,
  onRemovePrice,
  onClear,
}: {
  brands: PublicVehicleBrand[]
  filters: FilterState
  search: string
  onRemoveCategory: (category: string) => void
  onRemoveBrand: (brand: string) => void
  onRemovePrice: () => void
  onClear: () => void
}) {
  const activeCount = countActiveFilters(filters) + (search ? 1 : 0)
  if (activeCount === 0) return null
  const brandLabels = new Map(brands.map((brand) => [brand.key, brand.name]))

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      {search && (
        <Chip label={`"${search}"`} onRemove={onClear} />
      )}
      {filters.priceRange !== "all" && (
        <Chip
          label={
            CATALOG_PRICE_RANGES.find((range) => range.id === filters.priceRange)?.label ?? ""
          }
          onRemove={onRemovePrice}
        />
      )}
      {filters.categories.map((category) => (
        <Chip
          key={category}
          label={category.charAt(0).toUpperCase() + category.slice(1)}
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
  onPage: (page: number) => void
}) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

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

      {pages.map((currentPage) => (
        <button
          key={currentPage}
          onClick={() => onPage(currentPage)}
          aria-current={currentPage === page ? "page" : undefined}
          className={`w-9 h-9 flex items-center justify-center rounded-md text-sm font-semibold transition-colors border ${
            currentPage === page
              ? "bg-navy border-navy text-white"
              : "border-slate-200 text-slate-600 hover:border-navy hover:text-navy"
          }`}
        >
          {currentPage}
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

export default function CatalogoClient({
  brands,
  initialFilters,
  initialPage,
  initialSearch,
}: CatalogoClientProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [search, setSearch] = useState(initialSearch)
  const [filters, setFilters] = useState(initialFilters)
  const [page, setPage] = useState(initialPage)

  const filteredProducts = getFilteredProducts(search, filters)
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

  return (
    <main className="min-h-screen bg-[#f6f8fb] pt-16">
      {/* Header band */}
      <div className="bg-navy px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-3.25 text-[#9fb0c8]">
            Inicio <span className="text-[#5f7090]">/</span> <span className="text-white">Catálogo</span>
          </p>
          <div className="flex items-end justify-between mt-3 gap-4 flex-wrap">
            <div>
              <h1 className="font-display font-bold text-[#f4f7fb] uppercase leading-none text-[clamp(2rem,5vw,3.25rem)]">
                Catálogo de repuestos
              </h1>
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
                  <CatalogFilters
                    brands={brands}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-30 bg-white rounded-xl border border-slate-200 p-5">
              <CatalogFilters
                brands={brands}
                filters={filters}
                onChange={handleFiltersChange}
                activeCount={activeCount}
                onClear={handleClear}
              />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
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
                    filters={filters}
                    search={search}
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
                    onRemovePrice={() =>
                      handleFiltersChange({ ...filters, priceRange: "all" })
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
