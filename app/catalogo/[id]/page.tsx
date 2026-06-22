import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight, ShoppingCart, MessageCircle, Tag, Layers, Car } from "lucide-react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ProductCarousel from "@/components/ProductCarousel"
import AddToCartButton from "@/components/AddToCartButton"
import { products } from "@/data/products"
import { Product, ProductType, Category } from "@/types"
import {
  Droplets, CircleDot, Filter, Spline, Zap, ArrowUpDown,
  Thermometer, Disc3, Settings2, Eye, Wind, Activity, Package,
} from "lucide-react"

export async function generateStaticParams() {
  return products.map((p) => ({ id: String(p.id) }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = products.find((p) => p.id === Number(id))
  if (!product) return {}

  const typeLabel =
    product.type === "original"
      ? "Original de fábrica"
      : product.type === "oem"
      ? "Genuino OEM"
      : "Alterno / Aftermarket"

  const title = `${product.name} ${product.brandProduct} | El Chino Americano`
  const description = `Compra ${product.name} marca ${product.brandProduct}. ${typeLabel}. Compatible con ${product.compatible}. Disponible en El Chino Americano, Quito, Ecuador. Precio: $${product.price.toFixed(2)}.`

  return {
    title,
    description,
    keywords: [
      product.name,
      product.brandProduct,
      product.compatible,
      typeLabel,
      "repuestos automotrices Ecuador",
      "repuestos Quito",
      "El Chino Americano",
    ].join(", "),
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "El Chino Americano",
      locale: "es_EC",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: `https://elchinoamericano.com/catalogo/${id}`,
    },
  }
}

const ICON_MAP: Record<string, React.ElementType> = {
  Droplets, CircleDot, Filter, Spline, Zap, ArrowUpDown,
  Thermometer, Disc3, Settings2, Eye, Wind, Activity,
}

const CATEGORY_NAMES: Record<Category, string> = {
  motor: "Motor",
  frenos: "Frenos",
  suspension: "Suspensión",
  filtros: "Filtros",
  carroceria: "Carrocería",
  enfriamiento: "Enfriamiento",
}

const TYPE_CONFIG: Record<
  ProductType,
  { label: string; description: string; color: string }
> = {
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
  alterno: {
    label: "Alterno / Aftermarket",
    description: "Repuesto de mercado libre de alta calidad con excelente relación precio-durabilidad.",
    color: "bg-brand text-white",
  },
}

function buildJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.name} ${product.brandProduct}`,
    description: product.description ?? `Repuesto ${product.name} compatible con ${product.compatible}`,
    brand: {
      "@type": "Brand",
      name: product.brandProduct,
    },
    offers: {
      "@type": "Offer",
      price: product.price.toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "El Chino Americano",
        url: "https://elchinoamericano.com",
      },
    },
    category: CATEGORY_NAMES[product.category],
  }
}

function buildBreadcrumbJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: "https://elchinoamericano.com" },
      { "@type": "ListItem", position: 2, name: "Catálogo", item: "https://elchinoamericano.com/catalogo" },
      { "@type": "ListItem", position: 3, name: product.name, item: `https://elchinoamericano.com/catalogo/${product.id}` },
    ],
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = products.find((p) => p.id === Number(id))
  if (!product) notFound()

  const Icon = ICON_MAP[product.icon] ?? Package
  const typeConfig = TYPE_CONFIG[product.type]
  const categoryName = CATEGORY_NAMES[product.category]

  // Related: same category, exclude current, max 4
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  // Build carousel slides
  const slides = [
    {
      bg: "bg-slate-100",
      content: (
        <div className="flex flex-col items-center gap-4">
          <Icon size={80} className="text-navy/20" strokeWidth={1} />
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest">
            Vista principal
          </span>
        </div>
      ),
    },
    {
      bg: "bg-slate-200",
      content: (
        <div className="flex flex-col items-center gap-3 px-8 text-center">
          <Icon size={56} className="text-slate-500" strokeWidth={1.5} />
          <span className="font-display font-bold text-slate-700 text-xl leading-tight">
            {categoryName}
          </span>
          <span className="text-xs text-slate-500">{product.name}</span>
        </div>
      ),
    },
    {
      bg: "bg-navy",
      content: (
        <div className="flex flex-col items-center gap-4 px-8 text-center">
          <div className="w-12 h-0.5 bg-brand" />
          <span className="font-display font-bold text-white text-2xl leading-tight">
            {product.brandProduct}
          </span>
          <span className="text-white/60 text-xs uppercase tracking-widest">
            {product.name}
          </span>
          <div className="w-12 h-0.5 bg-brand" />
        </div>
      ),
    },
  ]

  const whatsappMsg = encodeURIComponent(
    `Hola! Me interesa el repuesto: ${product.name} ${product.brandProduct} (ID: ${product.id}). Compatible con ${product.compatible}. ¿Está disponible? ¿Cuánto es el envío?`
  )

  return (
    <>
      <Navbar />
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(product)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(product)) }}
      />

      <main className="min-h-screen bg-white pt-16">
        {/* Breadcrumb */}
        <div className="bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
              <Link href="/" className="hover:text-navy transition-colors">Inicio</Link>
              <ChevronRight size={12} className="shrink-0" />
              <Link href="/catalogo" className="hover:text-navy transition-colors">Catálogo</Link>
              <ChevronRight size={12} className="shrink-0" />
              <Link
                href={`/catalogo?categoria=${product.category}`}
                className="hover:text-navy transition-colors"
              >
                {categoryName}
              </Link>
              <ChevronRight size={12} className="shrink-0" />
              <span className="text-slate-800 font-medium truncate max-w-[200px]">{product.name}</span>
            </nav>
          </div>
        </div>

        {/* Product hero: carousel + info */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Carousel */}
            <div className="w-full max-w-md mx-auto lg:max-w-none">
              <ProductCarousel slides={slides} />
            </div>

            {/* Info panel */}
            <div className="flex flex-col gap-6">
              {/* Category + type badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/catalogo?categoria=${product.category}`}
                  className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full transition-colors"
                >
                  <Layers size={11} />
                  {categoryName}
                </Link>
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${typeConfig.color}`}
                >
                  <Tag size={11} />
                  {typeConfig.label}
                </span>
              </div>

              {/* Title */}
              <div>
                <p className="text-sm text-slate-500 font-semibold uppercase tracking-wide mb-1">
                  {product.brandProduct}
                </p>
                <h1 className="font-display font-bold text-navy text-4xl lg:text-5xl leading-none">
                  {product.name}
                </h1>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="font-display font-bold text-navy text-5xl">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-slate-400 text-sm">USD · precio referencial</span>
              </div>

              {/* Type explanation */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3">
                <Tag size={16} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{typeConfig.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{typeConfig.description}</p>
                </div>
              </div>

              {/* Compatible models brief */}
              <div className="flex items-start gap-3">
                <Car size={16} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                    Compatible con
                  </p>
                  <p className="text-sm text-slate-700">{product.compatible}</p>
                </div>
              </div>

              {/* CTA buttons */}
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

        {/* Description + Specs */}
        {(product.description || product.specs) && (
          <div className="border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Description */}
                {product.description && (
                  <div>
                    <h2 className="font-display font-bold text-navy text-2xl mb-4">
                      Descripción
                    </h2>
                    <p className="text-slate-600 leading-relaxed text-base">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Specs table */}
                {product.specs && (
                  <div>
                    <h2 className="font-display font-bold text-navy text-2xl mb-4">
                      Especificaciones
                    </h2>
                    <dl className="border border-slate-200 rounded-xl overflow-hidden">
                      {product.specs.map((spec, i) => (
                        <div
                          key={spec.label}
                          className={`flex items-start gap-4 px-4 py-3 ${
                            i % 2 === 0 ? "bg-white" : "bg-slate-50"
                          } ${i < product.specs!.length - 1 ? "border-b border-slate-100" : ""}`}
                        >
                          <dt className="text-xs font-bold text-slate-500 uppercase tracking-wide min-w-[120px] shrink-0 pt-0.5">
                            {spec.label}
                          </dt>
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

        {/* Compatible vehicles */}
        {product.compatibleList && product.compatibleList.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
              <h2 className="font-display font-bold text-navy text-2xl mb-6">
                Vehículos compatibles
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {product.compatibleList.map((model) => (
                  <li
                    key={model}
                    className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700"
                  >
                    <Car size={14} className="text-navy/40 shrink-0" />
                    {model}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Related products */}
        {related.length > 0 && (
          <div className="border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display font-bold text-navy text-2xl">
                  Repuestos relacionados
                </h2>
                <Link
                  href={`/catalogo?categoria=${product.category}`}
                  className="text-sm text-brand font-semibold hover:text-brand/75 transition-colors"
                >
                  Ver todos en {categoryName}
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {related.map((rp) => {
                  const RpIcon = ICON_MAP[rp.icon] ?? Package
                  return (
                    <Link
                      key={rp.id}
                      href={`/catalogo/${rp.id}`}
                      className="group flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-white hover:border-brand hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="h-28 bg-slate-50 flex items-center justify-center">
                        <RpIcon
                          size={36}
                          className="text-slate-300 group-hover:text-navy/30 transition-colors duration-200"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide mb-0.5">
                          {rp.brandProduct}
                        </p>
                        <h3 className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2">
                          {rp.name}
                        </h3>
                        <p className="font-display font-bold text-navy text-base mt-2">
                          ${rp.price.toFixed(2)}
                        </p>
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
