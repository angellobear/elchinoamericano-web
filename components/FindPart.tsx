"use client"

import { motion } from "framer-motion"
import { MessageCircle, Search, ArrowRight } from "lucide-react"

const EASE = [0.22, 1, 0.36, 1] as const

const EXAMPLES = ["Filtro de aceite", "Pastillas de freno", "Amortiguador", "Bomba de agua"]

export default function FindPart() {
  return (
    <section className="bg-slate-50 py-20 lg:py-24 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.65, ease: EASE }}
          className="bg-navy rounded-2xl overflow-hidden relative"
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
          {/* Red accent glow */}
          <div
            className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
            aria-hidden="true"
            style={{ background: "radial-gradient(circle, rgba(224,48,48,0.10) 0%, transparent 70%)" }}
          />

          <div className="relative px-8 py-12 lg:px-14 lg:py-14">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
              {/* Left text */}
              <div className="flex flex-col gap-5 max-w-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand/20 border border-brand/30 rounded-lg flex items-center justify-center shrink-0">
                    <Search size={18} className="text-brand" />
                  </div>
                  <span className="text-brand text-xs font-bold uppercase tracking-widest">
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

                {/* Example tags */}
                <div className="flex flex-wrap gap-2">
                  {EXAMPLES.map((ex) => (
                    <span
                      key={ex}
                      className="text-xs text-white/50 border border-white/12 px-3 py-1 rounded-full"
                    >
                      {ex}
                    </span>
                  ))}
                  <span className="text-xs text-white/30 border border-white/8 px-3 py-1 rounded-full">
                    y más...
                  </span>
                </div>
              </div>

              {/* Right CTAs */}
              <div className="shrink-0 flex flex-col gap-3 w-full lg:w-auto">
                <a
                  href={`https://wa.me/593984878153?text=${encodeURIComponent("Hola! Necesito un repuesto que no encuentro en el catálogo. Mi vehículo es: ")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-wa hover:bg-wa/90 text-white font-bold text-sm px-6 py-3.5 rounded-md transition-all duration-150 active:scale-[0.97] shadow-lg shadow-wa/20 min-h-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wa"
                >
                  <MessageCircle size={18} />
                  Escríbenos por WhatsApp
                </a>
                <a
                  href="/contacto"
                  className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/45 hover:bg-white/5 text-white/80 hover:text-white font-semibold text-sm px-6 py-3.5 rounded-md transition-all duration-150 min-h-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                >
                  Ver formulario de contacto
                  <ArrowRight size={15} />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
