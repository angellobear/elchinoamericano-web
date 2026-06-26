import { notFound, permanentRedirect } from "next/navigation"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronRight,
  MessageCircle,
  Package,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react"
import AddToCartButton from "@/components/AddToCartButton"
import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"
import ProductCarousel from "@/components/ProductCarousel"
import { products } from "@/data/products"
import {
  DEFAULT_PRODUCT_IMAGE_PATH,
  SITE_NAME,
  SITE_URL,
  getProductDisplayImage,
  getProductSeoDescription,
  getProductSeoTitle,
  getProductShareImage,
  getProductShareImageAlt,
  getProductUrl,
} from "@/lib/seo"
import { getWhatsAppUrl } from "@/lib/constants"
import { buildProductPath, resolveProductFromRouteSegment } from "@/lib/product-slugs"
import type { Product, ProductType } from "@/types"
import ProductStickyBar from "./ProductStickyBar"

export const revalidate = 3600

export async function generateStaticParams() {
  return products.map((product) => ({
    id: buildProductPath(product).replace("/catalogo/", ""),
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const { product } = resolveProductFromRouteSegment(products, id)
  if (!product) return {}

  const typeLabel =
    product.type === "original"
      ? "Original de fabrica"
      : product.type === "oem"
        ? "Genuino OEM"
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
      images: [{ url: imageUrl, alt: imageAlt, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  }
}

const TYPE_CONFIG: Record<
  ProductType,
  {
    label: string
    description: string
    badgeCls: string
    stripBg: string
    stripBorder: string
    stripText: string
    stripSub: string
  }
> = {
  original: {
    label: "Original",
    description: "Fabricado por el proveedor oficial del armador. Maxima garantia de compatibilidad.",
    badgeCls: "bg-navy text-white",
    stripBg: "bg-[#e7ebf1]",
    stripBorder: "border-[#d1d8e2]",
    stripText: "text-navy",
    stripSub: "text-[#566071]",
  },
  oem: {
    label: "Genuino OEM",
    description: "Misma especificacion que el original, fabricado por el proveedor de la marca.",
    badgeCls: "bg-emerald-700 text-white",
    stripBg: "bg-[#eef4ef]",
    stripBorder: "border-[#cfe6d8]",
    stripText: "text-[#13693c]",
    stripSub: "text-[#3f7a56]",
  },
  aftermarket: {
    label: "Alterno",
    description: "Repuesto de mercado libre de alta calidad con excelente relacion precio-durabilidad.",
    badgeCls: "bg-brand text-white",
    stripBg: "bg-brand/6",
    stripBorder: "border-brand/20",
    stripText: "text-brand",
    stripSub: "text-[#566071]",
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
    brand: product.part_brand?.name
      ? { "@type": "Brand", name: product.part_brand.name }
      : undefined,
    category: product.category?.name,
    itemCondition: "https://schema.org/NewCondition",
    offers: {
      "@type": "Offer",
      url: productUrl,
      price: (product.offer_price ?? product.price).toFixed(2),
      priceCurrency: "USD",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      areaServed: { "@type": "Country", name: "Ecuador" },
      priceValidUntil: product.discount_until ?? undefined,
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
          text: "Sí. El producto puede consultarse por WhatsApp y la tienda coordina envíos a diferentes ciudades de Ecuador.",
        },
      },
    ],
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { product, shouldRedirect } = resolveProductFromRouteSegment(products, id)
  if (!product) notFound()
  if (shouldRedirect) {
    permanentRedirect(buildProductPath(product))
  }

  const typeConfig = TYPE_CONFIG[product.type]
  const categoryName = product.category?.name ?? ""
  const effectivePrice = product.offer_price ?? product.price
  const discountPct = product.offer_price
    ? Math.round((1 - product.offer_price / product.price) * 100)
    : 0
  const related = products
    .filter((p) => p.category?.key === product.category?.key && p.id !== product.id)
    .slice(0, 4)

  const whatsappMsg =
    `Hola! Me interesa el repuesto: ${product.title} ${product.part_brand?.name ?? ""} (Cod: ${product.code}). Esta disponible? Cuanto es el envio?`
  const whatsappHref = getWhatsAppUrl(whatsappMsg)
  const ctaTargetId = "product-whatsapp-cta"
  const hasDescription = Boolean(product.description || product.alternate_codes?.length)
  const hasSpecs = Boolean(product.specs?.length)
  const specs = product.specs ?? []
  const quickFacts = [
    product.code ? { label: "Codigo", value: product.code } : null,
    product.part_brand?.name ? { label: "Marca del repuesto", value: product.part_brand.name } : null,
    product.category?.name ? { label: "Categoria", value: product.category.name } : null,
    { label: "Tipo", value: typeConfig.label },
    product.short_description ? { label: "Compatibilidad base", value: product.short_description } : null,
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact))
  const offerDeadline = product.discount_until
    ? new Intl.DateTimeFormat("es-EC", {
        day: "numeric",
        month: "long",
      }).format(new Date(product.discount_until))
    : null

  const carouselFallback = (
    <div className="relative h-full w-full">
      <Image
        src={DEFAULT_PRODUCT_IMAGE_PATH}
        alt={`${product.title} - imagen referencial`}
        title={`${product.title} - imagen referencial`}
        fill
        className="object-contain p-6"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <div className="absolute inset-x-4 bottom-4 rounded-xl bg-navy/84 px-4 py-3 text-left">
        <div className="flex items-center gap-2 text-white/80">
          <Package size={16} strokeWidth={1.5} />
          <span className="text-[11px] font-semibold uppercase tracking-[.08em]">
            Imagen referencial
          </span>
        </div>
        <p className="mt-2 font-display text-base font-bold leading-tight text-white">
          {product.part_brand?.name ?? product.title}
        </p>
        {categoryName && (
          <p className="mt-1 text-xs text-white/70">{categoryName}</p>
        )}
      </div>
    </div>
  )

  const faqJsonLd = buildFaqJsonLd(product, typeConfig.label)

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(product)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(product)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <main className="min-h-screen bg-white pb-24 pt-16 md:pb-0">
        <div className="border-b border-[#e6e9ef] bg-white">
          <div className="mx-auto max-w-7xl px-4 py-3.5 sm:px-6 lg:px-8">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 text-3.25 text-[#8a93a3]"
            >
              <Link href="/" className="transition-colors hover:text-navy">
                Inicio
              </Link>
              <ChevronRight size={12} className="shrink-0" />
              <Link href="/catalogo" className="transition-colors hover:text-navy">
                Catálogo
              </Link>
              {product.category && (
                <>
                  <ChevronRight size={12} className="shrink-0" />
                  <Link
                    href={`/catalogo?categoria=${product.category.key}`}
                    className="transition-colors hover:text-navy"
                  >
                    {categoryName}
                  </Link>
                </>
              )}
              <ChevronRight size={12} className="shrink-0" />
              <span className="max-w-50 truncate font-medium text-navy">
                {product.title}
              </span>
            </nav>
          </div>
        </div>

        <section className="bg-[#f6f8fb]">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
            <div className="grid grid-cols-1 gap-11 lg:grid-cols-2 lg:gap-14">
              <div className="mx-auto w-full max-w-md lg:max-w-none">
                <div className="relative overflow-hidden rounded-[18px] border border-[#e6e9ef] bg-white">
                  {discountPct > 0 && (
                    <span className="absolute left-4 top-4 z-10 rounded-[7px] bg-brand px-2.5 py-1.5 text-2.75 font-bold uppercase tracking-[.05em] text-white">
                      -{discountPct}% OFF
                    </span>
                  )}
                  <ProductCarousel
                    images={product.images?.map((img) => img.url)}
                    fallback={carouselFallback}
                    productName={`${product.title} ${product.part_brand?.name ?? ""}`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex flex-wrap gap-2">
                  {product.category && (
                    <Link
                      href={`/catalogo?categoria=${product.category.key}`}
                      className="rounded-[7px] bg-[#e7ebf1] px-2.5 py-1.5 text-2.75 font-bold uppercase tracking-[.05em] text-navy transition-colors hover:bg-[#d5dbe5]"
                    >
                      {categoryName}
                    </Link>
                  )}
                  <span
                    className={`rounded-[7px] px-2.5 py-1.5 text-2.75 font-bold uppercase tracking-[.05em] ${typeConfig.badgeCls}`}
                  >
                    {typeConfig.label}
                  </span>
                  {product.is_featured && (
                    <span className="rounded-[7px] bg-[#ffd23f] px-2.5 py-1.5 text-2.75 font-bold uppercase tracking-[.05em] text-navy">
                      Destacado
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-3.25 font-semibold uppercase tracking-[.04em] text-[#8a93a3]">
                    {product.part_brand?.name}
                  </p>
                  <h1 className="mt-2 font-display text-[clamp(2rem,4.5vw,3.125rem)] font-bold uppercase leading-none text-navy">
                    {product.title}
                  </h1>
                  <p className="mt-3 font-mono text-3.25 text-[#9aa3b2]">
                    {product.code}
                    {product.sku && ` · SKU ${product.sku}`}
                  </p>
                </div>

                <div className="mt-1 flex items-end gap-3">
                  <span className="font-display text-[clamp(2.5rem,5vw,3.375rem)] font-bold leading-none text-navy">
                    ${effectivePrice.toFixed(2)}
                  </span>
                  {product.offer_price && (
                    <span className="mb-1 text-5 leading-none text-[#9aa3b2] line-through">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                  {discountPct > 0 && (
                    <span className="mb-0.5 rounded-lg bg-brand px-2.5 py-1.5 text-3.25 font-bold text-white">
                      {discountPct}% OFF
                    </span>
                  )}
                </div>

                {offerDeadline && discountPct > 0 && (
                  <p className="-mt-2 text-[12.5px] text-amber-700">
                    Oferta valida hasta el {offerDeadline}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.25 w-2.25 shrink-0 rounded-full ${product.stock > 0 ? "bg-emerald-500" : "bg-red-500"}`}
                  />
                  <span
                    className={`text-3.5 font-semibold ${product.stock > 0 ? "text-emerald-700" : "text-red-600"}`}
                  >
                    {product.stock > 0
                      ? `En stock — ${product.stock} disponibles`
                      : "Sin stock"}
                  </span>
                </div>

                <a
                  id={ctaTargetId}
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 rounded-[14px] bg-wa py-5 text-4.5 font-bold text-[#062b15] shadow-[0_14px_30px_rgba(37,211,102,.28)] transition-all hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wa"
                >
                  <MessageCircle size={22} />
                  Consultar por WhatsApp
                </a>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="sm:flex-1">
                    <AddToCartButton product={product} />
                  </div>
                  <Link
                    href="/catalogo"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#cdd4de] px-5 py-3.5 text-sm font-bold text-navy transition-colors hover:border-brand hover:text-brand"
                  >
                    <ShoppingCart size={16} />
                    Seguir comprando
                  </Link>
                </div>

                {product.short_description && (
                  <p className="text-3.75 leading-[1.6] text-[#566071]">
                    {product.short_description}
                  </p>
                )}

                {quickFacts.length > 0 && (
                  <section
                    aria-labelledby="product-quick-summary"
                    className="rounded-[13px] border border-[#e6e9ef] bg-[#f8fafc] p-4"
                  >
                    <h2
                      id="product-quick-summary"
                      className="text-3.25 font-bold uppercase tracking-[.08em] text-navy"
                    >
                      Resumen rapido
                    </h2>
                    <dl className="mt-3 space-y-2">
                      {quickFacts.map((fact) => (
                        <div
                          key={fact.label}
                          className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                        >
                          <dt className="text-3 text-[#8a93a3]">{fact.label}</dt>
                          <dd className="text-3.25 font-semibold text-navy sm:max-w-[70%] sm:text-right">
                            {fact.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                )}

                <div
                  className={`flex gap-3 rounded-[13px] border p-4 ${typeConfig.stripBg} ${typeConfig.stripBorder}`}
                >
                  <ShieldCheck
                    size={20}
                    className={`mt-0.5 shrink-0 ${typeConfig.stripText}`}
                    strokeWidth={2}
                  />
                  <div>
                    <p className={`text-3.5 font-bold ${typeConfig.stripText}`}>
                      {typeConfig.label} — calidad verificada
                    </p>
                    <p className={`mt-0.5 text-3.25 leading-relaxed ${typeConfig.stripSub}`}>
                      {typeConfig.description}
                    </p>
                  </div>
                </div>

                <p className="text-3 text-slate-400">
                  El precio final y disponibilidad son confirmados por el vendedor. Envios a todo Ecuador.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 bg-navy sm:grid-cols-3">
          {[
            {
              icon: Truck,
              title: "Envio a todo Ecuador",
              sub: "Entrega 24–72 h",
              iconCls: "text-brand",
              iconBg: "bg-brand/14",
            },
            {
              icon: ShieldCheck,
              title: "Garantia del proveedor",
              sub: "Producto verificado",
              iconCls: "text-brand",
              iconBg: "bg-brand/14",
            },
            {
              icon: MessageCircle,
              title: "Respuesta < 24 h",
              sub: "Asesoria por WhatsApp",
              iconCls: "text-wa",
              iconBg: "bg-wa/14",
            },
          ].map(({ icon: Icon, title, sub, iconCls, iconBg }, index) => (
            <div
              key={title}
              className={`flex items-center gap-3.5 px-10 py-6 ${index < 2 ? "sm:border-r border-white/8" : ""}`}
            >
              <div
                className={`flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-[11px] ${iconBg}`}
              >
                <Icon size={20} className={iconCls} strokeWidth={2} />
              </div>
              <div>
                <p className="text-3.75 font-bold leading-tight text-white">{title}</p>
                <p className="mt-0.5 text-3.25 text-[#7e8ca3]">{sub}</p>
              </div>
            </div>
          ))}
        </section>

        {(hasDescription || hasSpecs) && (
          <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1.1fr_.9fr]">
              {hasDescription && (
                <div>
                  <h2 className="mb-4 font-display text-7.5 font-bold uppercase leading-none text-navy">
                    Descripcion
                  </h2>
                  {product.description && (
                    <p className="text-[15.5px] leading-[1.65] text-[#566071]">
                      {product.description}
                    </p>
                  )}
                  {product.alternate_codes && product.alternate_codes.length > 0 && (
                    <div className="mt-6">
                      <p className="mb-3 text-3.5 font-bold uppercase tracking-[.06em] text-navy">
                        Codigos alternos / cruzados
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.alternate_codes.map((altCode) => (
                          <span
                            key={altCode.id}
                            className="rounded-lg border border-[#e0e5ec] bg-[#f3f5f9] px-3 py-2 font-mono text-3.25 text-[#566071]"
                          >
                            {altCode.code}
                            {altCode.source ? ` · ${altCode.source}` : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {hasSpecs && specs.length > 0 && (
                <div>
                  <h2 className="mb-4 font-display text-7.5 font-bold uppercase leading-none text-navy">
                    Especificaciones
                  </h2>
                  <div>
                    {specs.map((spec, index) => (
                      <div
                        key={`${spec.label}-${index}`}
                        className={`flex justify-between py-3.5 ${index < specs.length - 1 ? "border-b border-[#ebeef3]" : ""}`}
                      >
                        <span className="text-3.5 text-[#8a93a3]">{spec.label}</span>
                        <span className="text-3.5 font-semibold text-navy">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {product.compatibilities && product.compatibilities.length > 0 && (
          <section className="border-t border-[#e6e9ef] bg-[#f6f8fb]">
            <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-[11px] bg-brand/12">
                  <Truck size={21} className="text-brand" strokeWidth={2} />
                </div>
                <h2 className="font-display text-9 font-bold uppercase leading-none text-navy">
                  Sirve para mi vehiculo?
                </h2>
              </div>
              <p className="mb-6 text-3.75 text-[#566071]">
                Confirma el modelo y ano de tu auto. Si tienes dudas, escribenos la placa por WhatsApp y lo verificamos.
              </p>
              {(() => {
                const byBrand = product.compatibilities.reduce<
                  Record<string, NonNullable<Product["compatibilities"]>>
                >((acc, compatibility) => {
                  const brand = compatibility.model?.brand?.name ?? "Otros"
                  ;(acc[brand] ??= []).push(compatibility)
                  return acc
                }, {})

                return Object.entries(byBrand).map(([brandName, compatibilities]) => (
                  <div
                    key={brandName}
                    className="mb-4 overflow-hidden rounded-2xl border border-[#e6e9ef] bg-white"
                  >
                    <div className="flex items-center gap-3 bg-navy px-5 py-4">
                      <span className="flex h-7.5 w-7.5 items-center justify-center rounded-[7px] bg-white/14 text-2.75 font-bold text-white">
                        {brandName.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="font-display text-4.5 font-bold uppercase tracking-[.04em] text-white">
                        {brandName}
                      </span>
                    </div>
                    {compatibilities.map((compatibility, index) => (
                      <div
                        key={`${compatibility.vehicle_model_id}-${index}`}
                        className={`flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${index < compatibilities.length - 1 ? "border-b border-[#ebeef3]" : ""}`}
                      >
                        <div>
                          <span className="text-4 font-bold text-navy">
                            {compatibility.model?.name}
                          </span>
                          {compatibility.model?.displacement && (
                            <span className="text-3.5 text-[#8a93a3]">
                              {" "}
                              · {compatibility.model.displacement}
                            </span>
                          )}
                          {compatibility.notes && (
                            <span className="ml-2 text-3.25 text-[#8a93a3]">
                              ({compatibility.notes})
                            </span>
                          )}
                        </div>
                        {(compatibility.model?.year_start || compatibility.model?.year_end) && (
                          <span className="shrink-0 rounded-[7px] bg-[#e7ebf1] px-3 py-1.5 text-3 font-semibold text-navy">
                            {compatibility.model?.year_start}
                            {compatibility.model?.year_end
                              ? `–${compatibility.model.year_end}`
                              : "–actual"}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ))
              })()}
            </div>
          </section>
        )}

        {product.equivalencies && product.equivalencies.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <h2 className="mb-2 font-display text-8 font-bold uppercase leading-none text-navy">
              Mismo repuesto, otra marca
            </h2>
            <p className="mb-6 text-3.5 text-[#8a93a3]">
              Equivalencias verificadas — misma pieza, distinta linea o fabricante.
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {product.equivalencies.map((equivalency) => {
                const equivalencyImage =
                  equivalency.images?.find((img) => img.is_primary)?.url ??
                  equivalency.images?.[0]?.url
                const equivalencyBadge =
                  TYPE_CONFIG[equivalency.type as ProductType] ?? TYPE_CONFIG.aftermarket

                return (
                  <Link
                    key={equivalency.id}
                    href={buildProductPath(equivalency)}
                    className="group flex flex-col rounded-[15px] border border-[#e6e9ef] bg-white p-4.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand hover:shadow-[0_10px_28px_rgba(13,31,60,.10)]"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <span
                        className={`rounded-md px-2 py-1 text-2.5 font-bold uppercase tracking-[.05em] ${equivalencyBadge.badgeCls}`}
                      >
                        {equivalencyBadge.label}
                      </span>
                      <span className="font-mono text-2.75 text-[#9aa3b2]">
                        {equivalency.code}
                      </span>
                    </div>
                    {equivalencyImage && (
                      <div className="relative mb-3 h-20">
                        <Image
                          src={equivalencyImage}
                          alt={equivalency.title}
                          fill
                          className="object-contain"
                          sizes="180px"
                        />
                      </div>
                    )}
                    <h3 className="mt-1 font-display text-4.75 font-bold uppercase leading-tight text-navy">
                      {equivalency.title}
                    </h3>
                    <div className="mt-3 flex items-end justify-between">
                      <span className="font-display text-6.25 font-bold leading-none text-navy">
                        ${(equivalency.offer_price ?? equivalency.price).toFixed(2)}
                      </span>
                      {equivalency.stock > 0 && (
                        <span className="text-3 font-semibold text-emerald-700">
                          En stock
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="border-t border-[#e6e9ef]">
            <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="font-display text-8 font-bold uppercase leading-none text-navy">
                  Tambien de {categoryName || "esta categoria"}
                </h2>
                {product.category && (
                  <Link
                    href={`/catalogo?categoria=${product.category.key}`}
                    className="text-3.5 font-semibold text-brand transition-colors hover:text-brand/75"
                  >
                    Ver todos →
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {related.map((relatedProduct) => {
                  const relatedImage = getProductDisplayImage(relatedProduct)
                  const hasRelatedImage = Boolean(relatedProduct.images?.length)

                  return (
                    <Link
                      key={relatedProduct.id}
                      href={buildProductPath(relatedProduct)}
                      className="group flex flex-col overflow-hidden rounded-[14px] border border-[#e6e9ef] bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-brand hover:shadow-[0_10px_28px_rgba(13,31,60,.10)]"
                    >
                      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#f3f5f9]">
                        <Image
                          src={relatedImage}
                          alt={hasRelatedImage ? relatedProduct.title : `${relatedProduct.title} - imagen referencial`}
                          fill
                          className={hasRelatedImage ? "object-cover" : "object-contain p-2"}
                          sizes="200px"
                        />
                        {!hasRelatedImage && (
                          <div className="absolute inset-x-0 bottom-0 bg-navy/82 px-3 py-2 text-center">
                            <span className="text-[11px] font-semibold uppercase tracking-[.08em] text-white/85">
                              Imagen referencial
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-[13px_14px]">
                        <p className="text-2.5 font-semibold uppercase tracking-[.06em] text-[#8a93a3]">
                          {relatedProduct.part_brand?.name}
                        </p>
                        <h3 className="mt-1 font-display text-4 font-bold uppercase leading-tight text-navy">
                          {relatedProduct.title}
                        </h3>
                        <p className="mt-2 font-display text-5 font-bold text-navy">
                          ${(relatedProduct.offer_price ?? relatedProduct.price).toFixed(2)}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        <ProductStickyBar
          ctaTargetId={ctaTargetId}
          currentPrice={effectivePrice}
          originalPrice={product.offer_price ? product.price : undefined}
          whatsappHref={whatsappHref}
        />
      </main>
      <Footer />
    </>
  )
}
