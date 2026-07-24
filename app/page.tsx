import type { Metadata } from "next"
import Navbar from "@/components/Navbar"
import Hero from "@/components/Hero"
import WhyUs from "@/components/WhyUs"
import CtaBand from "@/components/CtaBand"
import Brands from "@/components/Brands"
import Footer from "@/components/Footer"
import { siteConfig } from "@/lib/constants"
import { getVisibleVehicleBrands } from "@/lib/db/vehicle-brands"
import { buildCatalogBrandPath } from "@/lib/catalog"
import {
  DEFAULT_KEYWORDS,
  DEFAULT_SHARE_IMAGE_HEIGHT,
  DEFAULT_SHARE_IMAGE_PATH,
  DEFAULT_SHARE_IMAGE_WIDTH,
  GEO_POSITION,
  SITE_NAME,
  SITE_URL,
  SITE_LOCALE,
  toAbsoluteUrl,
} from "@/lib/seo"

export const revalidate = 3600

const { metadata: homeMetadata, structuredData: homeStructuredData } = siteConfig.home

export const metadata: Metadata = {
  title: homeMetadata.title,
  description: homeMetadata.description,
  alternates: {
    canonical: "/",
  },
  keywords: [...homeMetadata.keywords, ...DEFAULT_KEYWORDS],
  category: "Automotive",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: homeMetadata.openGraphTitle,
    description: homeMetadata.openGraphDescription,
    type: "website",
    locale: SITE_LOCALE,
    siteName: SITE_NAME,
    url: SITE_URL,
    images: [
      {
        url: toAbsoluteUrl(DEFAULT_SHARE_IMAGE_PATH),
        alt: homeMetadata.shareImageAlt,
        width: DEFAULT_SHARE_IMAGE_WIDTH,
        height: DEFAULT_SHARE_IMAGE_HEIGHT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: homeMetadata.twitterTitle,
    description: homeMetadata.twitterDescription,
    images: [toAbsoluteUrl(DEFAULT_SHARE_IMAGE_PATH)],
  },
}

const FAQ_ITEMS = [
  {
    q: "¿Qué marcas de vehículos chinos y americanos manejan?",
    a: "Trabajamos con repuestos para las principales marcas chinas presentes en Ecuador: Chery, BYD, JAC, Great Wall, Haval, Lifan, Geely y Brilliance, entre otras. En marcas americanas cubremos Chevrolet, Ford, Dodge, Jeep y Ram. Puedes verificar disponibilidad por WhatsApp o buscando por marca en el catálogo.",
  },
  {
    q: "¿Cuál es la diferencia entre repuesto original, OEM y alterno?",
    a: "Original: fabricado directamente por el proveedor oficial del armador, máxima garantía de compatibilidad. OEM (Original Equipment Manufacturer): misma especificación técnica que el original, fabricado por el proveedor homologado de la marca, a menor precio. Alterno o aftermarket: fabricado por terceros, de buena calidad y relación precio-durabilidad, sin el sello del fabricante original. Los tres tipos están disponibles en El Chino Americano.",
  },
  {
    q: "¿Hacen envíos de repuestos a Quito, Guayaquil y otras ciudades de Ecuador?",
    a: "Sí. Coordinamos envíos a todo el Ecuador: Quito, Guayaquil, Cuenca, Ambato, Loja, Esmeraldas, Manta y más ciudades. El plazo estimado es de 24 a 72 horas según la ciudad. Consúltanos por WhatsApp para confirmar disponibilidad y coordinar el envío.",
  },
  {
    q: "¿Cómo sé si el repuesto es compatible con mi vehículo?",
    a: "La forma más segura es enviarnos por WhatsApp la marca, modelo, año, versión del motor y, si lo tienes, el número de parte original o una foto del repuesto a reemplazar. En el catálogo también puedes filtrar por marca de vehículo y verificar la tabla de compatibilidad de cada producto.",
  },
  {
    q: "¿Puedo consultar y pedir repuestos por WhatsApp sin ir a la tienda?",
    a: "Sí. La mayoría de los pedidos se gestionan completamente por WhatsApp: consultas de disponibilidad, precio, confirmación de compatibilidad y coordinación del envío o retiro en tienda. Respondemos en menos de 24 horas en horario hábil (lunes a viernes 8:30–17:30, sábados 9:00–13:00).",
  },
  {
    q: "¿Los precios del catálogo son definitivos o referenciales?",
    a: "Los precios del catálogo son referenciales. El precio final y la disponibilidad se confirman con el vendedor al momento de la consulta, ya que dependen del stock disponible, el tipo de repuesto (original, OEM o alterno) y posibles variaciones de costo. Escríbenos por WhatsApp para obtener el precio actualizado.",
  },
] as const

export default async function Home() {
  const brands = await getVisibleVehicleBrands()
  const homeFaqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  }
  const homeJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: "es-EC",
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/catalogo?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "AutoPartsStore",
        "@id": `${SITE_URL}/#business`,
        name: SITE_NAME,
        url: SITE_URL,
        image: toAbsoluteUrl(DEFAULT_SHARE_IMAGE_PATH),
        description: homeStructuredData.businessDescription,
        areaServed: {
          "@type": "Country",
          name: "Ecuador",
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: siteConfig.contact.address.city,
          addressCountry: siteConfig.contact.address.country,
          streetAddress: siteConfig.contact.address.full,
        },
        telephone: siteConfig.contact.whatsappDisplay,
        geo: {
          "@type": "GeoCoordinates",
          latitude: GEO_POSITION.split(";")[0],
          longitude: GEO_POSITION.split(";")[1],
        },
        hasMap: siteConfig.contact.map.embedUrl,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          telephone: siteConfig.contact.whatsappDisplay,
          areaServed: "EC",
          availableLanguage: "es",
        },
        openingHours: [siteConfig.contact.hours.weekdays.schema, siteConfig.contact.hours.saturday.schema],
        sameAs: Object.values(siteConfig.social),
        knowsAbout: [...homeStructuredData.knowsAbout],
      },
      homeFaqJsonLd,
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/#brands`,
        name: homeStructuredData.brandsListName,
        itemListElement: brands.map((brand, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: brand.name,
          url: `${SITE_URL}${buildCatalogBrandPath([brand.key])}`,
        })),
      },
    ],
  }

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <main>
        <Hero brands={brands} />
        <WhyUs />
        <CtaBand />
        <Brands brands={brands} />
        <section aria-labelledby="faq-heading" className="border-t border-[#e6e9ef] bg-white">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <h2
              id="faq-heading"
              className="mb-10 font-display text-8 font-bold uppercase leading-none text-navy"
            >
              Preguntas frecuentes
            </h2>
            <dl className="divide-y divide-[#e6e9ef]">
              {FAQ_ITEMS.map(({ q, a }) => (
                <div key={q} className="py-7">
                  <dt className="mb-3 text-4.25 font-bold leading-snug text-navy">{q}</dt>
                  <dd className="text-3.75 leading-[1.65] text-[#566071]">{a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
