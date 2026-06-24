import type { Metadata } from "next"
import {
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ContactoForm from "./ContactoForm"

const BUSINESS_EMAIL = "pedidos@elchinoamericano.com"

const SOCIAL_LINKS = [
  { label: "Facebook", href: "#", color: "text-[#1877F2]" },
  { label: "Instagram", href: "#", color: "text-[#E4405F]" },
  { label: "TikTok", href: "#", color: "text-slate-800" },
  {
    label: "WhatsApp",
    href: "https://wa.me/593984878153",
    color: "text-wa",
    external: true,
  },
] as const

export const metadata: Metadata = {
  title: "Contacto | El Chino Americano",
  description:
    "Contacta a El Chino Americano por correo, teléfono o WhatsApp para cotizar repuestos automotrices en Ecuador.",
  alternates: {
    canonical: "/contacto",
  },
  openGraph: {
    title: "Contacto | El Chino Americano",
    description:
      "Escríbenos para cotizar repuestos, resolver compatibilidades o coordinar envíos en Ecuador.",
    type: "website",
    locale: "es_EC",
    siteName: "El Chino Americano",
    url: "https://elchinoamericano.com/contacto",
  },
  twitter: {
    card: "summary",
    title: "Contacto | El Chino Americano",
    description:
      "Escríbenos para cotizar repuestos, resolver compatibilidades o coordinar envíos en Ecuador.",
  },
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  )
}

function SocialIcon({ label }: { label: (typeof SOCIAL_LINKS)[number]["label"] }) {
  if (label === "Facebook") return <FacebookIcon />
  if (label === "Instagram") return <InstagramIcon />
  if (label === "TikTok") return <TikTokIcon />
  return <MessageCircle size={20} />
}

export default function ContactoPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-16">
        <div className="bg-navy">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <h1 className="font-display font-bold text-white text-4xl lg:text-5xl leading-none">
              Contacto
            </h1>
            <p className="text-white/55 mt-3 text-base max-w-lg">
              Escríbenos por correo, llámanos o visítanos en Santo Domingo de los
              Tsáchilas. Respondemos en menos de 24 horas en días laborables.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div className="order-2 lg:order-1">
              <h2 className="font-display font-bold text-navy text-2xl mb-2">
                Envía tu consulta por correo
              </h2>
              <p className="text-slate-500 text-sm mb-7">
                Al enviar, se abrirá tu cliente de correo con el mensaje listo para
                mandarnos a{" "}
                <span className="font-semibold text-navy">{BUSINESS_EMAIL}</span>.
              </p>

              <ContactoForm />
            </div>

            <div className="order-1 lg:order-2 flex flex-col gap-8">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex flex-col gap-5">
                <h2 className="font-display font-bold text-navy text-xl">
                  Información de contacto
                </h2>
                <ul className="flex flex-col gap-4">
                  <li className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-navy/8 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <Phone size={16} className="text-navy" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide mb-0.5">
                        Teléfono
                      </p>
                      <a
                        href="tel:+593984878153"
                        className="text-sm font-semibold text-navy hover:text-brand transition-colors"
                      >
                        +593 984 878 153
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-navy/8 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <Mail size={16} className="text-navy" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide mb-0.5">
                        Correo
                      </p>
                      <a
                        href={`mailto:${BUSINESS_EMAIL}`}
                        className="text-sm font-semibold text-navy hover:text-brand transition-colors break-all"
                      >
                        {BUSINESS_EMAIL}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-navy/8 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin size={16} className="text-navy" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide mb-0.5">
                        Ubicación
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        Santo Domingo de los Tsáchilas, Ecuador
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-navy/8 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <Clock size={16} className="text-navy" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide mb-0.5">
                        Horario de atención
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        Lun – Vie: 8:30 – 17:30
                      </p>
                      <p className="text-sm text-slate-500">Sábados: 9:00 – 13:00</p>
                      <p className="text-xs text-slate-400 mt-0.5">Domingos cerrado</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="font-display font-bold text-navy text-lg">
                  Redes sociales
                </h3>
                <div className="flex items-center gap-2 -ml-2">
                  {SOCIAL_LINKS.map((link) => {
                    const isExternal = "external" in link && link.external

                    return (
                      <a
                        key={link.label}
                        href={link.href}
                        aria-label={link.label}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-all duration-150 ${link.color}`}
                      >
                        <SocialIcon label={link.label} />
                      </a>
                    )
                  })}
                </div>
              </div>

              <div id="mapa" className="flex flex-col gap-3">
                <h3 className="font-display font-bold text-navy text-lg">Ubicación</h3>
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm aspect-[4/3]">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63920.12895556985!2d-79.20380!3d-0.24986!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d584d74820e3f3%3A0x1d25fcb87a7e06e!2sSanto%20Domingo%20de%20los%20Ts%C3%A1chilas%2C%20Ecuador!5e0!3m2!1ses!2sec!4v1750620000000!5m2!1ses!2sec"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Ubicación El Chino Americano — Santo Domingo de los Tsáchilas, Ecuador"
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Santo Domingo de los Tsáchilas, Ecuador.
                  <a
                    href="https://share.google/oyOGKZdm6gVo680qE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-navy font-medium hover:text-brand ml-1 transition-colors"
                  >
                    Ver en Google Maps →
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
