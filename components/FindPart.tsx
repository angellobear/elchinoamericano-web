"use client"

import { motion } from "framer-motion"
import { MessageCircle, Search } from "lucide-react"

const EASE = [0.22, 1, 0.36, 1] as const

export default function FindPart() {
  return (
    <section className="bg-white py-20 lg:py-24 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.65, ease: EASE }}
          className="bg-navy rounded-2xl px-8 py-12 lg:px-14 lg:py-14 relative overflow-hidden"
        >
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="fp-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.04" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#fp-grid)" />
            </svg>
          </div>

          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="flex flex-col gap-4 max-w-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand/20 rounded-lg flex items-center justify-center">
                  <Search size={20} className="text-brand" />
                </div>
                <span className="text-brand text-sm font-bold uppercase tracking-widest">
                  Gestión de repuestos
                </span>
              </div>

              <h2 className="font-display font-bold text-white text-3xl lg:text-4xl leading-tight">
                ¿No encuentras el repuesto
                <br />
                que necesitas?
              </h2>
              <p className="text-white/60 text-base leading-relaxed">
                Si no tenemos el repuesto en nuestro catálogo, lo buscamos por ti.
                Cuéntanos el modelo de tu vehículo y la pieza que necesitas — nosotros lo gestionamos.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-3 lg:flex-col">
              <a
                href={`https://wa.me/593984878153?text=${encodeURIComponent("Hola! Necesito un repuesto que no encuentro en el catálogo. Mi vehículo es: ")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-wa hover:bg-wa/90 text-white font-bold text-sm px-6 py-3.5 rounded-md transition-colors duration-150 active:scale-[0.97] shadow-lg shadow-wa/20 whitespace-nowrap"
              >
                <MessageCircle size={18} />
                Escríbenos por WhatsApp
              </a>
              <a
                href="/contacto"
                className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/50 hover:bg-white/5 text-white font-bold text-sm px-6 py-3.5 rounded-md transition-colors duration-150 whitespace-nowrap"
              >
                Ver formulario de contacto
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
