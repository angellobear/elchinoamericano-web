import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { guias, CATEGORIAS, getGuiaBySlug, type GuiaBloque, type GuiaCategoria } from "@/data/guias"
import { SITE_NAME, SITE_URL, toAbsoluteUrl } from "@/lib/seo"
import { getWhatsAppUrl } from "@/lib/constants"

type Props = { params: Promise<{ categoria: string; slug: string }> }

export async function generateStaticParams() {
  return guias.map((g) => ({ categoria: g.categoria, slug: g.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria, slug } = await params
  const guia = getGuiaBySlug(categoria, slug)
  if (!guia) return {}

  const url = toAbsoluteUrl(`/guias/${guia.categoria}/${guia.slug}`)

  return {
    title: `${guia.titulo} | ${SITE_NAME}`,
    description: guia.descripcion,
    keywords: [...guia.keywords, "repuestos Ecuador", "El Chino Americano"],
    alternates: { canonical: `/guias/${guia.categoria}/${guia.slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      title: guia.titulo,
      description: guia.descripcion,
      type: "article",
      url,
      siteName: SITE_NAME,
      publishedTime: guia.fechaPublicacion,
    },
    twitter: {
      card: "summary",
      title: guia.titulo,
      description: guia.descripcion,
    },
  }
}

function buildJsonLd(guia: NonNullable<ReturnType<typeof getGuiaBySlug>>) {
  const url = toAbsoluteUrl(`/guias/${guia.categoria}/${guia.slug}`)
  const categoriaInfo = CATEGORIAS[guia.categoria]

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Guías", item: `${SITE_URL}/guias` },
      { "@type": "ListItem", position: 3, name: categoriaInfo.label, item: `${SITE_URL}/guias/${guia.categoria}` },
      { "@type": "ListItem", position: 4, name: guia.titulo, item: url },
    ],
  }

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guia.titulo,
    description: guia.descripcion,
    url,
    datePublished: guia.fechaPublicacion,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  }

  const faqLd = guia.faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: guia.faq.map((item) => ({
          "@type": "Question",
          name: item.pregunta,
          acceptedAnswer: { "@type": "Answer", text: item.respuesta },
        })),
      }
    : null

  return { breadcrumb, article, faqLd }
}

function renderBloque(bloque: GuiaBloque, index: number) {
  switch (bloque.tipo) {
    case "h2":
      return <h2 key={index} className="mt-8 mb-3 text-xl font-semibold text-navy">{bloque.texto}</h2>
    case "h3":
      return <h3 key={index} className="mt-6 mb-2 text-lg font-semibold text-gray-800">{bloque.texto}</h3>
    case "p":
      return <p key={index} className="mb-4 leading-relaxed text-gray-700">{bloque.texto}</p>
    case "ul":
      return (
        <ul key={index} className="mb-4 list-disc pl-5 space-y-1.5 text-gray-700">
          {bloque.items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      )
    case "ol":
      return (
        <ol key={index} className="mb-4 list-decimal pl-5 space-y-1.5 text-gray-700">
          {bloque.items.map((item, i) => <li key={i}>{item}</li>)}
        </ol>
      )
    case "aviso":
      return (
        <div key={index} className="my-5 rounded-lg border-l-4 border-brand bg-brand/5 px-5 py-4 text-sm text-gray-700">
          <strong className="text-brand">Importante: </strong>{bloque.texto}
        </div>
      )
  }
}

export default async function GuiaDetailPage({ params }: Props) {
  const { categoria, slug } = await params
  const guia = getGuiaBySlug(categoria, slug)
  if (!guia) notFound()

  const categoriaInfo = CATEGORIAS[guia.categoria]
  const { breadcrumb, article, faqLd } = buildJsonLd(guia)
  const waMessage = guia.ctaWhatsApp
    ? `Hola! Le escribo desde [su ciudad]. ${guia.ctaWhatsApp}`
    : undefined
  const waUrl = getWhatsAppUrl(waMessage)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      {faqLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      )}

      <main className="mx-auto max-w-3xl px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">Inicio</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <Link href="/guias" className="hover:underline">Guías</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <Link href={`/guias/${guia.categoria}`} className="hover:underline">{categoriaInfo.label}</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="text-gray-700">{guia.titulo}</span>
        </nav>

        <article>
          <h1 className="mb-5 text-3xl font-bold leading-tight text-navy">{guia.titulo}</h1>

          {/* Respuesta corta — lo que los LLMs y rich snippets citan */}
          <div className="mb-8 rounded-xl border border-navy/10 bg-navy/4 px-6 py-5">
            <p className="text-base leading-relaxed text-gray-800">{guia.respuesta_corta}</p>
          </div>

          {/* Contenido principal */}
          <div>
            {guia.contenido.map((bloque, i) => renderBloque(bloque, i))}
          </div>

          {/* Productos relacionados */}
          {guia.productosRelacionados && guia.productosRelacionados.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 text-xl font-semibold text-navy">Ver en el catálogo</h2>
              <div className="flex flex-wrap gap-3">
                {guia.productosRelacionados.map((prod) => (
                  <Link
                    key={prod.href}
                    href={prod.href}
                    className="rounded-full border border-navy/20 bg-white px-4 py-2 text-sm font-medium text-navy hover:bg-navy hover:text-white transition-colors"
                  >
                    {prod.nombre} →
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* FAQ */}
          {guia.faq && guia.faq.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 text-xl font-semibold text-navy">Preguntas frecuentes</h2>
              <div className="space-y-4">
                {guia.faq.map((item, i) => (
                  <div key={i} className="rounded-lg border border-gray-200 px-5 py-4">
                    <p className="mb-2 font-medium text-gray-900">{item.pregunta}</p>
                    <p className="text-sm text-gray-600">{item.respuesta}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </article>

        {/* CTA WhatsApp */}
        <div className="mt-12 rounded-2xl bg-navy px-6 py-8 text-center text-white">
          <p className="mb-2 text-lg font-semibold">¿Necesitas el repuesto para tu vehículo?</p>
          <p className="mb-6 text-sm text-white/80">
            Escríbenos por WhatsApp y te confirmamos disponibilidad y precio. Enviamos a todo el Ecuador desde Quito.
          </p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-wa px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Consultar por WhatsApp
          </a>
        </div>

        {/* Guías relacionadas */}
        {guia.guiasRelacionadas && guia.guiasRelacionadas.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Guías relacionadas</h2>
            <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200">
              {guia.guiasRelacionadas.map((rel) => (
                <li key={rel.href}>
                  <Link
                    href={rel.href}
                    className="flex items-center justify-between px-5 py-3.5 text-sm text-navy hover:bg-gray-50"
                  >
                    <span>{rel.titulo}</span>
                    <span className="ml-4 shrink-0 text-gray-400">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-8 text-center">
          <Link href="/guias" className="text-sm text-gray-500 hover:underline">
            ← Ver todas las guías
          </Link>
        </div>
      </main>
    </>
  )
}
