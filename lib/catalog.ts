export const CATALOG_PAGE_SIZE = 8
export const CATALOG_ARRAY_SEPARATOR = "|"
export const CATALOG_BRAND_PATH_SEPARATOR = "-"

export interface FilterState {
  priceRange: string
  categories: string[]
  carBrands: string[]
}

export const DEFAULT_CATALOG_FILTERS: FilterState = {
  priceRange: "all",
  categories: [],
  carBrands: [],
}

export const CATALOG_PRICE_RANGES = [
  { id: "all", label: "Todos los precios", min: 0, max: Infinity },
  { id: "lt20", label: "Menos de $20", min: 0, max: 20 },
  { id: "20-50", label: "$20 a $50", min: 20, max: 50 },
  { id: "50-100", label: "$50 a $100", min: 50, max: 100 },
  { id: "gt100", label: "Más de $100", min: 100, max: Infinity },
] as const

export function countActiveFilters(filters: FilterState): number {
  let total = 0

  if (filters.priceRange !== "all") total += 1
  total += filters.categories.length
  total += filters.carBrands.length

  return total
}

export function parseArrayParam(value: string | null): string[] {
  if (!value) return []
  return value.split(CATALOG_ARRAY_SEPARATOR).filter(Boolean)
}

export function parseCatalogPage(value: string | null | undefined): number {
  const page = Number(value ?? "1")
  if (!Number.isFinite(page)) return 1

  return Math.max(1, Math.floor(page))
}

export function parseCatalogFilters(searchParams: {
  q?: string | string[]
  precio?: string | string[]
  categoria?: string | string[]
  marca?: string | string[]
  pagina?: string | string[]
}) {
  const search = typeof searchParams.q === "string" ? searchParams.q : ""
  const priceRange =
    typeof searchParams.precio === "string"
      ? searchParams.precio
      : DEFAULT_CATALOG_FILTERS.priceRange
  const categories = parseArrayParam(
    typeof searchParams.categoria === "string" ? searchParams.categoria : null
  )
  const carBrands = parseArrayParam(
    typeof searchParams.marca === "string" ? searchParams.marca : null
  )
  const page = parseCatalogPage(
    typeof searchParams.pagina === "string" ? searchParams.pagina : undefined
  )

  return {
    search,
    filters: {
      priceRange,
      categories,
      carBrands,
    },
    page,
  }
}

function normalizeBrandKeys(brandKeys: string[]) {
  return [...new Set(brandKeys.filter(Boolean))].sort((a, b) => a.localeCompare(b))
}

export function parseCatalogBrandSlug(value: string) {
  return normalizeBrandKeys(value.split(CATALOG_BRAND_PATH_SEPARATOR))
}

export function buildCatalogBrandPath(brandKeys: string[]) {
  const normalizedBrandKeys = normalizeBrandKeys(brandKeys)

  if (normalizedBrandKeys.length === 0) return "/catalogo"

  return `/catalogo/marca/${normalizedBrandKeys.join(CATALOG_BRAND_PATH_SEPARATOR)}`
}

export function buildCatalogUrl(search: string, filters: FilterState, page: number) {
  const params = new URLSearchParams()
  const basePath =
    filters.carBrands.length > 0 ? buildCatalogBrandPath(filters.carBrands) : "/catalogo"

  if (search) params.set("q", search)
  if (filters.priceRange !== "all") params.set("precio", filters.priceRange)
  if (filters.categories.length) {
    params.set("categoria", filters.categories.join(CATALOG_ARRAY_SEPARATOR))
  }
  if (page > 1) params.set("pagina", String(page))

  const queryString = params.toString()
  return queryString ? `${basePath}?${queryString}` : basePath
}
