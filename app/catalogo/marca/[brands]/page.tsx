import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import CatalogoClient from "@/app/catalogo/CatalogoClient"
import { getCategories } from "@/lib/db/categories"
import { getPublicVehicleBrands } from "@/lib/db/vehicle-brands"
import { getPublicProducts } from "@/lib/db/products"
import {
  buildCatalogBrandPath,
  buildCatalogModelPath,
  buildCatalogPagePath,
  CATALOG_PAGE_SIZE,
  parseCatalogPage,
  parseCatalogBrandSlug,
  parseCatalogFilters,
} from "@/lib/catalog"
import { normalizeVehicleBrand } from "@/lib/vehicle-brand-aliases"
import { toVehicleBrandKey } from "@/lib/vehicle-brands-public"
import { filterCatalogProducts } from "@/lib/catalog-products"
import {
  SITE_NAME,
  SITE_URL,
  buildCatalogMetadata,
} from "@/lib/seo"
import { groupVehicleModels } from "@/lib/vehicle-models"
import { buildProductPath } from "@/lib/product-slugs"
import { BRAND_CONTENT, getGenericBrandFaqs } from "@/data/brand-content"

export const revalidate = 3600

export async function generateStaticParams() {
  const activeBrands = await getPublicVehicleBrands()

  return activeBrands.map((brand) => ({
    brands: brand.key,
  }))
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ brands: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}): Promise<Metadata> {
  const [{ brands: brandSlug }, { pagina }] = await Promise.all([params, searchParams])
  const activeBrands = await getPublicVehicleBrands()
  const requestedKeys = parseCatalogBrandSlug(brandSlug)
  const matchedBrands = activeBrands.filter((brand) => requestedKeys.includes(brand.key))

  if (matchedBrands.length === 0) {
    return {}
  }

  const brandNames = matchedBrands.map((brand) => brand.name)
  const titleBrandText =
    brandNames.length === 1 ? brandNames[0] : brandNames.slice(0, -1).join(", ") + ` y ${brandNames.at(-1)}`
  const page = parseCatalogPage(typeof pagina === "string" ? pagina : undefined)
  const canonicalPath = buildCatalogPagePath(buildCatalogBrandPath(matchedBrands.map((brand) => brand.key)), page)
  const pageSuffix = page > 1 ? ` (página ${page})` : ""
  const content = matchedBrands.length === 1 ? BRAND_CONTENT[matchedBrands[0].key] : undefined

  if (content) {
    return buildCatalogMetadata(`${content.title}${pageSuffix}`, content.metaDescription, canonicalPath, {
      extraKeywords: [`repuestos ${titleBrandText} Ecuador`, `repuestos ${titleBrandText} Quito`, `repuestos ${titleBrandText}`],
      imageAlt: content.h1,
    })
  }

  const description =
    brandNames.length === 1
      ? `Explora repuestos automotrices para ${titleBrandText} en Ecuador. Encuentra opciones originales, OEM y alternas con asesoría especializada.`
      : `Explora repuestos automotrices para ${titleBrandText} en Ecuador. Compara opciones originales, OEM y alternas en un solo catálogo.`

  return buildCatalogMetadata(
    `Repuestos para ${titleBrandText}${pageSuffix} | ${SITE_NAME}`,
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
  const [{ brands: brandSlug }, resolvedSearchParams, activeBrands, categories, allProducts] = await Promise.all([
    props.params,
    props.searchParams,
    getPublicVehicleBrands(),
    getCategories(),
    getPublicProducts(),
  ])

  const requestedKeys = parseCatalogBrandSlug(brandSlug)
  const matchedBrands = activeBrands.filter((brand) => requestedKeys.includes(brand.key))

  if (matchedBrands.length === 0) {
    const resolvedKeys = requestedKeys
      .map((k) => toVehicleBrandKey(normalizeVehicleBrand(k)))
      .filter((k) => activeBrands.some((b) => b.key === k))
    if (resolvedKeys.length > 0) redirect(buildCatalogBrandPath(resolvedKeys))
    notFound()
  }

  const { search, filters, page } = parseCatalogFilters(resolvedSearchParams)
  const activeCategoryKeys = new Set(categories.map((category) => category.key))
  const validQualityIds = new Set(["original", "oem", "aftermarket"])
  const sanitizedFilters = {
    ...filters,
    qualities: filters.qualities.filter((q) => validQualityIds.has(q)),
    categories: filters.categories.filter((category) => activeCategoryKeys.has(category)),
    carBrands: matchedBrands.map((brand) => brand.key),
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
  const canonicalPath = buildCatalogBrandPath(matchedBrands.map((brand) => brand.key))
  const brandNames = matchedBrands.map((brand) => brand.name)
  const titleBrandText =
    brandNames.length === 1
      ? brandNames[0]
      : brandNames.slice(0, -1).join(", ") + ` y ${brandNames.at(-1)}`
  const content = matchedBrands.length === 1 ? BRAND_CONTENT[matchedBrands[0].key] : undefined
  const faqs = content?.faqs ?? getGenericBrandFaqs(titleBrandText)
  const models = matchedBrands.flatMap((brand) =>
    groupVehicleModels(filteredProducts, brand.name).map((group) => ({ ...group, brandKey: brand.key })),
  )
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}${canonicalPath}#page`,
        name:
          content?.h1 ?? (brandNames.length === 1
            ? `Repuestos para ${brandNames[0]}`
            : `Repuestos para ${brandNames.join(", ")}`),
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
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
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
          key={`${brandSlug}-${search}-${sanitizedFilters.qualities.join(",")}-${sanitizedFilters.categories.join(",")}-${safePage}`}
          brands={activeBrands}
          categories={categories.map((category) => ({ id: category.key, label: category.name }))}
          products={allProducts}
          breadcrumbLabel={brandNames.length === 1 ? brandNames[0] : `Marcas: ${titleBrandText}`}
          headerDescription={
            content?.headerDescription ?? (brandNames.length === 1
              ? `Catálogo especializado en repuestos para ${brandNames[0]}. Filtra por categoría, precio y encuentra alternativas originales, OEM y alternas.`
              : `Catálogo especializado en repuestos para ${titleBrandText}. Compara compatibilidades y filtra por categoría o precio desde una sola landing.`)
          }
          headerTitle={
            content?.h1 ?? (brandNames.length === 1
              ? `Repuestos para ${brandNames[0]}`
              : `Repuestos para ${titleBrandText}`)
          }
          initialFilters={sanitizedFilters}
          initialPage={safePage}
          initialSearch={search}
        />
      </Suspense>
      <section className="bg-[#f6f8fb] px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="bg-white rounded-[14px] border border-slate-200 p-6 sm:p-8">
            <h2 className="font-display font-bold text-navy text-2xl">
              {content?.introHeading ?? `Repuestos para ${titleBrandText} en Ecuador`}
            </h2>
            {(content?.intro ?? [
              `Catálogo de repuestos originales, OEM y alternos para ${titleBrandText}, con despacho desde Quito a todo Ecuador y asesoría por WhatsApp para confirmar compatibilidad.`,
            ]).map((paragraph) => (
              <p key={paragraph} className="mt-3 text-slate-600 leading-relaxed">{paragraph}</p>
            ))}

            <h2 className="font-display font-bold text-navy text-2xl mt-10">Preguntas frecuentes</h2>
            <div className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
              {faqs.map((faq) => (
                <details key={faq.question} className="group py-4">
                  <summary className="cursor-pointer list-none font-semibold text-navy flex justify-between gap-4">
                    <h3>{faq.question}</h3>
                    <span aria-hidden className="text-brand transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-2 text-slate-600 leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            {models.length > 0 && (
              <div className="bg-white rounded-[14px] border border-slate-200 p-6">
                <h2 className="font-display font-bold text-navy text-xl">
                  Modelos {brandNames.length === 1 ? brandNames[0] : ""} en catálogo
                </h2>
                <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                  {models.map((model) => (
                    <li key={`${model.brandKey}-${model.key}`}>
                      <Link
                        href={buildCatalogModelPath(model.brandKey, model.slug)}
                        className="text-navy font-medium hover:text-brand transition-colors"
                      >
                        {brandNames.length === 1 ? model.name : `${model.brandName} ${model.name}`}
                      </Link>{" "}
                      <span className="text-slate-400">({model.products.length})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {content?.guides.length ? (
              <div className="bg-white rounded-[14px] border border-slate-200 p-6">
                <h2 className="font-display font-bold text-navy text-xl">Guías {brandNames[0]}</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {content.guides.map((guide) => (
                    <li key={guide.href}>
                      <Link href={guide.href} className="text-brand font-semibold hover:underline">
                        {guide.titulo}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
      <Footer />
    </>
  )
}
