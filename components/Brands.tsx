"use client"

import { motion } from "framer-motion"
import { chineseBrands, americanBrands } from "@/data/brands"

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
}

function BrandGroup({ title, brands }: { title: string; brands: { id: string; name: string }[] }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-display font-bold text-white/45 text-xs uppercase tracking-widest">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {brands.map((brand) => (
          <a
            key={brand.id}
            href={`/catalogo?marca=${brand.id}`}
            className="border border-white/18 hover:border-brand hover:text-brand text-white/80 text-sm font-medium px-4 py-2 rounded-md transition-colors duration-150"
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
    <section id="marcas" className="bg-navy py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          className="flex flex-col gap-10"
        >
          <motion.div variants={fadeUp}>
            <h2 className="font-display font-bold text-white text-4xl lg:text-5xl">
              Marcas que trabajamos
            </h2>
            <p className="text-white/50 mt-2 text-base">
              Repuestos para los vehículos más populares del Ecuador.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-col gap-8">
            <BrandGroup title="Marcas Chinas" brands={chineseBrands} />
            <BrandGroup title="Marcas Americanas" brands={americanBrands} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
