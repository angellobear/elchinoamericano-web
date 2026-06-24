import type { Metadata } from "next"
import { MessageCircle } from "lucide-react"
import Image from "next/image"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ContactoForm from "./ContactoForm"

export const metadata: Metadata = {
  title: "Contacto | El Chino Americano",
  description:
    "Cotiza repuestos automotrices por WhatsApp. Te respondemos en menos de 24 horas con disponibilidad y precio.",
  alternates: { canonical: "/contacto" },
  openGraph: {
    title: "Contacto | El Chino Americano",
    description: "Escríbenos para cotizar repuestos, resolver compatibilidades o coordinar envíos en Ecuador.",
    type: "website",
    locale: "es_EC",
    siteName: "El Chino Americano",
    url: "https://elchinoamericano.com/contacto",
  },
  twitter: {
    card: "summary",
    title: "Contacto | El Chino Americano",
    description: "Escríbenos para cotizar repuestos, resolver compatibilidades o coordinar envíos en Ecuador.",
  },
}

export default function ContactoPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        {/* Header band */}
        <div className="relative overflow-hidden bg-navy py-10 px-4 sm:px-6 lg:px-8">
          <div
            className="absolute -right-24 -top-32 w-[560px] h-[560px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(224,48,48,.24) 0%,rgba(224,48,48,0) 66%)" }}
            aria-hidden="true"
          />
          <div className="relative max-w-7xl mx-auto">
            <p className="text-[13px] text-[#9fb0c8]">
              Inicio <span className="text-[#5f7090]">/</span> <span className="text-white">Contacto</span>
            </p>
            <h1 className="font-display font-bold text-[#f4f7fb] uppercase leading-[.95] text-[clamp(2.2rem,5vw,3.5rem)] mt-3">
              Hablemos de tu repuesto
            </h1>
            <p className="mt-3 max-w-[560px] text-[#9fb0c8] text-[1.0625rem] leading-[1.55]">
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
              <h2 className="font-display font-bold text-[26px] uppercase text-navy">
                Solicita tu repuesto
              </h2>
              <p className="text-[14px] text-[#8a93a3] mt-1.5 mb-6">
                Mientras más datos nos des, más rápido lo encontramos.
              </p>
              <ContactoForm />
            </div>

            {/* Info + map */}
            <div className="flex flex-col gap-5">
              {/* Contact info card */}
              <div className="bg-navy rounded-[18px] p-7">
                <h3 className="font-display font-bold text-[22px] uppercase text-white mb-5">
                  Datos de contacto
                </h3>
                <ul className="flex flex-col gap-5">
                  <li className="flex gap-3.5 items-start">
                    <div className="w-[42px] h-[42px] rounded-[11px] bg-wa/[.16] flex items-center justify-center shrink-0">
                      <MessageCircle size={20} className="text-wa" />
                    </div>
                    <div>
                      <p className="text-[12px] text-[#9fb0c8]">WhatsApp / Ventas</p>
                      <a href="https://wa.me/593984878153" target="_blank" rel="noopener noreferrer" className="font-bold text-[17px] text-white hover:text-wa transition-colors mt-1 block">
                        +593 984 878 153
                      </a>
                    </div>
                  </li>
                  <li className="flex gap-3.5 items-start">
                    <div className="w-[42px] h-[42px] rounded-[11px] bg-brand/[.14] flex items-center justify-center shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e03030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                    <div>
                      <p className="text-[12px] text-[#9fb0c8]">Local</p>
                      <p className="font-bold text-[16px] text-white leading-snug mt-1">
                        Santo Domingo de los Tsáchilas, Ecuador
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3.5 items-start">
                    <div className="w-[42px] h-[42px] rounded-[11px] bg-brand/[.14] flex items-center justify-center shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e03030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    </div>
                    <div>
                      <p className="text-[12px] text-[#9fb0c8]">Horario</p>
                      <p className="font-bold text-[16px] text-white mt-1">Lun–Sáb · 8:00–18:00</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Map */}
              <div className="flex-1 min-h-[200px] rounded-[18px] overflow-hidden border border-[#e6e9ef]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63920.12895556985!2d-79.20380!3d-0.24986!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d584d74820e3f3%3A0x1d25fcb87a7e06e!2sSanto%20Domingo%20de%20los%20Ts%C3%A1chilas%2C%20Ecuador!5e0!3m2!1ses!2sec!4v1750620000000!5m2!1ses!2sec"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: 200 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación El Chino Americano — Santo Domingo de los Tsáchilas, Ecuador"
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
