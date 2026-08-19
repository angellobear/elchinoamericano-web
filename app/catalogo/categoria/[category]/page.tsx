import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import CatalogoClient from "@/app/catalogo/CatalogoClient"
import { getCategories } from "@/lib/db/categories"
import { getPublicVehicleBrands } from "@/lib/db/vehicle-brands"
import { getPublicProducts } from "@/lib/db/products"
import {
  buildCatalogCategoryPath,
  CATALOG_PAGE_SIZE,
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
  const categories = await getCategories()
  return categories.map((cat) => ({ category: cat.key }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category: categoryKey } = await params
  const categories = await getCategories()
  const matched = categories.find((cat) => cat.key === categoryKey)

  if (!matched) return {}

  return buildCatalogMetadata(
    `Repuestos de ${matched.name} | ${SITE_NAME}`,
    `Catálogo de repuestos de ${matched.name} para vehículos chinos y americanos en Ecuador. Encuentra opciones originales, OEM y alternas con envíos a todo el país.`,
    buildCatalogCategoryPath(categoryKey),
    {
      extraKeywords: [`repuestos ${matched.name} Ecuador`, `${matched.name} vehículos Ecuador`],
      ogDescription: `Catálogo de repuestos de ${matched.name} con envíos a todo Ecuador.`,
      imageAlt: `Repuestos de ${matched.name} en Ecuador`,
    },
  )
}

type Props = { params: Promise<{ category: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function CatalogoCategoriaPage(props: Props) {
  const [{ category: categoryKey }, resolvedSearchParams, categories, brands, allProducts] = await Promise.all([
    props.params,
    props.searchParams,
    getCategories(),
    getPublicVehicleBrands(),
    getPublicProducts(),
  ])

  const matched = categories.find((cat) => cat.key === categoryKey)
  if (!matched) notFound()

  const { search, filters, page } = parseCatalogFilters(resolvedSearchParams)
  const activeBrandKeys = new Set(brands.map((b) => b.key))
  const validQualityIds = new Set(["original", "oem", "aftermarket"])
  const sanitizedFilters = {
    ...filters,
    qualities: filters.qualities.filter((q) => validQualityIds.has(q)),
    categories: [matched.key],
    carBrands: filters.carBrands.filter((b) => activeBrandKeys.has(b)),
  }
  const filteredProducts = filterCatalogProducts(
    allProducts,
    search,
    sanitizedFilters.qualities,
    sanitizedFilters.categories,
    sanitizedFilters.carBrands,
  )
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / CATALOG_PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const visibleProducts = filteredProducts.slice(
    (safePage - 1) * CATALOG_PAGE_SIZE,
    safePage * CATALOG_PAGE_SIZE,
  )
  const canonicalPath = buildCatalogCategoryPath(categoryKey)
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}${canonicalPath}#page`,
        name: `Repuestos de ${matched.name}`,
        description: `Catálogo de repuestos de ${matched.name} en Ecuador.`,
        url: `${SITE_URL}${canonicalPath}`,
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
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
          { "@type": "ListItem", position: 3, name: matched.name, item: `${SITE_URL}${canonicalPath}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `¿Qué repuestos de ${matched.name} están disponibles?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Disponemos de repuestos originales, OEM y alternos de ${matched.name} para vehículos chinos y americanos en Ecuador, con envíos a todo el país.`,
            },
          },
          {
            "@type": "Question",
            name: `¿Hacen envíos de repuestos de ${matched.name} a todo Ecuador?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Sí. Coordinamos envíos a Quito, Santo Domingo de los Tsáchilas y todo el Ecuador. Consúltanos por WhatsApp para disponibilidad y precio.`,
            },
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
          key={`${categoryKey}-${search}-${sanitizedFilters.qualities.join(",")}-${sanitizedFilters.carBrands.join(",")}-${safePage}`}
          brands={brands}
          categories={categories.map((cat) => ({ id: cat.key, label: cat.name }))}
          products={allProducts}
          breadcrumbLabel={matched.name}
          headerTitle={`Repuestos de ${matched.name}`}
          headerDescription={`Catálogo especializado en repuestos de ${matched.name}. Filtra por marca, precio y encuentra alternativas originales, OEM y alternas.`}
          initialFilters={sanitizedFilters}
          initialPage={safePage}
          initialSearch={search}
        />
      </Suspense>
      <Footer />
    </>
  )
}
