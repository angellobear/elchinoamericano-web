import type { Metadata } from "next"
import type { Product } from "@/types"
import { buildProductPath } from "@/lib/product-slugs"
import { SITE_NAME, SITE_URL, SITE_LOCALE } from "@/lib/constants/site"
import { displayVehicleModelName } from "@/lib/vehicle-models"

export { SITE_NAME, SITE_URL, SITE_LOCALE }

export const SITE_DESCRIPTION =
  "Repuestos automotrices originales, OEM y alternos para vehiculos chinos y americanos en Ecuador. Tienda en Quito con envios a todo el pais. Asesoria por WhatsApp."
export const DEFAULT_SHARE_IMAGE_PATH = "/og-image.png"
export const DEFAULT_SHARE_IMAGE_ALT = "El Chino Americano, repuestos automotrices en Ecuador"
export const DEFAULT_SHARE_IMAGE_WIDTH = 1536
export const DEFAULT_SHARE_IMAGE_HEIGHT = 1024
export const DEFAULT_PRODUCT_IMAGE_PATH = "/share-default-product.png"
export const DEFAULT_PRODUCT_IMAGE_ALT = "Imagen referencial del producto"
export const DEFAULT_KEYWORDS = [
  "repuestos automotrices Ecuador",
  "repuestos para vehiculos chinos Ecuador",
  "repuestos para vehiculos americanos Ecuador",
  "repuestos Quito Ecuador",
  "catalogo de repuestos Ecuador",
  "repuestos por WhatsApp Ecuador",
  "repuestos automotrices Quito",
]
export const GEO_REGION = "EC-P"
export const GEO_PLACENAME = "Quito, Pichincha, Ecuador"
// Pin del local "El Chino Americano - Repuestos" en Google Maps (mismo que contactInfo.map.embedUrl)
export const GEO_POSITION = "-0.2919618;-78.4825777"

export function toAbsoluteUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }

  return new URL(path.startsWith("/") ? path : `/${path}`, SITE_URL).toString()
}

export function getProductPrimaryImage(product: Product) {
  return (
    product.images?.find((image) => image.is_primary)?.url ??
    product.images?.[0]?.url ??
    null
  )
}

export const FALLBACK_PART_BRAND = "ALTERNO"

// ponytail: sin marca registrada = repuesto alterno; Google exige brand junto a mpn
export function getPartBrandName(product: Product) {
  return product.part_brand?.name ?? FALLBACK_PART_BRAND
}

export function getProductDisplayImage(product: Product) {
  return getProductPrimaryImage(product) ?? DEFAULT_PRODUCT_IMAGE_PATH
}

export function getProductShareImage(product: Product) {
  return toAbsoluteUrl(getProductPrimaryImage(product) ?? DEFAULT_PRODUCT_IMAGE_PATH)
}

export function getProductShareImageAlt(product: Product) {
  return getProductPrimaryImage(product)
    ? `${product.title} ${product.part_brand?.name ?? ""}`.trim()
    : `${product.title} - ${DEFAULT_PRODUCT_IMAGE_ALT}`
}

export function getProductUrl(product: Product) {
  return toAbsoluteUrl(buildProductPath(product))
}

function buildCompatSuffix(product: Product): string {
  if (!product.compatibilities?.length) return ""
  const brands = [...new Set(
    product.compatibilities.map(c => c.model?.brand?.name).filter((v): v is string => Boolean(v))
  )]
  const models = [...new Set(
    product.compatibilities
      .map(c => `${c.model?.brand?.name ?? ""} ${c.model?.name ?? ""}`.trim())
      .filter(Boolean)
  )]
  const list = models.length <= 4 ? models : brands
  return ` Compatible con: ${list.join(", ")}.`
}

interface CompatModel {
  brand: string
  model: string
  label: string
  years: string
  displacement: string
}

function getCompatModels(product: Product): CompatModel[] {
  const seen = new Set<string>()
  const result: CompatModel[] = []
  for (const compat of product.compatibilities ?? []) {
    const brand = compat.model?.brand?.name ?? ""
    const model = displayVehicleModelName(compat.model?.name ?? "")
    const label = `${brand} ${model}`.trim()
    if (!label || seen.has(label)) continue
    seen.add(label)
    const start = compat.model?.year_start
    const end = compat.model?.year_end
    result.push({
      brand,
      model,
      label,
      years: start ? (end ? (end === start ? `${start}` : `${start}-${end}`) : `${start}+`) : "",
      // "Ranger 3.2" + cilindrada "3.2" → no repetir
      displacement: compat.model?.displacement && !model.includes(compat.model.displacement) ? compat.model.displacement : "",
    })
  }
  return result
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function collapse(value: string) {
  return value.replace(/\s+/g, " ").replace(/\.{2,}/g, ".").trim()
}

// ponytail: muchos títulos se cargaron en MAYÚSCULAS ("FILTRO DE ACEITE PARA FORD-EXPLORER").
// Se pasa a oración y se restaura el casing real de marca/modelo desde las compatibilidades.
export function normalizeProductTitle(product: Product) {
  let title = collapse(product.title)
  const letters = title.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, "")
  if (letters && letters === letters.toUpperCase()) {
    title = title.toLowerCase()
    title = title.charAt(0).toUpperCase() + title.slice(1)
  }
  const names = new Set<string>()
  for (const m of getCompatModels(product)) {
    if (m.brand) names.add(m.brand)
    if (m.model) names.add(m.model)
    for (const word of m.model.split(" ")) if (/^\p{L}{3,}$/u.test(word)) names.add(word)
  }
  if (product.part_brand?.name) names.add(product.part_brand.name)
  for (const name of names) {
    const pattern = new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(name)}(?=$|[^\\p{L}\\p{N}])`, "giu")
    title = title.replace(pattern, (_, prefix: string) => `${prefix}${name}`)
  }
  // "Ford-Explorer" → "Ford Explorer"
  for (const m of getCompatModels(product)) {
    if (m.brand && m.model) title = title.replace(`${m.brand}-${m.model}`, `${m.brand} ${m.model}`)
  }
  return title
}

const SEO_TITLE_MAX = 65

export function getProductSeoTitle(product: Product) {
  if (product.meta_title) return product.meta_title

  const base = normalizeProductTitle(product)
  const parts = [base]
  const partBrand = product.part_brand?.name
  if (partBrand && !base.toLowerCase().includes(partBrand.toLowerCase())) parts.push(partBrand)
  const models = getCompatModels(product)
  // ponytail: años solo con un único modelo compatible; con varios el título se vuelve ilegible
  if (models.length === 1 && models[0].years && !/\b(19|20)\d{2}\b/.test(base)) parts.push(models[0].years)

  const core = collapse(parts.join(" "))
  const withSite = `${core} | ${SITE_NAME}`
  return withSite.length <= SEO_TITLE_MAX ? withSite : core
}

export function getProductSeoDescription(product: Product, typeLabel: string) {
  const compatSuffix = buildCompatSuffix(product)
  const partNumber = product.part_number?.trim()
  const partText = partNumber ? ` N° de parte: ${partNumber}.` : ""

  if (product.meta_description) {
    // Concatenate — never override
    return `${product.meta_description}${compatSuffix}${partText}`
  }

  const models = getCompatModels(product)
  const modelTexts = models.map((m) => collapse([m.label, m.displacement, m.years].filter(Boolean).join(" ")))
  const compatText = modelTexts.length
    ? ` Compatible con ${modelTexts.slice(0, 3).join(", ")}${modelTexts.length > 3 ? " y más" : ""}.`
    : product.short_description
      ? ` ${product.short_description.replace(/[.\s]+$/, "")}.`
      : ""
  const partBrand = product.part_brand?.name
  const base = normalizeProductTitle(product)
  const brandText = partBrand && !base.toLowerCase().includes(partBrand.toLowerCase()) ? ` ${partBrand}` : ""

  // ponytail: los números de parte OEM/Ford se buscan tal cual en Google ("FB5Z-18124-U")
  const oemCodes = (product.alternate_codes ?? []).map((ac) => ac.code).slice(0, 2)
  const oemText = oemCodes.length ? ` Ref. OEM: ${oemCodes.join(", ")}.` : ""

  return collapse(
    `${base}${brandText} (${typeLabel}).${compatText}${partText}${oemText} Precio referencial: $${(product.offer_price ?? product.price).toFixed(2)}. Envíos a todo Ecuador desde Quito.`,
  )
}

export function buildCatalogMetadata(
  title: string,
  description: string,
  canonicalPath: string,
  options?: { extraKeywords?: string[]; ogDescription?: string; imageAlt?: string },
): Metadata {
  const ogDescription = options?.ogDescription ?? description
  const imageAlt = options?.imageAlt ?? title
  const absoluteUrl = toAbsoluteUrl(canonicalPath)
  return {
    title,
    description,
    keywords: [...(options?.extraKeywords ?? []), ...DEFAULT_KEYWORDS],
    alternates: { canonical: canonicalPath },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description: ogDescription,
      type: "website",
      locale: SITE_LOCALE,
      siteName: SITE_NAME,
      url: absoluteUrl,
      images: [{ url: toAbsoluteUrl(DEFAULT_SHARE_IMAGE_PATH), alt: imageAlt, width: DEFAULT_SHARE_IMAGE_WIDTH, height: DEFAULT_SHARE_IMAGE_HEIGHT }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: ogDescription,
      images: [toAbsoluteUrl(DEFAULT_SHARE_IMAGE_PATH)],
    },
  }
}
