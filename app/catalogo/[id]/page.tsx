import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, MessageCircle, Tag, Layers, Car, Package } from "lucide-react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ProductCarousel from "@/components/ProductCarousel"
import AddToCartButton from "@/components/AddToCartButton"
import { products } from "@/data/products"
import { Product, ProductType } from "@/types"
import {
  getProductSeoDescription,
  getProductSeoTitle,
  getProductShareImage,
  getProductShareImageAlt,
  getProductUrl,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo"

export async function generateStaticParams() {
  return products.map((p) => ({ id: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = products.find((p) => p.slug === id) ?? products.find((p) => String(p.id) === id)
  if (!product) return {}

  const typeLabel =
    product.type === "original" ? "Original de fábrica"
    : product.type === "oem"   ? "Genuino OEM"
                                : "Alterno / Aftermarket"

  const title = getProductSeoTitle(product)
  const description = getProductSeoDescription(product, typeLabel)
  const imageUrl = getProductShareImage(product)
  const imageAlt = getProductShareImageAlt(product)
  const canonicalUrl = getProductUrl(product)

  return {
    title,
    description,
    keywords: [
      product.title,
      product.part_brand?.name,
      product.category?.name,
      product.code,
      "repuestos automotrices",
      "Ecuador",
    ].filter((value): value is string => Boolean(value)),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      type: "website",
      siteName: SITE_NAME,
      locale: "es_EC",
      url: canonicalUrl,
      images: [
        {
          url: imageUrl,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  }
}

const TYPE_CONFIG: Record<ProductType, { label: string; description: string; color: string }> = {
  original: {
    label: "Original de fábrica",
    description: "Fabricado por el proveedor oficial del armador. Máxima garantía de compatibilidad.",
    color: "bg-navy text-white",
  },
  oem: {
    label: "Genuino OEM",
    description: "Calidad equivalente al original, fabricado bajo especificaciones del armador.",
    color: "bg-emerald-700 text-white",
  },
  aftermarket: {
    label: "Alterno / Aftermarket",
    description: "Repuesto de mercado libre de alta calidad con excelente relación precio-durabilidad.",
    color: "bg-brand text-white",
  },
}

function buildJsonLd(product: Product) {
  const productUrl = getProductUrl(product)
  const productImage = getProductShareImage(product)

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.title} ${product.part_brand?.name ?? ""}`.trim(),
    description: product.description ?? product.short_description,
    image: [productImage],
    url: productUrl,
    sku: product.sku ?? product.code,
    mpn: product.code,
    brand: { "@type": "Brand", name: product.part_brand?.name },
    category: product.category?.name,
    itemCondition:
      product.condition === "used"
        ? "https://schema.org/UsedCondition"
        : product.condition === "refurbished"
          ? "https://schema.org/RefurbishedCondition"
          : "https://schema.org/NewCondition",
    offers: {
      "@type": "Offer",
      url: productUrl,
      price: (product.offer_price ?? product.price).toFixed(2),
      priceCurrency: "USD",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      areaServed: {
        "@type": "Country",
        name: "Ecuador",
      },
    },
    additionalProperty:
      product.specs?.map((spec) => ({
        "@type": "PropertyValue",
        name: spec.label,
        value: spec.value,
      })) ?? [],
  }
}

function buildBreadcrumbJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Catálogo", item: `${SITE_URL}/catalogo` },
      { "@type": "ListItem", position: 3, name: product.title, item: getProductUrl(product) },
    ],
  }
}

function buildFaqJsonLd(product: Product, typeLabel: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Con qué vehículos es compatible este repuesto?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            product.short_description ??
            "La compatibilidad exacta se confirma según marca, modelo, año y versión del vehículo.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué tipo de repuesto es?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `${product.title} corresponde al tipo ${typeLabel}.`,
        },
      },
      {
        "@type": "Question",
        name: "¿Se puede pedir por WhatsApp y enviar en Ecuador?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Sí. El producto puede consultarse por WhatsApp y la tienda coordina envíos a diferentes ciudades de Ecuador.",
        },
      },
    ],
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // Support both slug-based URLs (new) and numeric IDs (legacy)
  const product = products.find((p) => p.slug === id) ?? products.find((p) => String(p.id) === id)
  if (!product) notFound()

  const typeConfig = TYPE_CONFIG[product.type]
  const categoryName = product.category?.name ?? ''
  const effectivePrice = product.offer_price ?? product.price
  const productUrl = getProductUrl(product)

  const related = products
    .filter((p) => p.category?.key === product.category?.key && p.id !== product.id)
    .slice(0, 4)

  const carouselFallback = (
    <div className="flex flex-col items-center gap-5 px-8 text-center">
      <Package size={88} className="text-navy/15" strokeWidth={0.75} />
      <div className="flex flex-col items-center gap-1">
        <span className="font-display font-bold text-slate-400 text-lg leading-tight">{product.part_brand?.name}</span>
        <span className="text-xs text-slate-400">{categoryName}</span>
      </div>
    </div>
  )

  const whatsappMsg = encodeURIComponent(
    `Hola! Me interesa el repuesto: ${product.title} ${product.part_brand?.name ?? ''} (Cód: ${product.code}). ¿Está disponible? ¿Cuánto es el envío?`
  )
  const typeLabel = typeConfig.label
  const faqJsonLd = buildFaqJsonLd(product, typeLabel)

  return (
    <>
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(product)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(product)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <main className="min-h-screen bg-white pt-16">
        {/* Breadcrumb */}
        <div className="bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
              <Link href="/" className="hover:text-navy transition-colors">Inicio</Link>
              <ChevronRight size={12} className="shrink-0" />
              <Link href="/catalogo" className="hover:text-navy transition-colors">Catálogo</Link>
              <ChevronRight size={12} className="shrink-0" />
              {product.category && (
                <>
                  <Link href={`/catalogo?categoria=${product.category.key}`} className="hover:text-navy transition-colors">
                    {categoryName}
                  </Link>
                  <ChevronRight size={12} className="shrink-0" />
                </>
              )}
              <span className="text-slate-800 font-medium truncate max-w-[200px]">{product.title}</span>
            </nav>
          </div>
        </div>

        {/* Product hero */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Carousel */}
            <div className="w-full max-w-md mx-auto lg:max-w-none">
              <ProductCarousel
                images={product.images?.map(img => img.url)}
                fallback={carouselFallback}
                productName={`${product.title} ${product.part_brand?.name ?? ''}`}
              />
            </div>

            {/* Info panel */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-2">
                {product.category && (
                  <Link
                    href={`/catalogo?categoria=${product.category.key}`}
                    className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full transition-colors"
                  >
                    <Layers size={11} />
                    {categoryName}
                  </Link>
                )}
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${typeConfig.color}`}>
                  <Tag size={11} />
                  {typeConfig.label}
                </span>
              </div>

              <div>
                <p className="text-sm text-slate-500 font-semibold uppercase tracking-wide mb-1">{product.part_brand?.name}</p>
                <h1 className="font-display font-bold text-navy text-4xl lg:text-5xl leading-none">{product.title}</h1>
                <p className="text-xs text-slate-400 mt-1 font-mono">Cód. {product.code}{product.sku && ` · SKU ${product.sku}`}</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Enlace compartible
                </p>
                <p className="text-sm text-slate-700 break-all">{productUrl}</p>
                <p className="text-xs text-slate-500">
                  Al compartir esta URL, las redes tomarán la imagen principal del producto. Si no existe, se usará la imagen institucional del sitio.
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                {product.offer_price && (
                  <span className="text-slate-400 line-through text-2xl">${product.price.toFixed(2)}</span>
                )}
                <span className={`font-display font-bold text-5xl ${product.offer_price ? 'text-brand' : 'text-navy'}`}>
                  ${effectivePrice.toFixed(2)}
                </span>
                <span className="text-slate-400 text-sm">USD · precio referencial</span>
              </div>

              {/* Stock indicator */}
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-slate-600">
                  {product.stock > 0 ? `En stock (${product.stock} disponibles)` : 'Sin stock'}
                </span>
              </div>

              {/* Type explanation */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3">
                <Tag size={16} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{typeConfig.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{typeConfig.description}</p>
                </div>
              </div>

              {/* Compatible brief */}
              {product.short_description && (
                <div className="flex items-start gap-3">
                  <Car size={16} className="text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Compatible con</p>
                    <p className="text-sm text-slate-700">{product.short_description}</p>
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <AddToCartButton product={product} />
                <a
                  href={`https://wa.me/593984878153?text=${whatsappMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-wa hover:bg-wa/90 text-white font-bold text-sm px-6 py-3.5 rounded-md transition-colors duration-150 active:scale-[0.98]"
                >
                  <MessageCircle size={16} />
                  Consultar por WhatsApp
                </a>
              </div>

              <p className="text-xs text-slate-400">
                El precio final y disponibilidad son confirmados por el vendedor. Envíos a todo Ecuador.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                  Compatibilidad
                </p>
                <p className="text-sm text-slate-700">
                  {product.short_description ??
                    "Confirma la compatibilidad con marca, modelo, año y versión antes de comprar."}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                  Tipo de repuesto
                </p>
                <p className="text-sm text-slate-700">{typeLabel}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                  Cobertura
                </p>
                <p className="text-sm text-slate-700">
                  Atención por WhatsApp y coordinación de envíos a diferentes ciudades de Ecuador.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description + Specs */}
        {(product.description || (product.specs && product.specs.length > 0)) && (
          <div className="border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {product.description && (
                  <div>
                    <h2 className="font-display font-bold text-navy text-2xl mb-4">Descripción</h2>
                    <p className="text-slate-600 leading-relaxed text-base">{product.description}</p>
                  </div>
                )}
                {product.specs && product.specs.length > 0 && (
                  <div>
                    <h2 className="font-display font-bold text-navy text-2xl mb-4">Especificaciones</h2>
                    <dl className="border border-slate-200 rounded-xl overflow-hidden">
                      {product.specs.map((spec, i) => (
                        <div
                          key={spec.label}
                          className={`flex items-start gap-4 px-4 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'} ${i < product.specs!.length - 1 ? 'border-b border-slate-100' : ''}`}
                        >
                          <dt className="text-xs font-bold text-slate-500 uppercase tracking-wide min-w-[120px] shrink-0 pt-0.5">{spec.label}</dt>
                          <dd className="text-sm text-slate-800 font-medium">{spec.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Compatible vehicles — structured table */}
        {product.compatibilities && product.compatibilities.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
              <h2 className="font-display font-bold text-navy text-2xl mb-6">Vehículos compatibles</h2>
              <div className="overflow-hidden border border-slate-200 rounded-xl bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Marca</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Modelo</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Cilindraje</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Años</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {product.compatibilities.map((c) => (
                      <tr key={c.vehicle_model_id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">{c.model?.brand?.name ?? '—'}</td>
                        <td className="px-4 py-3 text-slate-600">{c.model?.name ?? '—'}</td>
                        <td className="px-4 py-3 text-slate-500">{c.model?.displacement ?? '—'}</td>
                        <td className="px-4 py-3 text-slate-500">
                          {c.model?.year_start}{c.model?.year_end ? `–${c.model.year_end}` : c.model?.year_start ? '–actual' : ''}
                          {c.notes && <span className="text-slate-400 ml-2 text-xs">({c.notes})</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Equivalencies */}
        {product.equivalencies && product.equivalencies.length > 0 && (
          <div className="border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
              <h2 className="font-display font-bold text-navy text-2xl mb-6">Equivalencias</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {product.equivalencies.map((eq) => {
                  const eqImage = eq.images?.find(i => i.is_primary)?.url ?? eq.images?.[0]?.url
                  return (
                    <Link
                      key={eq.id}
                      href={`/catalogo/${eq.slug}`}
                      className="group flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-white hover:border-brand hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="h-28 bg-slate-50 flex items-center justify-center relative overflow-hidden">
                        {eqImage ? (
                          <Image src={eqImage} alt={eq.title} fill className="object-contain p-2" sizes="200px" />
                        ) : (
                          <Package size={36} className="text-slate-300 group-hover:text-navy/30 transition-colors" strokeWidth={1.5} />
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide mb-0.5">{eq.part_brand?.name}</p>
                        <h3 className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2">{eq.title}</h3>
                        <p className="font-display font-bold text-navy text-base mt-2">${(eq.offer_price ?? eq.price).toFixed(2)}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Related products */}
        {related.length > 0 && (
          <div className="border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display font-bold text-navy text-2xl">Repuestos relacionados</h2>
                {product.category && (
                  <Link href={`/catalogo?categoria=${product.category.key}`} className="text-sm text-brand font-semibold hover:text-brand/75 transition-colors">
                    Ver todos en {categoryName}
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {related.map((rp) => {
                  const rpImage = rp.images?.find(i => i.is_primary)?.url ?? rp.images?.[0]?.url
                  return (
                    <Link
                      key={rp.id}
                      href={`/catalogo/${rp.slug}`}
                      className="group flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-white hover:border-brand hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="h-28 bg-slate-50 flex items-center justify-center relative overflow-hidden">
                        {rpImage ? (
                          <Image src={rpImage} alt={rp.title} fill className="object-contain p-2" sizes="200px" />
                        ) : (
                          <Package size={36} className="text-slate-300 group-hover:text-navy/30 transition-colors" strokeWidth={1.5} />
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide mb-0.5">{rp.part_brand?.name}</p>
                        <h3 className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2">{rp.title}</h3>
                        <p className="font-display font-bold text-navy text-base mt-2">${(rp.offer_price ?? rp.price).toFixed(2)}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
