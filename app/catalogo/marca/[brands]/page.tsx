import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import CatalogoClient from "@/app/catalogo/CatalogoClient"
import { getCategories } from "@/lib/db/categories"
import { getPublicVehicleBrands } from "@/lib/db/vehicle-brands"
import {
  buildCatalogBrandPath,
  CATALOG_PAGE_SIZE,
  parseCatalogBrandSlug,
  parseCatalogFilters,
} from "@/lib/catalog"
import { filterCatalogProducts } from "@/lib/catalog-products"
import {
  SITE_NAME,
  SITE_URL,
  buildCatalogMetadata,
} from "@/lib/seo"
import { buildProductPath } from "@/lib/product-slugs"

export const revalidate = 3600

export async function generateStaticParams() {
  const activeBrands = await getPublicVehicleBrands()

  return activeBrands.map((brand) => ({
    brands: brand.key,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brands: string }>
}): Promise<Metadata> {
  const { brands: brandSlug } = await params
  const activeBrands = await getPublicVehicleBrands()
  const requestedKeys = parseCatalogBrandSlug(brandSlug)
  const matchedBrands = activeBrands.filter((brand) => requestedKeys.includes(brand.key))

  if (matchedBrands.length === 0) {
    return {}
  }

  const brandNames = matchedBrands.map((brand) => brand.name)
  const titleBrandText =
    brandNames.length === 1 ? brandNames[0] : brandNames.slice(0, -1).join(", ") + ` y ${brandNames.at(-1)}`
  const canonicalPath = buildCatalogBrandPath(matchedBrands.map((brand) => brand.key))

  const description =
    brandNames.length === 1
      ? `Explora repuestos automotrices para ${titleBrandText} en Ecuador. Encuentra opciones originales, OEM y alternas con asesoría especializada.`
      : `Explora repuestos automotrices para ${titleBrandText} en Ecuador. Compara opciones originales, OEM y alternas en un solo catálogo.`

  return buildCatalogMetadata(
    `Repuestos para ${titleBrandText} | ${SITE_NAME}`,
    description,
    canonicalPath,
    {
      extraKeywords: [`repuestos ${titleBrandText} Ecuador`, `catalogo ${titleBrandText}`],
      ogDescription: `Catálogo de repuestos para ${titleBrandText} con envíos a todo Ecuador.`,
      imageAlt: `Repuestos para ${titleBrandText} en Ecuador`,
    },
  )
}

export default async function CatalogoMarcaPage(props: PageProps<"/catalogo/marca/[brands]">) {
  const [{ brands: brandSlug }, resolvedSearchParams, activeBrands, categories] = await Promise.all([
    props.params,
    props.searchParams,
    getPublicVehicleBrands(),
    getCategories(),
  ])

  const requestedKeys = parseCatalogBrandSlug(brandSlug)
  const matchedBrands = activeBrands.filter((brand) => requestedKeys.includes(brand.key))

  if (matchedBrands.length === 0) notFound()

  const { search, filters, page } = parseCatalogFilters(resolvedSearchParams)
  const activeCategoryKeys = new Set(categories.map((category) => category.key))
  const sanitizedFilters = {
    ...filters,
    categories: filters.categories.filter((category) => activeCategoryKeys.has(category)),
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
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}${canonicalPath}#page`,
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
          {
            "@type": "ListItem",
            position: 3,
            name: brandNames.length === 1 ? brandNames[0] : `Marcas: ${titleBrandText}`,
            item: `${SITE_URL}${canonicalPath}`,
          },
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
          key={`${brandSlug}-${search}-${sanitizedFilters.priceRange}-${sanitizedFilters.categories.join(",")}-${safePage}`}
          brands={activeBrands}
          categories={categories.map((category) => ({ id: category.key, label: category.name }))}
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
