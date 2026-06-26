import type { Metadata } from "next"
import type { Product } from "@/types"
import { buildProductPath } from "@/lib/product-slugs"
import { SITE_NAME, SITE_URL, SITE_LOCALE } from "@/lib/constants/site"

export { SITE_NAME, SITE_URL, SITE_LOCALE }

export const SITE_DESCRIPTION =
  "Repuestos automotrices originales, OEM y alternos para vehiculos chinos y americanos en Ecuador. Asesoria por WhatsApp, catalogo con filtros y envios a nivel nacional."
export const DEFAULT_SHARE_IMAGE_PATH = "/og-image.png"
export const DEFAULT_SHARE_IMAGE_ALT = "El Chino Americano, repuestos automotrices en Ecuador"
export const DEFAULT_SHARE_IMAGE_WIDTH = 1536
export const DEFAULT_SHARE_IMAGE_HEIGHT = 1024
export const DEFAULT_PRODUCT_IMAGE_PATH = "/share-default-product.png"
export const DEFAULT_PRODUCT_IMAGE_ALT = "Imagen referencial del producto"
export const DEFAULT_KEYWORDS = [
  "repuestos automotrices Ecuador",
  "repuestos para vehiculos chinos",
  "repuestos para vehiculos americanos",
  "repuestos Santo Domingo Ecuador",
  "catalogo de repuestos Ecuador",
  "repuestos por WhatsApp Ecuador",
]
export const GEO_REGION = "EC-SD"
export const GEO_PLACENAME = "Santo Domingo de los Tsachilas, Ecuador"
export const GEO_POSITION = "-0.24986;-79.20380"

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

export function getProductSeoDescription(product: Product, typeLabel: string) {
  if (product.meta_description) return product.meta_description

  const compatibleText = product.short_description
    ? ` Compatible con ${product.short_description}.`
    : ""

  return `Compra ${product.title} marca ${product.part_brand?.name ?? ""}. ${typeLabel}.${compatibleText} Precio referencial: $${(product.offer_price ?? product.price).toFixed(2)}.`
}

export function getProductSeoTitle(product: Product) {
  return product.meta_title ?? `${product.title} ${product.part_brand?.name ?? ""} | ${SITE_NAME}`
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
