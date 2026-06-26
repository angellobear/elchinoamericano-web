import type { Metadata } from "next"
import { MessageCircle } from "lucide-react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { getWhatsAppUrl, siteConfig, contactPageContent } from "@/lib/constants"
import { getPublicVehicleBrands } from "@/lib/db/vehicle-brands"
import {
  DEFAULT_KEYWORDS,
  DEFAULT_SHARE_IMAGE_HEIGHT,
  DEFAULT_SHARE_IMAGE_PATH,
  DEFAULT_SHARE_IMAGE_WIDTH,
  SITE_LOCALE,
  SITE_NAME,
  SITE_URL,
  toAbsoluteUrl,
} from "@/lib/seo"
import ContactoForm from "./ContactoForm"

const { metadata: contactMeta } = contactPageContent

export const metadata: Metadata = {
  title: contactMeta.title,
  description: contactMeta.description,
  keywords: [...contactMeta.keywords, ...DEFAULT_KEYWORDS],
  alternates: { canonical: "/contacto" },
  robots: { index: true, follow: true },
  openGraph: {
    title: contactMeta.title,
    description: contactMeta.ogDescription,
    type: "website",
    locale: SITE_LOCALE,
    siteName: SITE_NAME,
    url: `${SITE_URL}/contacto`,
    images: [
      {
        url: toAbsoluteUrl(DEFAULT_SHARE_IMAGE_PATH),
        alt: contactMeta.imageAlt,
        width: DEFAULT_SHARE_IMAGE_WIDTH,
        height: DEFAULT_SHARE_IMAGE_HEIGHT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: contactMeta.title,
    description: contactMeta.ogDescription,
    images: [toAbsoluteUrl(DEFAULT_SHARE_IMAGE_PATH)],
  },
}

export default async function ContactoPage() {
  const brands = await getPublicVehicleBrands()
  const contactJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": `${SITE_URL}/contacto#page`,
        url: `${SITE_URL}/contacto`,
        name: "Contacto | El Chino Americano",
        description: metadata.description,
        inLanguage: "es-EC",
      },
      {
        "@type": "AutoPartsStore",
        "@id": `${SITE_URL}/#business`,
        name: SITE_NAME,
        url: SITE_URL,
        telephone: siteConfig.contact.whatsappDisplay,
        areaServed: "EC",
        address: {
          "@type": "PostalAddress",
          addressLocality: siteConfig.contact.address.city,
          addressCountry: siteConfig.contact.address.country,
          streetAddress: siteConfig.contact.address.full,
        },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "sales",
          telephone: siteConfig.contact.whatsappDisplay,
          availableLanguage: "es",
          areaServed: "EC",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "¿Cómo cotizo un repuesto?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Puedes escribirnos por WhatsApp o completar el formulario con marca, modelo, año y datos del repuesto para recibir una cotización.",
            },
          },
          {
            "@type": "Question",
            name: "¿Atienden fuera de Santo Domingo de los Tsáchilas?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Sí. Coordinamos pedidos y envíos a distintas ciudades de Ecuador.",
            },
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Contacto", item: `${SITE_URL}/contacto` },
        ],
      },
    ],
  }

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <main className="min-h-screen pt-16">
        {/* Header band */}
        <div className="relative overflow-hidden bg-navy py-10 px-4 sm:px-6 lg:px-8">
          <div
            className="absolute -right-24 -top-32 w-140 h-140 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(224,48,48,.24) 0%,rgba(224,48,48,0) 66%)" }}
            aria-hidden="true"
          />
          <div className="relative max-w-7xl mx-auto">
            <nav aria-label="Breadcrumb" className="text-3.25 text-[#9fb0c8]">
              Inicio <span className="text-[#5f7090]">/</span> <span className="text-white">Contacto</span>
            </nav>
            <h1 className="font-display font-bold text-[#f4f7fb] uppercase leading-[.95] text-[clamp(2.2rem,5vw,3.5rem)] mt-3">
              Hablemos de tu repuesto
            </h1>
            <p className="mt-3 max-w-140 text-[#9fb0c8] text-4.25 leading-[1.55]">
              Cuéntanos qué necesitas. Te respondemos por WhatsApp en menos de 24 horas con
              disponibilidad y precio.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="bg-[#f6f8fb] px-4 sm:px-6 lg:px-8 py-12 lg:py-14">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.15fr_.85fr] gap-8">
            {/* Form card */}
            <div className="bg-white border border-[#e6e9ef] rounded-[18px] p-8 shadow-[0_10px_30px_rgba(13,31,60,.06)]">
              <h2 className="font-display font-bold text-6.5 uppercase text-navy">
                Solicita tu repuesto
              </h2>
              <p className="text-3.5 text-[#8a93a3] mt-1.5 mb-6">
                Mientras más datos nos des, más rápido lo encontramos.
              </p>
              <ContactoForm brands={brands} />
            </div>

            {/* Info + map */}
            <div className="flex flex-col gap-5">
              {/* Contact info card */}
              <div className="bg-navy rounded-[18px] p-7">
                <h3 className="font-display font-bold text-5.5 uppercase text-white mb-5">
                  Datos de contacto
                </h3>
                <ul className="flex flex-col gap-5">
                  <li className="flex gap-3.5 items-start">
                    <div className="w-10.5 h-10.5 rounded-[11px] bg-wa/16 flex items-center justify-center shrink-0">
                      <MessageCircle size={20} className="text-wa" />
                    </div>
                    <div>
                      <p className="text-3 text-[#9fb0c8]">WhatsApp / Ventas</p>
                      <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="font-bold text-4.25 text-white hover:text-wa transition-colors mt-1 block">
                        {siteConfig.contact.whatsappDisplay}
                      </a>
                    </div>
                  </li>
                  <li className="flex gap-3.5 items-start">
                    <div className="w-10.5 h-10.5 rounded-[11px] bg-brand/14 flex items-center justify-center shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e03030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                    <div>
                      <p className="text-3 text-[#9fb0c8]">Local</p>
                      <p className="font-bold text-4 text-white leading-snug mt-1">
                        {siteConfig.contact.address.full}
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3.5 items-start">
                    <div className="w-10.5 h-10.5 rounded-[11px] bg-brand/14 flex items-center justify-center shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e03030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    </div>
                    <div>
                      <p className="text-3 text-[#9fb0c8]">Horario</p>
                      <p className="font-bold text-4 text-white mt-1">{siteConfig.contact.hours.weekdays.display}</p>
                      <p className="font-bold text-4 text-white mt-0.5">{siteConfig.contact.hours.saturday.display}</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Map */}
              <div className="flex-1 min-h-50 rounded-[18px] overflow-hidden border border-[#e6e9ef]">
                <iframe
                  src={siteConfig.contact.map.embedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: 200 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={siteConfig.contact.map.title}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
