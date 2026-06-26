import type { Metadata } from "next"
import { Suspense } from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import CatalogoClient from "./CatalogoClient"
import { getCategories } from "@/lib/db/categories"
import { getPublicVehicleBrands } from "@/lib/db/vehicle-brands"
import {
  CATALOG_PAGE_SIZE,
  parseCatalogFilters,
} from "@/lib/catalog"
import { filterCatalogProducts } from "@/lib/catalog-products"
import {
  DEFAULT_KEYWORDS,
  DEFAULT_SHARE_IMAGE_PATH,
  SITE_NAME,
  SITE_URL,
  SITE_LOCALE,
  toAbsoluteUrl,
} from "@/lib/seo"
import { buildProductPath } from "@/lib/product-slugs"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Catálogo de Repuestos | El Chino Americano",
  description:
    "Explora el catálogo de repuestos automotrices para vehículos chinos y americanos. Filtra por precio, categoría y marca con una experiencia lista para SEO.",
  keywords: [
    "catalogo de repuestos Ecuador",
    "repuestos por marca Ecuador",
    "repuestos por categoria Ecuador",
    ...DEFAULT_KEYWORDS,
  ],
  alternates: {
    canonical: "/catalogo",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Catálogo de Repuestos | El Chino Americano",
    description:
      "Encuentra repuestos originales, OEM y alternos para vehículos chinos y americanos en Ecuador.",
    type: "website",
    locale: SITE_LOCALE,
    siteName: SITE_NAME,
    url: `${SITE_URL}/catalogo`,
    images: [
      {
        url: toAbsoluteUrl(DEFAULT_SHARE_IMAGE_PATH),
        alt: "Catálogo de repuestos El Chino Americano",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Catálogo de Repuestos | El Chino Americano",
    description:
      "Encuentra repuestos originales, OEM y alternos para vehículos chinos y americanos en Ecuador.",
    images: [toAbsoluteUrl(DEFAULT_SHARE_IMAGE_PATH)],
  },
}

export default async function CatalogoPage(props: PageProps<"/catalogo">) {
  const resolvedSearchParams = await props.searchParams
  const [brands, categories] = await Promise.all([
    getPublicVehicleBrands(),
    getCategories(),
  ])
  const { search, filters, page } = parseCatalogFilters(resolvedSearchParams)
  const activeBrandKeys = new Set(brands.map((brand) => brand.key))
  const activeCategoryKeys = new Set(categories.map((category) => category.key))
  const sanitizedFilters = {
    ...filters,
    categories: filters.categories.filter((category) => activeCategoryKeys.has(category)),
    carBrands: filters.carBrands.filter((brand) => activeBrandKeys.has(brand)),
  }
  const filteredProducts = filterCatalogProducts(
    search,
    sanitizedFilters.priceRange,
    sanitizedFilters.categories,
    sanitizedFilters.carBrands,
  )
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / CATALOG_PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const visibleProducts = filteredProducts.slice(
    (safePage - 1) * CATALOG_PAGE_SIZE,
    safePage * CATALOG_PAGE_SIZE
  )
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/catalogo#page`,
        name: "Catálogo de Repuestos",
        description: metadata.description,
        url: `${SITE_URL}/catalogo`,
        isPartOf: {
          "@type": "WebSite",
          name: SITE_NAME,
          url: SITE_URL,
        },
        about: [
          { "@type": "Thing", name: "repuestos automotrices" },
          { "@type": "Place", name: "Ecuador" },
        ],
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: filteredProducts.length,
          itemListOrder: "https://schema.org/ItemListOrderAscending",
          itemListElement: visibleProducts.map((product, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${SITE_URL}${buildProductPath(product)}`,
            name: product.title,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Catálogo", item: `${SITE_URL}/catalogo` },
        ],
      },
    ],
  }

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <Suspense
        fallback={
          <main className="min-h-screen bg-slate-50 pt-16 flex items-center justify-center">
            <div className="text-slate-400 text-sm">Cargando catálogo...</div>
          </main>
        }
      >
        <CatalogoClient
          key={`${search}-${sanitizedFilters.priceRange}-${sanitizedFilters.categories.join(",")}-${sanitizedFilters.carBrands.join(",")}-${safePage}`}
          brands={brands}
          categories={categories.map((category) => ({ id: category.key, label: category.name }))}
          breadcrumbLabel="Catálogo"
          headerDescription="Explora repuestos originales, OEM y alternos para vehículos chinos y americanos con filtros listos para encontrar la pieza correcta."
          headerTitle="Catálogo de repuestos"
          initialFilters={sanitizedFilters}
          initialPage={safePage}
          initialSearch={search}
        />
      </Suspense>
      <Footer />
    </>
  )
}
