import assert from "node:assert"
import { getProductSeoDescription, getProductSeoTitle } from "../lib/seo"
import type { Product } from "../types"

const ford = (name: string, year_start?: number, year_end?: number | null, displacement?: string) => ({
  model: { name, displacement, year_start, year_end, brand: { name: "Ford" } },
})

const filter = {
  title: "FILTRO DE ACEITE PARA FORD-EXPLORER",
  price: 3.53,
  type: "aftermarket",
  part_brand: { name: "Advance Filters" },
  short_description: "Filtro de aceite para Ford Explorer 3.5L, F-150 y Edge, marca Advance Filters.",
  compatibilities: [ford("Explorer", 2011, 2019, "3.5L")],
} as unknown as Product

assert.strictEqual(getProductSeoTitle(filter), "Filtro de aceite para Ford Explorer Advance Filters 2011-2019")
const desc = getProductSeoDescription(filter, "Alterno / Aftermarket")
assert.strictEqual(
  desc,
  "Filtro de aceite para Ford Explorer Advance Filters (Alterno / Aftermarket). Compatible con Ford Explorer 3.5L 2011-2019. Precio referencial: $3.53. Envíos a todo Ecuador desde Quito.",
)

// marca de pieza ya incluida en el título, sin marca → sin doble espacio ni duplicado
const shock = {
  title: "Amortiguador delantero GSP Ford Escape",
  price: 63.25,
  part_brand: { name: "GSP" },
  compatibilities: [ford("Escape"), ford("Escape")],
} as unknown as Product
assert.strictEqual(getProductSeoTitle(shock), "Amortiguador delantero GSP Ford Escape | El Chino Americano")

const mount = { title: "Base de motor  Ford Ranger", price: 47.83, short_description: "Reduce vibraciones.." } as unknown as Product
assert.strictEqual(getProductSeoTitle(mount), "Base de motor Ford Ranger | El Chino Americano")
assert(!getProductSeoDescription(mount, "Alterno").includes(".."))

// meta_title manual siempre gana
assert.strictEqual(getProductSeoTitle({ ...filter, meta_title: "Manual" } as Product), "Manual")

console.log("OK product SEO title/description")

// modelos en MAYÚSCULAS y con cilindrada en el nombre (datos reales del admin)
const pump = {
  title: "BOMBA AGUA FORD RANGER",
  price: 103.01,
  part_brand: { name: "Magiaty" },
  compatibilities: [{ model: { name: "RANGER 3.2", displacement: "3.2", year_start: 2017, year_end: 2020, brand: { name: "Ford" } } }],
} as unknown as Product
assert.strictEqual(getProductSeoTitle(pump), "Bomba agua Ford Ranger Magiaty 2017-2020 | El Chino Americano")
assert(getProductSeoDescription(pump, "Alterno").includes("Compatible con Ford Ranger 3.2 2017-2020."))
console.log("OK uppercase model names")

// números de parte OEM/Ford entran en la descripción
const oem = { ...filter, alternate_codes: [{ code: "FL-820S", source: "Motorcraft" }, { code: "AA5Z-6731-A" }, { code: "X" }] } as unknown as Product
assert(getProductSeoDescription(oem, "Alterno").includes("Ref. OEM: FL-820S, AA5Z-6731-A."))
console.log("OK OEM codes in description")
