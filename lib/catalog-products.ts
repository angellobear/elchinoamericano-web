import { CATALOG_PRICE_RANGES } from "@/lib/catalog"
import { toVehicleBrandKey } from "@/lib/vehicle-brands-public"
import type { Product } from "@/types"

export function filterCatalogProducts(
  allProducts: Product[],
  search: string,
  priceRangeId: string,
  categories: string[],
  carBrands: string[],
) {
  const normalizedSearch = search.trim().toLowerCase()
  const selectedPriceRange =
    CATALOG_PRICE_RANGES.find((range) => range.id === priceRangeId) ??
    CATALOG_PRICE_RANGES[0]

  return allProducts.filter((product) => {
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
      categories.length === 0 || categories.includes(product.category?.key ?? "")
    const vehicleBrandKeys =
      product.compatibilities?.map((compatibility) =>
        compatibility.model?.brand?.name ? toVehicleBrandKey(compatibility.model.brand.name) : ""
      ) ?? []
    const matchesBrand =
      carBrands.length === 0 ||
      carBrands.some((brand) => vehicleBrandKeys.includes(brand))

    return matchesSearch && matchesPrice && matchesCategory && matchesBrand
  })
}
