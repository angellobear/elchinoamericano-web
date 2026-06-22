"use client"

import { useState } from "react"
import { MessageCircle, Phone, MapPin, Clock, Send, CheckCircle } from "lucide-react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

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

const CONTACT_INFO = [
  {
    icon: Phone,
    label: "Teléfono",
    value: "+593 984 878 153",
    href: "tel:+593984878153",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Escríbenos ahora",
    href: "https://wa.me/593984878153",
    external: true,
  },
  {
    icon: MapPin,
    label: "Ubicación",
    value: "Quito, Ecuador",
    href: "#mapa",
  },
  {
    icon: Clock,
    label: "Horario",
    value: "Lun - Sáb: 8:00 - 18:00",
    href: undefined,
  },
]

const SOCIAL_LINKS = [
  { label: "Facebook", href: "#", Icon: FacebookIcon, color: "text-[#1877F2]" },
  { label: "Instagram", href: "#", Icon: InstagramIcon, color: "text-[#E4405F]" },
  { label: "TikTok", href: "#", Icon: TikTokIcon, color: "text-slate-900" },
  { label: "WhatsApp", href: "https://wa.me/593984878153", Icon: MessageCircle, color: "text-wa", external: true },
]

interface FormData {
  nombre: string
  telefono: string
  vehiculo: string
  repuesto: string
  mensaje: string
}

export default function ContactoPage() {
  const [form, setForm] = useState<FormData>({
    nombre: "",
    telefono: "",
    vehiculo: "",
    repuesto: "",
    mensaje: "",
  })
  const [sent, setSent] = useState(false)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parts = [
      `Hola! Me llamo ${form.nombre}.`,
      form.telefono && `Mi numero es: ${form.telefono}.`,
      form.vehiculo && `Vehiculo: ${form.vehiculo}.`,
      form.repuesto && `Necesito el repuesto: ${form.repuesto}.`,
      form.mensaje && `Nota adicional: ${form.mensaje}`,
    ]
      .filter(Boolean)
      .join(" ")

    window.open(
      `https://wa.me/593984878153?text=${encodeURIComponent(parts)}`,
      "_blank"
    )
    setSent(true)
    setTimeout(() => setSent(false), 4000)
  }

  const isValid = form.nombre.trim() && form.repuesto.trim()

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-16">
        {/* Page header */}
        <div className="bg-navy">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <h1 className="font-display font-bold text-white text-4xl lg:text-5xl">Contacto</h1>
            <p className="text-white/55 mt-2 text-base max-w-lg">
              Escríbenos por WhatsApp, llámanos, o usa el formulario. Respondemos en menos de 24 horas.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

            {/* Left: form */}
            <div className="order-2 lg:order-1">
              <h2 className="font-display font-bold text-navy text-2xl mb-6">
                Envía tu consulta
              </h2>

              {sent ? (
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                  <CheckCircle size={48} className="text-wa" />
                  <div>
                    <p className="font-semibold text-slate-800 text-lg">
                      Te redirigimos a WhatsApp
                    </p>
                    <p className="text-slate-500 text-sm mt-1">
                      Si no se abrió, escríbenos directamente al +593 984 878 153
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="nombre" className="text-sm font-semibold text-slate-700">
                        Nombre <span className="text-brand">*</span>
                      </label>
                      <input
                        id="nombre"
                        name="nombre"
                        type="text"
                        required
                        value={form.nombre}
                        onChange={handleChange}
                        placeholder="Tu nombre"
                        className="px-3 py-2.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="telefono" className="text-sm font-semibold text-slate-700">
                        Teléfono / WhatsApp
                      </label>
                      <input
                        id="telefono"
                        name="telefono"
                        type="tel"
                        value={form.telefono}
                        onChange={handleChange}
                        placeholder="+593 9XX XXX XXX"
                        className="px-3 py-2.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="vehiculo" className="text-sm font-semibold text-slate-700">
                      Modelo del vehículo
                    </label>
                    <input
                      id="vehiculo"
                      name="vehiculo"
                      type="text"
                      value={form.vehiculo}
                      onChange={handleChange}
                      placeholder="Ej: Chery Tiggo 5 2.0 2020"
                      className="px-3 py-2.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="repuesto" className="text-sm font-semibold text-slate-700">
                      Repuesto que necesitas <span className="text-brand">*</span>
                    </label>
                    <input
                      id="repuesto"
                      name="repuesto"
                      type="text"
                      required
                      value={form.repuesto}
                      onChange={handleChange}
                      placeholder="Ej: Filtro de aceite, pastillas de freno..."
                      className="px-3 py-2.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="mensaje" className="text-sm font-semibold text-slate-700">
                      Mensaje adicional
                    </label>
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      rows={4}
                      value={form.mensaje}
                      onChange={handleChange}
                      placeholder="Algún detalle adicional, urgencia, o pregunta..."
                      className="px-3 py-2.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!isValid}
                    className="inline-flex items-center justify-center gap-2 bg-wa hover:bg-wa/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm px-6 py-3.5 rounded-md transition-colors duration-150 active:scale-[0.98] mt-1"
                  >
                    <Send size={16} />
                    Enviar por WhatsApp
                  </button>

                  <p className="text-xs text-slate-400">
                    Al enviar, se abrirá WhatsApp con tu mensaje listo para enviarnos.
                  </p>
                </form>
              )}
            </div>

            {/* Right: contact info + map + social */}
            <div className="order-1 lg:order-2 flex flex-col gap-8">
              {/* Contact info */}
              <div className="bg-slate-50 rounded-xl p-6 flex flex-col gap-5">
                <h2 className="font-display font-bold text-navy text-xl">
                  Información de contacto
                </h2>
                <ul className="flex flex-col gap-4">
                  {CONTACT_INFO.map(({ icon: Icon, label, value, href, external }) => (
                    <li key={label} className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-navy/8 rounded-lg flex items-center justify-center shrink-0">
                        <Icon size={18} className="text-navy" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">
                          {label}
                        </p>
                        {href ? (
                          <a
                            href={href}
                            target={external ? "_blank" : undefined}
                            rel={external ? "noopener noreferrer" : undefined}
                            className="text-sm font-medium text-navy hover:text-brand transition-colors"
                          >
                            {value}
                          </a>
                        ) : (
                          <p className="text-sm font-medium text-slate-700">{value}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Social media */}
              <div className="flex flex-col gap-3">
                <h3 className="font-display font-bold text-navy text-lg">
                  Redes sociales
                </h3>
                <div className="flex items-center gap-4">
                  {SOCIAL_LINKS.map(({ label, href, Icon, color, external }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      className={`${color} hover:opacity-70 transition-opacity duration-150`}
                    >
                      <Icon size={20} />
                    </a>
                  ))}
                </div>
                <p className="text-xs text-slate-400">
                  Síguenos para ver novedades, repuestos nuevos y promociones.
                </p>
              </div>

              {/* Map */}
              <div id="mapa" className="flex flex-col gap-3">
                <h3 className="font-display font-bold text-navy text-lg">
                  Ubicación
                </h3>
                <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm aspect-[4/3]">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15971.21637063374!2d-78.52495!3d-0.22985!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d59a4002427c9f%3A0x44b991e158ef5572!2sQuito%2C%20Ecuador!5e0!3m2!1ses!2sec!4v1750000000000!5m2!1ses!2sec"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Ubicación El Chino Americano — Quito, Ecuador"
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Quito, Ecuador. Contáctanos para coordinar visita o entrega.
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
