"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"
import { siteConfig } from "@/lib/constants"

const EASE = [0.22, 1, 0.36, 1] as const

const STATS = [
  { value: "10+", label: "Años en el mercado" },
  { value: "500+", label: "Repuestos disponibles" },
  { value: "12", label: "Marcas trabajadas" },
  { value: "24h", label: "Respuesta garantizada" },
]

const VALUES = [
  "Repuestos originales, OEM y alternos con garantía del proveedor",
  "Asesoría personalizada por WhatsApp sin costo adicional",
  `Envíos seguros a todo Ecuador desde ${siteConfig.contact.address.city}`,
  "Precios transparentes, sin sorpresas al momento de la entrega",
]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
}

export default function AboutUs() {
  return (
    <section id="nosotros" className="bg-white py-20 lg:py-28 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ visible: { transition: { staggerChildren: 0.14 } } }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center"
        >
          {/* Left — story */}
          <div className="flex flex-col gap-8">
            <motion.div variants={fadeUp} className="flex flex-col gap-4">
              <span className="text-brand text-xs font-bold uppercase tracking-widest">
                Nuestra historia
              </span>
              <h2 className="font-display font-bold text-navy text-4xl lg:text-5xl leading-[1.04]">
                ¿Por qué{" "}
                <span className="text-brand">El Chino</span>
                <br />
                Americano?
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                Nuestro nombre lo dice todo. En Ecuador conviven dos mundos automotrices:
                los <strong className="text-navy">vehículos chinos</strong> — Chery, Great Wall, SWM, DFSK, Shineray —
                y los <strong className="text-navy">americanos</strong> — Ford, Chevrolet —.
                Somos especialistas en ambos.
              </p>
              <p className="text-slate-500 text-base leading-relaxed">
                Nacimos en {siteConfig.contact.address.city} con una misión clara: que encontrar
                un repuesto de calidad no sea una odisea. Trabajamos directamente con distribuidores
                verificados para ofrecerte el mejor precio sin sacrificar confiabilidad.
              </p>
            </motion.div>

            {/* Values list */}
            <motion.ul variants={fadeUp} className="flex flex-col gap-3">
              {VALUES.map((val) => (
                <li key={val} className="flex items-start gap-3">
                  <CheckCircle2
                    size={18}
                    className="text-brand shrink-0 mt-0.5"
                    strokeWidth={2}
                  />
                  <span className="text-slate-600 text-sm leading-snug">{val}</span>
                </li>
              ))}
            </motion.ul>

            <motion.div variants={fadeUp}>
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 bg-navy hover:bg-brand text-white font-bold text-sm px-6 py-3.5 rounded-md transition-colors duration-150 active:scale-[0.97] min-h-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
              >
                Ver nuestro catálogo
              </Link>
            </motion.div>
          </div>

          {/* Right — stats grid */}
          <motion.div
            variants={fadeUp}
            className="grid grid-cols-2 gap-4"
          >
            {STATS.map(({ value, label }, i) => (
              <div
                key={label}
                className={`flex flex-col gap-2 rounded-2xl p-7 ${
                  i === 0
                    ? "bg-navy text-white"
                    : i === 1
                    ? "bg-brand text-white"
                    : "bg-slate-50 border border-slate-100"
                }`}
              >
                <span
                  className={`font-display font-bold text-5xl leading-none ${
                    i >= 2 ? "text-navy" : "text-white"
                  }`}
                >
                  {value}
                </span>
                <span
                  className={`text-sm font-medium leading-snug ${
                    i === 0
                      ? "text-white/65"
                      : i === 1
                      ? "text-white/75"
                      : "text-slate-500"
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}

            {/* CTA card */}
            <div className="col-span-2 bg-slate-50 border border-slate-100 rounded-2xl p-6 flex items-center justify-between gap-4">
              <div>
                <p className="font-display font-bold text-navy text-lg leading-tight">
                  {siteConfig.contact.address.city},<br />{siteConfig.contact.address.country}
                </p>
                <p className="text-slate-500 text-sm mt-1">Envíos a nivel nacional</p>
              </div>
              <a
                href="/contacto#mapa"
                className="shrink-0 border border-navy/20 hover:border-navy/50 hover:bg-navy/5 text-navy text-sm font-semibold px-4 py-2.5 rounded-lg transition-all duration-150 min-h-11 flex items-center"
              >
                Ver mapa
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
