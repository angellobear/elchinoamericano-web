import type { MetadataRoute } from "next"
import { getPublicProducts } from "@/lib/db/products"
import { getPublicVehicleBrands } from "@/lib/db/vehicle-brands"
import { buildCatalogBrandPath } from "@/lib/catalog"
import {
  DEFAULT_PRODUCT_IMAGE_PATH,
  DEFAULT_SHARE_IMAGE_PATH,
  SITE_URL,
  getProductPrimaryImage,
  toAbsoluteUrl,
} from "@/lib/seo"
import { buildProductPath } from "@/lib/product-slugs"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const [products, brands] = await Promise.all([getPublicProducts(), getPublicVehicleBrands()])

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
      images: [toAbsoluteUrl(DEFAULT_SHARE_IMAGE_PATH)],
    },
    {
      url: `${SITE_URL}/catalogo`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
      images: [toAbsoluteUrl(DEFAULT_SHARE_IMAGE_PATH)],
    },
    {
      url: `${SITE_URL}/contacto`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
      images: [toAbsoluteUrl(DEFAULT_SHARE_IMAGE_PATH)],
    },
  ]

  const brandRoutes: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${SITE_URL}${buildCatalogBrandPath([brand.key])}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.85,
    images: brand.logoUrl ? [brand.logoUrl] : [toAbsoluteUrl(DEFAULT_SHARE_IMAGE_PATH)],
  }))

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}${buildProductPath(product)}`,
    lastModified: new Date(product.updated_at ?? product.created_at ?? now),
    changeFrequency: "weekly" as const,
    priority: 0.9,
    images: [toAbsoluteUrl(getProductPrimaryImage(product) ?? DEFAULT_PRODUCT_IMAGE_PATH)],
  }))

  return [...staticRoutes, ...brandRoutes, ...productRoutes]
}
