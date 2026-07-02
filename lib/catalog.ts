export const CATALOG_PAGE_SIZE = 9
export const CATALOG_ARRAY_SEPARATOR = "|"
export const CATALOG_BRAND_PATH_SEPARATOR = "-"

export const CATALOG_QUALITY_OPTIONS = [
  { id: "original", label: "Original" },
  { id: "oem", label: "OEM" },
  { id: "aftermarket", label: "Alterno" },
] as const

export interface FilterState {
  qualities: string[]
  categories: string[]
  carBrands: string[]
}

export const DEFAULT_CATALOG_FILTERS: FilterState = {
  qualities: [],
  categories: [],
  carBrands: [],
}

export function countActiveFilters(filters: FilterState): number {
  return filters.qualities.length + filters.categories.length + filters.carBrands.length
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
  calidad?: string | string[]
  categoria?: string | string[]
  marca?: string | string[]
  pagina?: string | string[]
}) {
  const search = typeof searchParams.q === "string" ? searchParams.q : ""
  const qualities = parseArrayParam(
    typeof searchParams.calidad === "string" ? searchParams.calidad : null
  )
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
      qualities,
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
  if (filters.qualities.length) {
    params.set("calidad", filters.qualities.join(CATALOG_ARRAY_SEPARATOR))
  }
  if (filters.categories.length) {
    params.set("categoria", filters.categories.join(CATALOG_ARRAY_SEPARATOR))
  }
  if (page > 1) params.set("pagina", String(page))

  const queryString = params.toString()
  return queryString ? `${basePath}?${queryString}` : basePath
}
