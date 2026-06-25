import type { Metadata } from "next"
import { Suspense } from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import CatalogoClient from "./CatalogoClient"
import { products } from "@/data/products"
import { getVisibleVehicleBrands } from "@/lib/db/vehicle-brands"
import {
  CATALOG_PAGE_SIZE,
  CATALOG_PRICE_RANGES,
  parseCatalogFilters,
} from "@/lib/catalog"
import {
  DEFAULT_SHARE_IMAGE_PATH,
  SITE_NAME,
  SITE_URL,
  toAbsoluteUrl,
} from "@/lib/seo"
import { toVehicleBrandKey } from "@/lib/vehicle-brands-public"

export const metadata: Metadata = {
  title: "Catálogo de Repuestos | El Chino Americano",
  description:
    "Explora el catálogo de repuestos automotrices para vehículos chinos y americanos. Filtra por precio, categoría y marca con una experiencia lista para SEO.",
  alternates: {
    canonical: "/catalogo",
  },
  openGraph: {
    title: "Catálogo de Repuestos | El Chino Americano",
    description:
      "Encuentra repuestos originales, OEM y alternos para vehículos chinos y americanos en Ecuador.",
    type: "website",
    locale: "es_EC",
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

function filterProducts(search: string, priceRangeId: string, categories: string[], carBrands: string[]) {
  const normalizedSearch = search.trim().toLowerCase()
  const selectedPriceRange =
    CATALOG_PRICE_RANGES.find((range) => range.id === priceRangeId) ??
    CATALOG_PRICE_RANGES[0]

  return products.filter((product) => {
    const effectivePrice = product.offer_price ?? product.price
    const matchesSearch =
      normalizedSearch === "" ||
      product.title.toLowerCase().includes(normalizedSearch) ||
      (product.short_description ?? "").toLowerCase().includes(normalizedSearch) ||
      (product.part_brand?.name ?? "").toLowerCase().includes(normalizedSearch) ||
      product.code.toLowerCase().includes(normalizedSearch)
    const matchesPrice =
      effectivePrice >= selectedPriceRange.min &&
      (selectedPriceRange.max === Infinity
        ? true
        : effectivePrice <= selectedPriceRange.max)
    const matchesCategory =
      categories.length === 0 || categories.includes(product.category?.key ?? "")
    const vehicleBrandKeys =
      product.compatibilities?.map((compatibility) =>
        compatibility.model?.brand?.name ? toVehicleBrandKey(compatibility.model.brand.name) : ""
      ) ?? []
    const matchesBrand =
      carBrands.length === 0 ||
      carBrands.some((brand) => vehicleBrandKeys.includes(brand))

    return matchesSearch && matchesPrice && matchesCategory && matchesBrand
  })
}

export default async function CatalogoPage(props: PageProps<"/catalogo">) {
  const resolvedSearchParams = await props.searchParams
  const brands = await getVisibleVehicleBrands()
  const { search, filters, page } = parseCatalogFilters(resolvedSearchParams)
  const visibleBrandKeys = new Set(brands.map((brand) => brand.key))
  const sanitizedFilters = {
    ...filters,
    carBrands: filters.carBrands.filter((brand) => visibleBrandKeys.has(brand)),
  }
  const filteredProducts = filterProducts(
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
    "@type": "CollectionPage",
    name: "Catálogo de Repuestos",
    description: metadata.description,
    url: `${SITE_URL}/catalogo`,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: filteredProducts.length,
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      itemListElement: visibleProducts.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}/catalogo/${product.slug}`,
        name: product.title,
      })),
    },
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
          initialFilters={sanitizedFilters}
          initialPage={safePage}
          initialSearch={search}
        />
      </Suspense>
      <Footer />
    </>
  )
}
