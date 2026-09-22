import type { MetadataRoute } from "next"
import { getPublicProducts } from "@/lib/db/products"
import { getVisibleVehicleBrands } from "@/lib/db/vehicle-brands"
import {
  buildCatalogBrandPath,
  buildCatalogCategoryPath,
  buildCatalogModelPath,
  MIN_INDEXABLE_MODEL_PRODUCTS,
} from "@/lib/catalog"
import { getCategories } from "@/lib/db/categories"
import { filterCatalogProducts } from "@/lib/catalog-products"
import { groupVehicleModels } from "@/lib/vehicle-models"
import {
  DEFAULT_PRODUCT_IMAGE_PATH,
  DEFAULT_SHARE_IMAGE_PATH,
  SITE_URL,
  getProductPrimaryImage,
  toAbsoluteUrl,
} from "@/lib/seo"
import { buildProductPath } from "@/lib/product-slugs"
import { guias } from "@/data/guias"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const [products, brands, categories] = await Promise.all([getPublicProducts(), getVisibleVehicleBrands(), getCategories()])

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
      url: `${SITE_URL}/guias`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/contacto`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
      images: [toAbsoluteUrl(DEFAULT_SHARE_IMAGE_PATH)],
    },
  ]

  const guiaRoutes: MetadataRoute.Sitemap = guias.map((guia) => ({
    url: `${SITE_URL}/guias/${guia.categoria}/${guia.slug}`,
    lastModified: new Date(guia.fechaPublicacion),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }))

  const brandRoutes: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${SITE_URL}${buildCatalogBrandPath([brand.key])}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.85,
    images: brand.logoUrl ? [brand.logoUrl] : [toAbsoluteUrl(DEFAULT_SHARE_IMAGE_PATH)],
  }))

  const modelRoutes: MetadataRoute.Sitemap = brands.flatMap((brand) =>
    groupVehicleModels(filterCatalogProducts(products, "", [], [], [brand.key]), brand.name)
      .filter((model) => model.products.length >= MIN_INDEXABLE_MODEL_PRODUCTS)
      .map((model) => ({
        url: `${SITE_URL}${buildCatalogModelPath(brand.key, model.slug)}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.85,
      })),
  )

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}${buildCatalogCategoryPath(category.key)}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }))

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}${buildProductPath(product)}`,
    lastModified: new Date(product.updated_at ?? product.created_at ?? now),
    changeFrequency: "weekly" as const,
    priority: 0.9,
    images: [toAbsoluteUrl(getProductPrimaryImage(product) ?? DEFAULT_PRODUCT_IMAGE_PATH)],
  }))

  return [...staticRoutes, ...brandRoutes, ...modelRoutes, ...categoryRoutes, ...productRoutes, ...guiaRoutes]
}
