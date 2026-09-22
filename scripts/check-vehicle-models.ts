import assert from "node:assert"
import { formatModelYears, groupVehicleModels, vehicleModelKey, vehicleModelSlug } from "../lib/vehicle-models"
import type { Product } from "../types"

// variantes sucias reales del admin → mismo modelo
assert.strictEqual(vehicleModelKey("ECO SPORT"), vehicleModelKey("ECOSPORT"))
assert.strictEqual(vehicleModelKey("RANGER 3.2"), vehicleModelKey("RANGER"))
assert.strictEqual(vehicleModelKey("EXPLORER "), vehicleModelKey("Explorer"))
assert.strictEqual(vehicleModelKey("F-150"), vehicleModelKey("f-150".replace(/-/g, " ")))
assert.strictEqual(vehicleModelSlug("F-150 "), "f-150")
assert.strictEqual(vehicleModelSlug("FIESTA POWER"), "fiesta-power")

const p = (id: number, ...models: [string, string, number?, (number | null)?][]) =>
  ({
    id,
    compatibilities: models.map(([brand, name, year_start, year_end]) => ({
      model: { name, year_start, year_end, brand: { name: brand } },
    })),
  }) as unknown as Product

const groups = groupVehicleModels(
  [
    p(1, ["Ford", "ECO SPORT", 2004, 2012]),
    p(2, ["Ford", "ECO SPORT", 2013, 2020]),
    p(3, ["Ford", "ECOSPORT"], ["Chevrolet", "AVEO"]),
    p(4, ["Ford", "RANGER 3.2", 2017, null]),
  ],
  "Ford",
)
assert.deepStrictEqual(groups.map((g) => [g.slug, g.name, g.products.length]), [
  ["ecosport", "Eco Sport", 3],
  ["ranger", "Ranger", 1],
])
assert.deepStrictEqual(groups[1].displacements, ["3.2"])
assert.strictEqual(formatModelYears(groups[0]), "2004–2020")
assert.strictEqual(formatModelYears(groups[1]), "2017 en adelante")
console.log("OK vehicle model grouping")
// modelos chinos con número NO se fusionan
assert.notStrictEqual(vehicleModelKey("TIGGO 2"), vehicleModelKey("TIGGO 7"))
assert.strictEqual(vehicleModelSlug("TIGGO 2 PRO"), "tiggo-2-pro")
console.log("OK numbered models stay separate")
