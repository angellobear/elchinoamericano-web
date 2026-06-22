"use client"

import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, MessageCircle } from "lucide-react"

const BRAND_CHIPS = [
  { name: "Chery", tag: "China" },
  { name: "Great Wall", tag: "China" },
  { name: "BYD", tag: "China" },
  { name: "Ford", tag: "EE.UU." },
  { name: "Chevrolet", tag: "EE.UU." },
  { name: "DFSK", tag: "China" },
  { name: "MG", tag: "China" },
  { name: "JAC", tag: "China" },
  { name: "Jetour", tag: "China" },
]

const EASE = [0.22, 1, 0.36, 1] as const

export default function Hero() {
  const reduce = useReducedMotion()

  const container = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: reduce ? 0 : 0.35,
        staggerChildren: reduce ? 0 : 0.14,
      },
    },
  }

  const item = {
    hidden: reduce ? {} : { opacity: 0, y: 48 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: EASE },
    },
  }

  const chipContainer = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: reduce ? 0 : 0.6,
        staggerChildren: reduce ? 0 : 0.07,
      },
    },
  }

  const chipItem = {
    hidden: reduce ? {} : { opacity: 0, scale: 0.88 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: EASE },
    },
  }

  return (
    <section className="relative bg-navy min-h-[100dvh] flex items-center pt-16 overflow-hidden">
      {/* SVG diagonal grid */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.05" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Red accent glow top-right */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(224,48,48,0.12) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">

          {/* Left — text content */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-7"
          >
            <motion.div variants={item}>
              <span className="inline-flex items-center gap-2 bg-brand/15 border border-brand/25 text-brand text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider">
                Repuestos originales y alternos
              </span>
            </motion.div>

            <motion.div variants={item}>
              <h1 className="font-display font-bold text-white leading-[1.04] text-[clamp(2.5rem,6vw,4.5rem)]">
                Tu vehículo merece
                <br className="hidden sm:block" />
                {" "}lo mejor.
                <br />
                <span className="text-brand">Nosotros lo tenemos.</span>
              </h1>
            </motion.div>

            <motion.p variants={item} className="text-white/60 text-base leading-relaxed max-w-[480px]">
              Motor · Frenos · Suspensión · Filtros · Carrocería · Enfriamiento.
              Marcas chinas y americanas con envío a todo Ecuador.
            </motion.p>

            <motion.div variants={item} className="flex flex-wrap gap-3 pt-1">
              <a
                href="/catalogo"
                className="group inline-flex items-center gap-2 bg-brand hover:bg-brand/90 text-white font-bold text-sm px-6 py-3 rounded-md transition-all duration-150 active:scale-[0.97] shadow-lg shadow-brand/30"
              >
                Ver catálogo
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform duration-150" />
              </a>
              <a
                href="https://wa.me/593984878153"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-white/25 hover:border-white/50 hover:bg-white/5 text-white font-bold text-sm px-6 py-3 rounded-md transition-all duration-150 active:scale-[0.97]"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
            </motion.div>
          </motion.div>

          {/* Right — brand chips grid */}
          <motion.div
            variants={chipContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-3 gap-3"
          >
            {BRAND_CHIPS.map((brand) => (
              <motion.a
                key={brand.name}
                href="/catalogo"
                variants={chipItem}
                className="flex flex-col items-center justify-center border border-white/12 hover:border-brand hover:bg-brand/5 rounded-xl p-4 cursor-pointer transition-all duration-200 gap-1 group"
              >
                <span className="font-display font-bold text-white text-base leading-tight text-center group-hover:text-brand transition-colors duration-200">
                  {brand.name}
                </span>
                <span className="text-white/40 text-[10px] font-semibold uppercase tracking-widest">
                  {brand.tag}
                </span>
              </motion.a>
            ))}
          </motion.div>
        </div>

        {/* Bottom stat strip */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5, ease: "easeOut" }}
          className="mt-16 lg:mt-20 pt-8 border-t border-white/10 grid grid-cols-3 gap-6 max-w-md"
        >
          {[
            { value: "12+", label: "Marcas" },
            { value: "500+", label: "Repuestos" },
            { value: "24h", label: "Respuesta" },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col gap-1">
              <span className="font-display font-bold text-white text-2xl">{value}</span>
              <span className="text-white/40 text-xs font-medium">{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
