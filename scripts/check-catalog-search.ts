import assert from "node:assert"
import { getCompatibleModelLabels, matchesCatalogSearch } from "../lib/catalog-products"
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
