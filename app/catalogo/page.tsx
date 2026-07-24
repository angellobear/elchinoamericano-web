import { Suspense } from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import CatalogoClient from "./CatalogoClient"
import { getCategories } from "@/lib/db/categories"
import { getPublicVehicleBrands } from "@/lib/db/vehicle-brands"
import { getPublicProducts } from "@/lib/db/products"
import {
  CATALOG_PAGE_SIZE,
  parseCatalogFilters,
} from "@/lib/catalog"
import { filterCatalogProducts } from "@/lib/catalog-products"
import { buildCatalogMetadata, SITE_NAME, SITE_URL } from "@/lib/seo"
import { buildProductPath } from "@/lib/product-slugs"

export const revalidate = 3600

export const metadata = buildCatalogMetadata(
  "Catálogo de Repuestos | El Chino Americano",
  "Explora nuestro catálogo de repuestos originales, OEM y alternos para vehículos chinos y americanos. Filtra por marca, categoría y precio con envíos a todo Ecuador.",
  "/catalogo",
  {
    extraKeywords: ["catalogo de repuestos Ecuador", "repuestos por marca Ecuador", "repuestos por categoria Ecuador"],
    ogDescription: "Encuentra repuestos originales, OEM y alternos para vehículos chinos y americanos en Ecuador.",
    imageAlt: "Catálogo de repuestos El Chino Americano",
  },
)

export default async function CatalogoPage(props: PageProps<"/catalogo">) {
  const resolvedSearchParams = await props.searchParams
  const [brands, categories, allProducts] = await Promise.all([
    getPublicVehicleBrands(),
    getCategories(),
    getPublicProducts(),
  ])
  const { search, filters, page } = parseCatalogFilters(resolvedSearchParams)
  const activeBrandKeys = new Set(brands.map((brand) => brand.key))
  const activeCategoryKeys = new Set(categories.map((category) => category.key))
  const validQualityIds = new Set(["original", "oem", "aftermarket"])
  const sanitizedFilters = {
    ...filters,
    qualities: filters.qualities.filter((q) => validQualityIds.has(q)),
    categories: filters.categories.filter((category) => activeCategoryKeys.has(category)),
    carBrands: filters.carBrands.filter((brand) => activeBrandKeys.has(brand)),
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
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "¿Qué tipos de repuestos automotrices tienen disponibles en el catálogo?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "El catálogo incluye repuestos originales, OEM y alternos para vehículos chinos y americanos: filtros, frenos, suspensión, motor, dirección, transmisión, sistema eléctrico, carrocería y más. Puedes filtrar por categoría, marca de vehículo o rango de precio.",
            },
          },
          {
            "@type": "Question",
            name: "¿Cómo busco un repuesto específico en el catálogo?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Puedes buscar por nombre del repuesto, número de parte (SKU) o código del fabricante usando la barra de búsqueda. También puedes filtrar por marca de vehículo (Chery, BYD, Ford, Chevrolet, etc.) y por categoría de repuesto para encontrar la pieza correcta.",
            },
          },
          {
            "@type": "Question",
            name: "¿Los repuestos del catálogo están disponibles para envío inmediato a todo Ecuador?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Los productos marcados como 'en stock' están disponibles para envío inmediato. Coordinamos envíos a Quito, Guayaquil, Cuenca, Santo Domingo de los Tsáchilas y todo el Ecuador en 24 a 72 horas. Para verificar disponibilidad de un repuesto específico, consúltanos por WhatsApp.",
            },
          },
          {
            "@type": "Question",
            name: "¿Puedo encontrar repuestos para marcas chinas como Chery, BYD o JAC en el catálogo?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Sí. El catálogo incluye repuestos específicos para las principales marcas chinas presentes en Ecuador: Chery, BYD, JAC, Great Wall, Haval, Geely, Lifan y Brilliance. Selecciona la marca de vehículo en el filtro para ver solo los repuestos compatibles.",
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
          key={`${search}-${sanitizedFilters.qualities.join(",")}-${sanitizedFilters.categories.join(",")}-${sanitizedFilters.carBrands.join(",")}-${safePage}`}
          brands={brands}
          categories={categories.map((category) => ({ id: category.key, label: category.name }))}
          products={allProducts}
          breadcrumbLabel="Catálogo"
          headerDescription="Explora repuestos originales, OEM y alternos para vehículos chinos y americanos. Filtra por marca, categoría y rango de precio para encontrar la pieza correcta."
          headerTitle="Catálogo de repuestos"
          initialFilters={sanitizedFilters}
          initialPage={safePage}
          initialSearch={search}
        />
      </Suspense>
      <section aria-labelledby="catalogo-faq-heading" className="border-t border-[#e6e9ef] bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <h2
            id="catalogo-faq-heading"
            className="mb-10 font-display text-8 font-bold uppercase leading-none text-navy"
          >
            Preguntas frecuentes
          </h2>
          <dl className="divide-y divide-[#e6e9ef]">
            {[
              {
                q: "¿Qué tipos de repuestos automotrices tienen disponibles en el catálogo?",
                a: "El catálogo incluye repuestos originales, OEM y alternos para vehículos chinos y americanos: filtros, frenos, suspensión, motor, dirección, transmisión, sistema eléctrico, carrocería y más. Puedes filtrar por categoría, marca de vehículo o rango de precio.",
              },
              {
                q: "¿Cómo busco un repuesto específico en el catálogo?",
                a: "Puedes buscar por nombre del repuesto, número de parte (SKU) o código del fabricante usando la barra de búsqueda. También puedes filtrar por marca de vehículo (Chery, BYD, Ford, Chevrolet, etc.) y por categoría de repuesto para encontrar la pieza correcta.",
              },
              {
                q: "¿Los repuestos del catálogo están disponibles para envío inmediato a todo Ecuador?",
                a: "Los productos marcados como 'en stock' están disponibles para envío inmediato. Coordinamos envíos a Quito, Guayaquil, Cuenca, Santo Domingo de los Tsáchilas y todo el Ecuador en 24 a 72 horas. Para verificar disponibilidad de un repuesto específico, consúltanos por WhatsApp.",
              },
              {
                q: "¿Puedo encontrar repuestos para marcas chinas como Chery, BYD o JAC en el catálogo?",
                a: "Sí. El catálogo incluye repuestos específicos para las principales marcas chinas presentes en Ecuador: Chery, BYD, JAC, Great Wall, Haval, Geely, Lifan y Brilliance. Selecciona la marca de vehículo en el filtro para ver solo los repuestos compatibles.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="py-7">
                <dt className="mb-3 text-4.25 font-bold leading-snug text-navy">{q}</dt>
                <dd className="text-3.75 leading-[1.65] text-[#566071]">{a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <Footer />
    </>
  )
}
