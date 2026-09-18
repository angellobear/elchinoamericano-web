import assert from "node:assert"
import { getCompatibleModelLabels, matchesCatalogSearch, sortCatalogProducts } from "../lib/catalog-products"
import type { Product } from "../types"

const pads = {
  title: "Pastillas de freno delanteras",
  code: "PF-001",
  compatibilities: [
    { model: { name: "CS55", brand: { name: "Changan" } } },
    { model: { name: "X70", brand: { name: "Jetour" } } },
  ],
} as unknown as Product

assert(matchesCatalogSearch(pads, "pastillas jetour x70"))
assert(matchesCatalogSearch(pads, "X70"))
assert(matchesCatalogSearch(pads, "  changan  "))
assert(matchesCatalogSearch(pads, "pf-001"))
assert(matchesCatalogSearch(pads, ""))
assert(!matchesCatalogSearch(pads, "pastillas chery"))
assert.deepStrictEqual(getCompatibleModelLabels(pads, "pastillas jetour x70"), [
  { label: "Jetour X70", matched: true },
  { label: "Changan CS55", matched: false },
])
assert(getCompatibleModelLabels(pads).every((model) => !model.matched))
console.log("catalog search OK")

// Orden: destacado → con imagen → creado más reciente (la fecha de modificación no cuenta)
const item = (id: number, over: Partial<Product>) => ({ id, ...over }) as unknown as Product
const img = [{ url: "x" }] as unknown as Product["images"]
assert.deepStrictEqual(
  sortCatalogProducts([
    item(1, { created_at: "2026-01-01", updated_at: "2026-09-01", images: img }),
    item(2, { created_at: "2026-05-01", images: img }),
    item(3, { created_at: "2026-08-01" }),
    item(4, { created_at: "2025-01-01", is_featured: true }),
  ]).map((p) => p.id),
  [4, 2, 1, 3],
)
