import type { MetadataRoute } from "next"
import { products } from "@/data/products"
import { getPublicVehicleBrands } from "@/lib/db/vehicle-brands"
import { buildCatalogBrandPath } from "@/lib/catalog"
import {
  DEFAULT_SHARE_IMAGE_PATH,
  SITE_URL,
  getProductPrimaryImage,
  toAbsoluteUrl,
} from "@/lib/seo"
import { buildProductPath } from "@/lib/product-slugs"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date()
  const brands = await getPublicVehicleBrands()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "hourly",
      priority: 1,
      images: [toAbsoluteUrl(DEFAULT_SHARE_IMAGE_PATH)],
    },
    {
      url: `${SITE_URL}/catalogo`,
      lastModified,
      changeFrequency: "hourly",
      priority: 0.95,
      images: [toAbsoluteUrl(DEFAULT_SHARE_IMAGE_PATH)],
    },
    {
      url: `${SITE_URL}/contacto`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
      images: [toAbsoluteUrl(DEFAULT_SHARE_IMAGE_PATH)],
    },
  ]

  const brandRoutes: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${SITE_URL}${buildCatalogBrandPath([brand.key])}`,
    lastModified,
    changeFrequency: "daily",
    priority: 0.85,
    images: brand.logoUrl ? [brand.logoUrl] : [toAbsoluteUrl(DEFAULT_SHARE_IMAGE_PATH)],
  }))

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}${buildProductPath(product)}`,
    lastModified,
    changeFrequency: "daily",
    priority: 0.9,
    images: [toAbsoluteUrl(getProductPrimaryImage(product) ?? DEFAULT_SHARE_IMAGE_PATH)],
  }))

  return [...staticRoutes, ...brandRoutes, ...productRoutes]
}
