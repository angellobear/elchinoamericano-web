import { toVehicleBrandKey } from "@/lib/vehicle-brands-public"
import type { Product } from "@/types"

const normalizeSearchText = (text: string) =>
  text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

// Every word of the query must appear somewhere in the product text, including
// compatible vehicle brands/models ("pastillas jetour x70" → pads listed for the X70).
export function matchesCatalogSearch(product: Product, search: string) {
  const tokens = normalizeSearchText(search).split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return true

  const haystack = normalizeSearchText(
    [
      product.title,
      product.short_title,
      product.short_description,
      product.sku,
      product.part_number,
      product.code,
      ...(product.alternate_codes ?? []).map((ac) => ac.code),
      product.part_brand?.name,
      ...(product.compatibilities ?? []).flatMap((c) => [c.model?.brand?.name, c.model?.name]),
    ]
      .filter(Boolean)
      .join(" ")
  )
  return tokens.every((token) => haystack.includes(token))
}

// Compatible vehicle labels for the product card. Models that best match the
// search go first and are flagged so the card can highlight why it showed up.
export function getCompatibleModelLabels(product: Product, search = "") {
  const tokens = normalizeSearchText(search).split(/\s+/).filter(Boolean)
  const labels = [
    ...new Set(
      (product.compatibilities ?? [])
        .filter((c) => c.model?.name)
        .map((c) => [c.model?.brand?.name, c.model?.name].filter(Boolean).join(" "))
    ),
  ]
  const scored = labels.map((label) => {
    const text = normalizeSearchText(label)
    return { label, score: tokens.filter((token) => text.includes(token)).length }
  })
  const best = Math.max(0, ...scored.map((item) => item.score))
  return scored
    .sort((a, b) => b.score - a.score)
    .map(({ label, score }) => ({ label, matched: best > 0 && score === best }))
}

// Orden público del catálogo: destacados → con imagen → más recientes por fecha de creación.
// Se aplica una sola vez en getPublicProducts(); filtrar conserva el orden.
export function sortCatalogProducts(products: Product[]) {
  const created = (p: Product) => (p.created_at ? new Date(p.created_at).getTime() : 0)
  return [...products].sort((a, b) =>
    Number(!!b.is_featured) - Number(!!a.is_featured) ||
    Number(!!b.images?.length) - Number(!!a.images?.length) ||
    created(b) - created(a)
  )
}

export function filterCatalogProducts(
  allProducts: Product[],
  search: string,
  qualities: string[],
  categories: string[],
  carBrands: string[],
) {
  return allProducts.filter((product) => {
    const matchesSearch = matchesCatalogSearch(product, search)
    const matchesQuality =
      qualities.length === 0 || qualities.includes(product.type)
    const matchesCategory =
      categories.length === 0 || categories.includes(product.category?.key ?? "")
    const vehicleBrandKeys =
      product.compatibilities?.map((compatibility) =>
        compatibility.model?.brand?.name ? toVehicleBrandKey(compatibility.model.brand.name) : ""
      ) ?? []
    const matchesBrand =
      carBrands.length === 0 ||
      carBrands.some((brand) => vehicleBrandKeys.includes(brand))

    return matchesSearch && matchesQuality && matchesCategory && matchesBrand
  })
}
