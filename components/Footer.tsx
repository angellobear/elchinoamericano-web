import Image from "next/image"
import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { buildCatalogBrandPath } from "@/lib/catalog"
import { getWhatsAppUrl, siteConfig } from "@/lib/constants"

const CATALOG_LINKS = [
  { label: "Motor", href: "/catalogo?categoria=motor" },
  { label: "Frenos", href: "/catalogo?categoria=frenos" },
  { label: "Suspensión", href: "/catalogo?categoria=suspension" },
  { label: "Eléctrico", href: "/catalogo?categoria=electrico" },
  { label: "Carrocería", href: "/catalogo?categoria=carroceria" },
]

const BRAND_LINKS = [
  { label: "Chery", href: buildCatalogBrandPath(["chery"]) },
  { label: "SWM", href: buildCatalogBrandPath(["swm"]) },
  { label: "Great Wall", href: buildCatalogBrandPath(["great_wall"]) },
  { label: "Shineray", href: buildCatalogBrandPath(["shineray"]) },
  { label: "Ford", href: buildCatalogBrandPath(["ford"]) },
  { label: "Chevrolet", href: buildCatalogBrandPath(["chevrolet"]) },
]

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  )
}

export default function Footer() {
  const socialLinks = [
    { href: siteConfig.social.facebook, label: "Facebook", icon: <FacebookIcon />, cls: "text-[#9fb0c8] hover:text-white" },
    { href: siteConfig.social.instagram, label: "Instagram", icon: <InstagramIcon />, cls: "text-[#9fb0c8] hover:text-white" },
    { href: siteConfig.social.tiktok, label: "TikTok", icon: <TikTokIcon />, cls: "text-[#9fb0c8] hover:text-white" },
    { href: getWhatsAppUrl(), label: "WhatsApp", icon: <MessageCircle size={18} />, cls: "text-wa hover:brightness-105" },
  ]

  return (
    <footer className="bg-[#081120]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[60px] pb-7">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-10 pb-12 border-b border-white/8">
          {/* Brand + social */}
          <div className="flex flex-col gap-5">
            <Link href="/">
              <Image
                src="/logo-ca.png"
                alt="El Chino Americano"
                width={160}
                height={64}
                className="h-16 w-auto object-contain"
                style={{ width: "auto", height: "64px" }}
              />
            </Link>
            <p className="text-[#7e8ca3] text-sm leading-relaxed max-w-70">
              Repuestos originales, OEM y alternos para autos chinos y americanos. {siteConfig.contact.address.full}
            </p>
            <div className="flex gap-2.5">
              {socialLinks.map(({ href, label, icon, cls }) => {
                const external = href !== "#"
                const isWa = label === "WhatsApp"

                return (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className={`w-9.5 h-9.5 rounded-[10px] flex items-center justify-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${isWa ? "bg-wa text-[#062b15] hover:brightness-105" : `bg-[#13294a] ${cls}`}`}
                >
                  {icon}
                </a>
                )
              })}
            </div>
          </div>

          {/* Catálogo */}
          <div>
            <h4 className="font-display font-bold text-white text-3.75 tracking-[.12em] uppercase mb-4.5">
              Catálogo
            </h4>
            <ul className="flex flex-col gap-[11px]">
              {CATALOG_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-[#7e8ca3] hover:text-white text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:text-brand"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Marcas */}
          <div>
            <h4 className="font-display font-bold text-white text-3.75 tracking-[.12em] uppercase mb-4.5">
              Marcas
            </h4>
            <ul className="flex flex-col gap-[11px]">
              {BRAND_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-[#7e8ca3] hover:text-white text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:text-brand"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-display font-bold text-white text-3.75 tracking-[.12em] uppercase mb-4.5">
              Contacto
            </h4>
            <ul className="flex flex-col gap-3.5">
              <li className="flex gap-2.5 items-start">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#e03030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span className="text-[#9fb0c8] text-3.5 leading-snug">{siteConfig.contact.address.full}</span>
              </li>
              <li className="flex gap-2.5 items-center">
                <MessageCircle size={17} className="text-wa shrink-0" />
                <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="text-white font-semibold text-3.5 hover:text-wa transition-colors">
                  {siteConfig.contact.whatsappDisplay}
                </a>
              </li>
              <li className="flex gap-2.5 items-center">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#e03030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                <span className="text-[#9fb0c8] text-3.5">{siteConfig.contact.hours.display}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-[22px] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[#5f7090] text-3.25">
            © {new Date().getFullYear()} El Chino Americano. Todos los derechos reservados.
          </p>
          <p className="text-[#5f7090] text-3.25">Repuestos chinos y americanos · Ecuador</p>
        </div>
      </div>
    </footer>
  )
}
