import { toVehicleBrandKey } from "@/lib/vehicle-brands-public"
import type { Product } from "@/types"

export function filterCatalogProducts(
  allProducts: Product[],
  search: string,
  qualities: string[],
  categories: string[],
  carBrands: string[],
) {
  const normalizedSearch = search.trim().toLowerCase()

  return allProducts.filter((product) => {
    const matchesSearch =
      normalizedSearch === "" ||
      product.title.toLowerCase().includes(normalizedSearch) ||
      (product.short_description ?? "").toLowerCase().includes(normalizedSearch) ||
      (product.part_brand?.name ?? "").toLowerCase().includes(normalizedSearch) ||
      product.code.toLowerCase().includes(normalizedSearch)
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
