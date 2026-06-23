"use client"

import { motion } from "framer-motion"
import { chineseBrands, americanBrands } from "@/data/brands"

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
}

function BrandGroup({
  title,
  label,
  brands,
}: {
  title: string
  label: string
  brands: { id: string; name: string }[]
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <h3 className="font-display font-bold text-white/50 text-xs uppercase tracking-widest shrink-0">
          {title}
        </h3>
        <span className="bg-white/8 border border-white/12 text-white/50 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
          {label}
        </span>
        <div className="h-px flex-1 bg-white/10" />
      </div>
      <div className="flex flex-wrap gap-2">
        {brands.map((brand) => (
          <a
            key={brand.id}
            href={`/catalogo?marca=${brand.id}`}
            className="min-h-[44px] flex items-center border border-white/15 hover:border-brand hover:text-brand hover:bg-brand/5 text-white/75 text-sm font-semibold px-4 py-2.5 rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {brand.name}
          </a>
        ))}
      </div>
    </div>
  )
}

export default function Brands() {
  return (
    <section id="marcas" className="bg-navy py-20 lg:py-28 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="brands-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.03" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#brands-grid)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          className="flex flex-col gap-12"
        >
          <motion.div variants={fadeUp} className="flex flex-col gap-3">
            <span className="text-brand text-xs font-bold uppercase tracking-widest">
              Catálogo de marcas
            </span>
            <h2 className="font-display font-bold text-white text-4xl lg:text-5xl leading-none">
              Marcas que trabajamos
            </h2>
            <p className="text-white/55 text-base max-w-lg">
              Repuestos para los vehículos más populares del Ecuador.
              Haz clic en una marca para ver el catálogo filtrado.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-col gap-10">
            <BrandGroup
              title="Marcas Chinas"
              label={`${chineseBrands.length} marcas`}
              brands={chineseBrands}
            />
            <BrandGroup
              title="Marcas Americanas"
              label={`${americanBrands.length} marcas`}
              brands={americanBrands}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
