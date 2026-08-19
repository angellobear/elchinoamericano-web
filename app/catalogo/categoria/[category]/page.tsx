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
  parseCatalogCategorySlug,
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
  const { category: categorySlug } = await params
  const allCategories = await getCategories()
  const requestedKeys = parseCatalogCategorySlug(categorySlug)
  const matchedCategories = allCategories.filter((cat) => requestedKeys.includes(cat.key))

  if (matchedCategories.length === 0) return {}

  const names = matchedCategories.map((c) => c.name)
  const titleText = names.length === 1 ? names[0] : names.slice(0, -1).join(", ") + ` y ${names.at(-1)}`
  const canonicalPath = buildCatalogCategoryPath(matchedCategories.map((c) => c.key))

  return buildCatalogMetadata(
    `Repuestos de ${titleText} | ${SITE_NAME}`,
    `Catálogo de repuestos de ${titleText} para vehículos chinos y americanos en Ecuador. Encuentra opciones originales, OEM y alternas con envíos a todo el país.`,
    canonicalPath,
    {
      extraKeywords: [`repuestos ${titleText} Ecuador`, `${titleText} vehículos Ecuador`],
      ogDescription: `Catálogo de repuestos de ${titleText} con envíos a todo Ecuador.`,
      imageAlt: `Repuestos de ${titleText} en Ecuador`,
    },
  )
}

type Props = { params: Promise<{ category: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function CatalogoCategoriaPage(props: Props) {
  const [{ category: categorySlug }, resolvedSearchParams, allCategories, brands, allProducts] = await Promise.all([
    props.params,
    props.searchParams,
    getCategories(),
    getPublicVehicleBrands(),
    getPublicProducts(),
  ])

  const requestedKeys = parseCatalogCategorySlug(categorySlug)
  const matchedCategories = allCategories.filter((cat) => requestedKeys.includes(cat.key))
  if (matchedCategories.length === 0) notFound()

  const { search, filters, page } = parseCatalogFilters(resolvedSearchParams)
  const activeBrandKeys = new Set(brands.map((b) => b.key))
  const validQualityIds = new Set(["original", "oem", "aftermarket"])
  const sanitizedFilters = {
    ...filters,
    qualities: filters.qualities.filter((q) => validQualityIds.has(q)),
    categories: matchedCategories.map((c) => c.key),
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
  const names = matchedCategories.map((c) => c.name)
  const titleText = names.length === 1 ? names[0] : names.slice(0, -1).join(", ") + ` y ${names.at(-1)}`
  const canonicalPath = buildCatalogCategoryPath(matchedCategories.map((c) => c.key))
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}${canonicalPath}#page`,
        name: `Repuestos de ${titleText}`,
        description: `Catálogo de repuestos de ${titleText} en Ecuador.`,
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
          { "@type": "ListItem", position: 3, name: titleText, item: `${SITE_URL}${canonicalPath}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `¿Qué repuestos de ${titleText} están disponibles?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Disponemos de repuestos originales, OEM y alternos de ${titleText} para vehículos chinos y americanos en Ecuador, con envíos a todo el país.`,
            },
          },
          {
            "@type": "Question",
            name: `¿Hacen envíos de repuestos de ${titleText} a todo Ecuador?`,
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
          key={`${categorySlug}-${search}-${sanitizedFilters.qualities.join(",")}-${sanitizedFilters.carBrands.join(",")}-${safePage}`}
          brands={brands}
          categories={allCategories.map((cat) => ({ id: cat.key, label: cat.name }))}
          products={allProducts}
          breadcrumbLabel={titleText}
          headerTitle={`Repuestos de ${titleText}`}
          headerDescription={`Catálogo especializado en repuestos de ${titleText}. Filtra por marca, precio y encuentra alternativas originales, OEM y alternas.`}
          initialFilters={sanitizedFilters}
          initialPage={safePage}
          initialSearch={search}
        />
      </Suspense>
      <Footer />
    </>
  )
}
