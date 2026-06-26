import type { Metadata } from "next"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import CatalogoClient from "@/app/catalogo/CatalogoClient"
import { getVisibleVehicleBrands } from "@/lib/db/vehicle-brands"
import {
  buildCatalogBrandPath,
  CATALOG_PAGE_SIZE,
  parseCatalogBrandSlug,
  parseCatalogFilters,
} from "@/lib/catalog"
import { filterCatalogProducts } from "@/lib/catalog-products"
import {
  DEFAULT_SHARE_IMAGE_PATH,
  SITE_NAME,
  SITE_URL,
  toAbsoluteUrl,
} from "@/lib/seo"

export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brands: string }>
}): Promise<Metadata> {
  const { brands: brandSlug } = await params
  const visibleBrands = await getVisibleVehicleBrands()
  const requestedKeys = parseCatalogBrandSlug(brandSlug)
  const matchedBrands = visibleBrands.filter((brand) => requestedKeys.includes(brand.key))

  if (matchedBrands.length === 0) {
    return {}
  }

  const brandNames = matchedBrands.map((brand) => brand.name)
  const titleBrandText =
    brandNames.length === 1 ? brandNames[0] : brandNames.slice(0, -1).join(", ") + ` y ${brandNames.at(-1)}`
  const canonicalPath = buildCatalogBrandPath(matchedBrands.map((brand) => brand.key))

  return {
    title: `Repuestos para ${titleBrandText} | ${SITE_NAME}`,
    description:
      brandNames.length === 1
        ? `Explora repuestos automotrices para ${titleBrandText} en Ecuador. Encuentra opciones originales, OEM y alternas con asesoría especializada.`
        : `Explora repuestos automotrices para ${titleBrandText} en Ecuador. Compara opciones originales, OEM y alternas en un solo catálogo.`,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `Repuestos para ${titleBrandText} | ${SITE_NAME}`,
      description:
        brandNames.length === 1
          ? `Catálogo de repuestos para ${titleBrandText} con envíos a todo Ecuador.`
          : `Catálogo de repuestos para ${titleBrandText} con envíos a todo Ecuador.`,
      type: "website",
      locale: "es_EC",
      siteName: SITE_NAME,
      url: `${SITE_URL}${canonicalPath}`,
      images: [
        {
          url: toAbsoluteUrl(DEFAULT_SHARE_IMAGE_PATH),
          alt: `Repuestos para ${titleBrandText} en Ecuador`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Repuestos para ${titleBrandText} | ${SITE_NAME}`,
      description:
        brandNames.length === 1
          ? `Encuentra repuestos para ${titleBrandText} en Ecuador.`
          : `Encuentra repuestos para ${titleBrandText} en Ecuador.`,
      images: [toAbsoluteUrl(DEFAULT_SHARE_IMAGE_PATH)],
    },
  }
}

export default async function CatalogoMarcaPage(props: PageProps<"/catalogo/marca/[brands]">) {
  const [{ brands: brandSlug }, resolvedSearchParams, visibleBrands] = await Promise.all([
    props.params,
    props.searchParams,
    getVisibleVehicleBrands(),
  ])

  const requestedKeys = parseCatalogBrandSlug(brandSlug)
  const matchedBrands = visibleBrands.filter((brand) => requestedKeys.includes(brand.key))

  if (matchedBrands.length === 0) notFound()

  const { search, filters, page } = parseCatalogFilters(resolvedSearchParams)
  const sanitizedFilters = {
    ...filters,
    carBrands: matchedBrands.map((brand) => brand.key),
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
    safePage * CATALOG_PAGE_SIZE,
  )
  const canonicalPath = buildCatalogBrandPath(matchedBrands.map((brand) => brand.key))
  const brandNames = matchedBrands.map((brand) => brand.name)
  const titleBrandText =
    brandNames.length === 1
      ? brandNames[0]
      : brandNames.slice(0, -1).join(", ") + ` y ${brandNames.at(-1)}`
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name:
      brandNames.length === 1
        ? `Repuestos para ${brandNames[0]}`
        : `Repuestos para ${brandNames.join(", ")}`,
    description:
      brandNames.length === 1
        ? `Catálogo de repuestos para ${brandNames[0]} en Ecuador.`
        : `Catálogo de repuestos para ${brandNames.join(", ")} en Ecuador.`,
    url: `${SITE_URL}${canonicalPath}`,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    about: matchedBrands.map((brand) => ({
      "@type": "Brand",
      name: brand.name,
    })),
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
          key={`${brandSlug}-${search}-${sanitizedFilters.priceRange}-${sanitizedFilters.categories.join(",")}-${safePage}`}
          brands={visibleBrands}
          breadcrumbLabel={brandNames.length === 1 ? brandNames[0] : `Marcas: ${titleBrandText}`}
          headerDescription={
            brandNames.length === 1
              ? `Catálogo especializado en repuestos para ${brandNames[0]}. Filtra por categoría, precio y encuentra alternativas originales, OEM y alternas.`
              : `Catálogo especializado en repuestos para ${titleBrandText}. Compara compatibilidades y filtra por categoría o precio desde una sola landing.`
          }
          headerTitle={
            brandNames.length === 1
              ? `Repuestos para ${brandNames[0]}`
              : `Repuestos para ${titleBrandText}`
          }
          initialFilters={sanitizedFilters}
          initialPage={safePage}
          initialSearch={search}
        />
      </Suspense>
      <Footer />
    </>
  )
}
