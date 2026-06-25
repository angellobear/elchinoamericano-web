"use client"

import { motion, useReducedMotion } from "framer-motion"
import { chineseBrands, americanBrands } from "@/data/brands"

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

function BrandCard({ brand }: { brand: { id: string; name: string } }) {
  return (
    <a
      href={`/catalogo?marca=${brand.id}`}
      className="h-28 rounded-3.5 bg-[#13294a] border border-white/10 flex items-center justify-center cursor-pointer hover:-translate-y-1 hover:scale-[1.02] hover:border-brand hover:shadow-[0_16px_34px_rgba(0,0,0,.4)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <span className="font-display font-bold text-7 text-white leading-none tracking-[.04em]">
        {brand.name.toUpperCase()}
      </span>
    </a>
  )
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mt-8 mb-4">
      <span className="font-display font-bold text-4 uppercase tracking-[.14em] text-[#9fb0c8] shrink-0">
        {label}
      </span>
      <span className="flex-1 h-px bg-white/10" />
    </div>
  )
}

export default function Brands() {
  const reduce = useReducedMotion()

  return (
    <section id="marcas" className="bg-[#0a1628] py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{ visible: { transition: { staggerChildren: reduce ? 0 : 0.1 } } }}
        >
          {/* Header */}
          <motion.div variants={fadeUp} className="text-center">
            <div className="flex items-center gap-2 justify-center mb-4">
              <span className="w-1.75 h-1.75 rounded-full bg-brand" />
              <span className="text-2.75 font-semibold uppercase tracking-[.16em] text-brand">Marcas</span>
            </div>
            <h2 className="font-display font-bold text-[#f4f7fb] uppercase leading-none text-[clamp(2rem,4.5vw,3.25rem)]">
              Especialistas en marcas chinas y americanas
            </h2>
          </motion.div>

          {/* Chinese brands */}
          <motion.div variants={fadeUp}>
            <Divider label="Marcas chinas" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {chineseBrands.map((brand) => (
                <BrandCard key={brand.id} brand={brand} />
              ))}
              <div className="h-28 rounded-3.5 bg-[#13294a] border border-white/10 flex items-center justify-center">
                <span className="font-display font-bold text-4.25 text-[#9fb0c8] text-center leading-snug">
                  y más<br />marcas
                </span>
              </div>
            </div>
          </motion.div>

          {/* American brands */}
          <motion.div variants={fadeUp}>
            <Divider label="Marcas americanas" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {americanBrands.map((brand) => (
                <BrandCard key={brand.id} brand={brand} />
              ))}
              <div className="h-28 rounded-3.5 bg-[#13294a] border border-white/10 flex items-center justify-center">
                <span className="font-display font-bold text-4.25 text-[#9fb0c8] text-center leading-snug">
                  y más<br />marcas
                </span>
              </div>
              <div className="h-28 rounded-3.5 border border-dashed border-brand/45 bg-gradient-to-br from-brand/16 to-brand/4 flex flex-col items-center justify-center gap-1.5 p-3 text-center">
                <span className="font-display font-bold text-4.25 uppercase text-white leading-tight">
                  ¿Otra marca?
                </span>
                <span className="text-3 text-[#9fb0c8]">Consúltanos por WhatsApp</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
