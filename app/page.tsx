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

export default async function Home() {
  const brands = await getVisibleVehicleBrands()
  const homeFaqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Qué tipo de repuestos vende El Chino Americano?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Trabajamos con repuestos originales, OEM y alternos para vehículos chinos y americanos.",
        },
      },
      {
        "@type": "Question",
        name: "¿Hacen envíos fuera de Santo Domingo de los Tsáchilas?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí. Coordinamos envíos a diferentes ciudades de Ecuador y brindamos asesoría por WhatsApp antes de la compra.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cómo confirmo la compatibilidad de un repuesto?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Puedes escribirnos por WhatsApp con marca, modelo, año, número de pieza o una foto para validar la aplicación correcta del repuesto.",
        },
      },
    ],
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
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          telephone: siteConfig.contact.whatsappDisplay,
          areaServed: "EC",
          availableLanguage: "es",
        },
        openingHours: "Mo-Sa 08:00-18:00",
        sameAs: Object.values(siteConfig.social).filter((url) => url !== "#"),
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
      </main>
      <Footer />
    </>
  )
}
