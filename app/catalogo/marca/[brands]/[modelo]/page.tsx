import type { Metadata } from "next"
import Link from "next/link"
import { notFound, permanentRedirect } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ProductGrid from "@/components/ProductGrid"
import { getPublicVehicleBrands } from "@/lib/db/vehicle-brands"
import { getPublicProducts } from "@/lib/db/products"
import {
  buildCatalogBrandPath,
  buildCatalogModelPath,
  MIN_INDEXABLE_MODEL_PRODUCTS,
} from "@/lib/catalog"
import { filterCatalogProducts } from "@/lib/catalog-products"
import { SITE_NAME, SITE_URL, buildCatalogMetadata } from "@/lib/seo"
import { buildProductPath } from "@/lib/product-slugs"
import {
  formatModelYears,
  groupVehicleModels,
  vehicleModelKey,
  type VehicleModelGroup,
} from "@/lib/vehicle-models"
import { BRAND_CONTENT, type BrandFaq } from "@/data/brand-content"
import type { Product } from "@/types"

export const revalidate = 3600

type Params = { brands: string; modelo: string }

async function loadModel({ brands: brandKey, modelo }: Params) {
  const [activeBrands, allProducts] = await Promise.all([getPublicVehicleBrands(), getPublicProducts()])
  const brand = activeBrands.find((b) => b.key === brandKey)
  if (!brand) return null
  const brandProducts = filterCatalogProducts(allProducts, "", [], [], [brand.key])
  const models = groupVehicleModels(brandProducts, brand.name)
  const model = models.find((m) => m.key === vehicleModelKey(modelo))
  return model ? { brand, model, models } : null
}

export async function generateStaticParams() {
  const [activeBrands, allProducts] = await Promise.all([getPublicVehicleBrands(), getPublicProducts()])
  return activeBrands.flatMap((brand) =>
    groupVehicleModels(filterCatalogProducts(allProducts, "", [], [], [brand.key]), brand.name)
      .filter((m) => m.products.length >= MIN_INDEXABLE_MODEL_PRODUCTS)
      .map((m) => ({ brands: brand.key, modelo: m.slug })),
  )
}

function describe(brandName: string, model: VehicleModelGroup) {
  const fullName = `${brandName} ${model.name}`
  const years = formatModelYears(model)
  const categories = topCategories(model.products)
  return { fullName, years, categories }
}

function topCategories(products: Product[]) {
  const counts = new Map<string, number>()
  for (const p of products) if (p.category?.name) counts.set(p.category.name, (counts.get(p.category.name) ?? 0) + 1)
  return [...counts].sort((a, b) => b[1] - a[1]).map(([name]) => name)
}

function joinEs(items: string[]) {
  return items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} y ${items.at(-1)}`
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const data = await loadModel(await params)
  if (!data) return {}
  const { brand, model } = data
  const { fullName, years, categories } = describe(brand.name, model)
  const metadata = buildCatalogMetadata(
    `Repuestos ${fullName} en Ecuador${years ? ` (${years})` : ""}`,
    `Repuestos para ${fullName}${model.displacements.length ? ` ${joinEs(model.displacements)}` : ""}: ${joinEs(categories.slice(0, 3).map((c) => c.toLowerCase()))}. Originales, OEM y alternos con envío a todo Ecuador desde Quito.`,
    buildCatalogModelPath(brand.key, model.slug),
    {
      extraKeywords: [`repuestos ${fullName}`, `repuestos ${fullName} Ecuador`, `repuestos ${fullName} Quito`],
      imageAlt: `Repuestos ${fullName} en Ecuador`,
    },
  )
  if (model.products.length < MIN_INDEXABLE_MODEL_PRODUCTS) metadata.robots = { index: false, follow: true }
  return metadata
}

export default async function CatalogoModeloPage({ params }: { params: Promise<Params> }) {
  const resolved = await params
  const data = await loadModel(resolved)
  if (!data) notFound()
  const { brand, model, models } = data
  // "eco-sport" y "ecosport" apuntan al mismo modelo: una sola URL canónica
  if (resolved.modelo !== model.slug) permanentRedirect(buildCatalogModelPath(brand.key, model.slug))

  const { fullName, years, categories } = describe(brand.name, model)
  const path = buildCatalogModelPath(brand.key, model.slug)
  const brandPath = buildCatalogBrandPath([brand.key])
  const byCategory = new Map<string, Product[]>()
  for (const product of model.products) {
    const name = product.category?.name ?? "Otros repuestos"
    byCategory.set(name, [...(byCategory.get(name) ?? []), product])
  }
  const siblings = models.filter((m) => m.key !== model.key && m.products.length >= MIN_INDEXABLE_MODEL_PRODUCTS)
  const brandContent = BRAND_CONTENT[brand.key]

  const faqs: BrandFaq[] = [
    {
      question: `¿Qué repuestos para ${fullName} tienen disponibles?`,
      answer: `Tenemos ${model.products.length} repuestos para ${fullName} en catálogo, en ${joinEs(categories.map((c) => c.toLowerCase()))}. Si no encuentras la pieza, escríbenos por WhatsApp y la cotizamos.`,
    },
    {
      question: `¿Cómo sé si el repuesto sirve para mi ${fullName}?`,
      answer: `Cada ficha indica los años y motores compatibles${years ? ` (este catálogo cubre ${fullName} ${years})` : ""}. Antes de despachar verificamos la compatibilidad con el año, el motor y, si lo tienes, el VIN o el número de parte.`,
    },
    {
      question: `¿Hacen envíos de repuestos ${fullName} a todo Ecuador?`,
      answer: "Sí. Despachamos desde Quito a todas las provincias del Ecuador en 24 a 72 horas, con guía de envío rastreable.",
    },
  ]

  const breadcrumb = [
    { name: "Inicio", path: "/" },
    { name: "Catálogo", path: "/catalogo" },
    { name: brand.name, path: brandPath },
    { name: model.name, path },
  ]

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}${path}#page`,
        name: `Repuestos ${fullName}`,
        url: `${SITE_URL}${path}`,
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
        about: { "@type": "Vehicle", name: fullName, brand: { "@type": "Brand", name: brand.name }, model: model.name },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: model.products.length,
          itemListElement: model.products.map((product, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${SITE_URL}${buildProductPath(product)}`,
            name: product.title,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: breadcrumb.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: `${SITE_URL}${item.path === "/" ? "" : item.path}`,
        })),
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-[#f6f8fb] pt-16">
        <div className="bg-navy px-4 sm:px-6 lg:px-8 pt-[30px] pb-[38px]">
          <div className="max-w-7xl mx-auto">
            <nav aria-label="Breadcrumb" className="text-3.25 font-medium text-[#9fb0c8]">
              {breadcrumb.slice(0, -1).map((item) => (
                <span key={item.path}>
                  <Link href={item.path} className="hover:text-white transition-colors">{item.name}</Link>
                  <span className="text-[#5f7090]"> / </span>
                </span>
              ))}
              <span className="text-white">{model.name}</span>
            </nav>
            <h1 className="mt-3 font-display font-bold text-[#f4f7fb] uppercase leading-none text-[clamp(2rem,5vw,3.25rem)]">
              Repuestos {fullName}
            </h1>
            <p className="max-w-3xl text-[#9fb0c8] text-3.75 mt-2 leading-relaxed">
              {model.products.length} repuestos para {fullName}
              {model.displacements.length > 0 && ` ${joinEs(model.displacements)}`}
              {years && ` (${years})`}: {joinEs(categories.map((c) => c.toLowerCase()))}. Originales, OEM y alternos con
              envío a todo Ecuador desde Quito.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
          {[...byCategory].map(([category, products]) => (
            <section key={category}>
              <h2 className="font-display font-bold text-navy text-2xl mb-5">
                {category} para {fullName}
              </h2>
              <ProductGrid products={products} />
            </section>
          ))}

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="bg-white rounded-[14px] border border-slate-200 p-6 sm:p-8">
              <h2 className="font-display font-bold text-navy text-2xl">Preguntas frecuentes</h2>
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
              <div className="bg-white rounded-[14px] border border-slate-200 p-6">
                <h2 className="font-display font-bold text-navy text-xl">Otros modelos {brand.name}</h2>
                <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                  {siblings.map((sibling) => (
                    <li key={sibling.key}>
                      <Link
                        href={buildCatalogModelPath(brand.key, sibling.slug)}
                        className="text-navy font-medium hover:text-brand transition-colors"
                      >
                        {sibling.name}
                      </Link>
                    </li>
                  ))}
                  <li className="col-span-2 mt-2">
                    <Link href={brandPath} className="text-brand font-semibold hover:underline">
                      Todos los repuestos {brand.name} →
                    </Link>
                  </li>
                </ul>
              </div>
              {brandContent?.guides.length ? (
                <div className="bg-white rounded-[14px] border border-slate-200 p-6">
                  <h2 className="font-display font-bold text-navy text-xl">Guías {brand.name}</h2>
                  <ul className="mt-3 space-y-2 text-sm">
                    {brandContent.guides.map((guide) => (
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
        </div>
      </main>
      <Footer />
    </>
  )
}
