type ProductSlugSource = {
  code?: string | null
  slug?: string | null
}

export function sanitizeSkuForSlug(sku: string) {
  return sku
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function buildSlugWithSku(slugOrTitle: string, sku: string) {
  const skuSuffix = sanitizeSkuForSlug(sku)
  const base = buildProductSlugBase(slugOrTitle)
  const baseWithoutSku = skuSuffix ? base.replace(new RegExp(`-${skuSuffix}$`), '') : base
  return skuSuffix ? `${baseWithoutSku}-${skuSuffix}` : base
}

const SLUG_STOPWORDS = new Set([
  "de", "del", "la", "las", "el", "los", "para", "por", "con", "y", "en", "un", "una",
])

export function buildProductSlugBase(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/\s+/)
    .filter((word) => word && !SLUG_STOPWORDS.has(word))
    .join("-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function normalizeProductCode(code: string) {
  return code.trim().toLowerCase()
}

export function buildProductPathSegment(product: ProductSlugSource) {
  const code = product.code ? normalizeProductCode(product.code) : ""
  const slug = buildProductSlugBase(product.slug ?? "")

  if (!code) return slug
  if (!slug) return code

  return `${code}-${slug}`
}

export function buildProductPath(product: ProductSlugSource) {
  return `/catalogo/${buildProductPathSegment(product)}`
}

export function extractProductCodeFromSegment(segment: string) {
  const normalizedSegment = segment.trim().toLowerCase()
  const match = normalizedSegment.match(/^[a-z]{2}-\d+/)
  return match ? match[0] : null
}

export function resolveProductFromRouteSegment<T extends ProductSlugSource>(
  items: T[],
  segment: string,
) {
  const normalizedSegment = segment.trim().toLowerCase()

  const exactProduct = items.find(
    (item) => buildProductPathSegment(item).toLowerCase() === normalizedSegment,
  )
  if (exactProduct) {
    return { product: exactProduct, shouldRedirect: false }
  }

  const extractedCode = extractProductCodeFromSegment(normalizedSegment)
  if (extractedCode) {
    const byCode = items.find(
      (item) => item.code && normalizeProductCode(item.code) === extractedCode,
    )
    if (byCode) {
      return { product: byCode, shouldRedirect: true }
    }
  }

  const byLegacySlug = items.find(
    (item) => buildProductSlugBase(item.slug ?? "") === normalizedSegment,
  )
  if (byLegacySlug) {
    return { product: byLegacySlug, shouldRedirect: true }
  }

  return { product: null, shouldRedirect: false }
}
