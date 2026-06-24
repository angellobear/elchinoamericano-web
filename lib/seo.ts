import type { Product } from "@/types"

export const SITE_NAME = "El Chino Americano"
export const SITE_URL = "https://elchinoamericano.com"
export const DEFAULT_SHARE_IMAGE_PATH = "/share-default-product.svg"

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

export function getProductShareImage(product: Product) {
  return toAbsoluteUrl(getProductPrimaryImage(product) ?? DEFAULT_SHARE_IMAGE_PATH)
}

export function getProductShareImageAlt(product: Product) {
  return `${product.title} ${product.part_brand?.name ?? ""}`.trim()
}

export function getProductUrl(product: Product) {
  return toAbsoluteUrl(`/catalogo/${product.slug}`)
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
