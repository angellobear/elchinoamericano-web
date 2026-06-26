import type { Metadata } from "next"
import Navbar from "@/components/Navbar"
import Hero from "@/components/Hero"
import WhyUs from "@/components/WhyUs"
import CtaBand from "@/components/CtaBand"
import Brands from "@/components/Brands"
import Footer from "@/components/Footer"
import { siteConfig } from "@/lib/constants"
import { getVisibleVehicleBrands } from "@/lib/db/vehicle-brands"
import {
  DEFAULT_SHARE_IMAGE_PATH,
  SITE_NAME,
  SITE_URL,
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
  keywords: [...homeMetadata.keywords],
  openGraph: {
    title: homeMetadata.openGraphTitle,
    description: homeMetadata.openGraphDescription,
    type: "website",
    locale: "es_EC",
    siteName: SITE_NAME,
    url: SITE_URL,
    images: [
      {
        url: toAbsoluteUrl(DEFAULT_SHARE_IMAGE_PATH),
        alt: homeMetadata.shareImageAlt,
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
          target: `${SITE_URL}/catalogo?search={search_term_string}`,
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
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/#brands`,
        name: homeStructuredData.brandsListName,
        itemListElement: brands.map((brand, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: brand.name,
          url: `${SITE_URL}/catalogo?marca=${brand.key}`,
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
