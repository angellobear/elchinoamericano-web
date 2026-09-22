import type { Product } from "@/types"
import { toVehicleBrandKey } from "@/lib/vehicle-brands-public"

// ponytail: los modelos se cargaron en MAYÚSCULAS y a veces con cilindrada ("RANGER 3.2").
// Palabras solo-letras en mayúsculas de 3+ letras → Capitalizadas (QQ, ZS quedan);
// lo que lleva dígitos (F-150, 3.2, CS55) queda igual.
export function displayVehicleModelName(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => (/^[A-ZÁÉÍÓÚÑ]{3,}$/.test(word) ? word.charAt(0) + word.slice(1).toLowerCase() : word))
    .join(" ")
}

// Solo cilindrada con decimal ("RANGER 3.2", "EXPLORER 4.0L"); "TIGGO 2" o "F 150" son parte del modelo
export function stripDisplacement(name: string) {
  return name.trim().replace(/\s+\d\.\d\s*L?$/i, "")
}

// Clave de agrupación: "ECO SPORT", "EcoSport" y "ECOSPORT 2.0" → "ecosport"
export function vehicleModelKey(name: string) {
  return stripDisplacement(name)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
}

export function vehicleModelSlug(name: string) {
  return stripDisplacement(name)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

// Nombre comercial cuando el casing automático no alcanza ("ECO SPORT" → "Eco Sport" ≠ "EcoSport")
const OFFICIAL_MODEL_NAMES: Record<string, string> = {
  ecosport: "EcoSport",
}

export interface VehicleModelGroup {
  key: string
  slug: string
  name: string
  brandName: string
  products: Product[]
  displacements: string[]
  yearStart?: number
  yearEnd?: number | null
}

// Agrupa las compatibilidades de una marca en modelos únicos; nombre y slug salen de la variante con más productos.
export function groupVehicleModels(products: Product[], brandName: string): VehicleModelGroup[] {
  const groups = new Map<
    string,
    { products: Map<number, Product>; names: Map<string, number>; displacements: Set<string>; starts: number[]; ends: (number | null)[] }
  >()
  const brandKey = toVehicleBrandKey(brandName)

  for (const product of products) {
    for (const compat of product.compatibilities ?? []) {
      const model = compat.model
      if (!model?.name || !model.brand?.name || toVehicleBrandKey(model.brand.name) !== brandKey) continue
      const key = vehicleModelKey(model.name)
      if (!key) continue
      const group = groups.get(key) ?? {
        products: new Map<number, Product>(),
        names: new Map<string, number>(),
        displacements: new Set<string>(),
        starts: [] as number[],
        ends: [] as (number | null)[],
      }
      if (!group.products.has(product.id)) {
        group.products.set(product.id, product)
        const display = displayVehicleModelName(stripDisplacement(model.name))
        group.names.set(display, (group.names.get(display) ?? 0) + 1)
      }
      const displacement = model.displacement ?? model.name.match(/\d+\.\d+/)?.[0]
      if (displacement) group.displacements.add(displacement)
      if (model.year_start) group.starts.push(model.year_start)
      if (model.year_start) group.ends.push(model.year_end ?? null)
      groups.set(key, group)
    }
  }

  return [...groups]
    .map(([key, group]) => {
      const name = OFFICIAL_MODEL_NAMES[key] ?? [...group.names].sort((a, b) => b[1] - a[1])[0][0]
      // ponytail: slug con menos guiones entre variantes ("ECOSPORT" gana a "ECO SPORT"): es como se busca
      const slug = [...group.names.keys()]
        .map(vehicleModelSlug)
        .sort((a, b) => a.split("-").length - b.split("-").length)[0]
      return {
        key,
        slug,
        name,
        brandName,
        products: [...group.products.values()],
        displacements: [...group.displacements].sort(),
        yearStart: group.starts.length ? Math.min(...group.starts) : undefined,
        yearEnd: group.ends.length ? (group.ends.includes(null) ? null : Math.max(...(group.ends as number[]))) : undefined,
      }
    })
    .sort((a, b) => b.products.length - a.products.length)
}

export function formatModelYears(group: Pick<VehicleModelGroup, "yearStart" | "yearEnd">) {
  if (!group.yearStart) return ""
  if (group.yearEnd === null) return `${group.yearStart} en adelante`
  return group.yearEnd && group.yearEnd !== group.yearStart ? `${group.yearStart}–${group.yearEnd}` : `${group.yearStart}`
}
