import type { MetadataRoute } from "next"
import { products } from "@/data/products"
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
  const staticLastModified = new Date("2026-06-26T00:00:00.000Z")
  const catalogLastModified = new Date("2026-06-26T00:00:00.000Z")
  const brands = await getPublicVehicleBrands()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: staticLastModified,
      changeFrequency: "weekly",
      priority: 1,
      images: [toAbsoluteUrl(DEFAULT_SHARE_IMAGE_PATH)],
    },
    {
      url: `${SITE_URL}/catalogo`,
      lastModified: catalogLastModified,
      changeFrequency: "daily",
      priority: 0.95,
      images: [toAbsoluteUrl(DEFAULT_SHARE_IMAGE_PATH)],
    },
    {
      url: `${SITE_URL}/contacto`,
      lastModified: staticLastModified,
      changeFrequency: "monthly",
      priority: 0.8,
      images: [toAbsoluteUrl(DEFAULT_SHARE_IMAGE_PATH)],
    },
  ]

  const brandRoutes: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${SITE_URL}${buildCatalogBrandPath([brand.key])}`,
    lastModified: catalogLastModified,
    changeFrequency: "daily",
    priority: 0.85,
    images: brand.logoUrl ? [brand.logoUrl] : [toAbsoluteUrl(DEFAULT_SHARE_IMAGE_PATH)],
  }))

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}${buildProductPath(product)}`,
    lastModified: catalogLastModified,
    changeFrequency: "daily",
    priority: 0.9,
    images: [toAbsoluteUrl(getProductPrimaryImage(product) ?? DEFAULT_PRODUCT_IMAGE_PATH)],
  }))

  return [...staticRoutes, ...brandRoutes, ...productRoutes]
}
