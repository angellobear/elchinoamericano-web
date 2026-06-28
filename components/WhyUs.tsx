"use client"

import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"
import { BadgeCheck, Layers, Layers3, PackageSearch, Truck } from "lucide-react"
import { siteConfig } from "@/lib/constants"

const FEATURES = [
  {
    icon: BadgeCheck,
    title: "Compatibilidad verificada",
    description: "Confirmamos la aplicación del repuesto antes de tu compra para ayudarte a evitar errores.",
  },
  {
    icon: PackageSearch,
    title: "Miles de referencias disponibles",
    description: "Amplio catálogo para vehículos chinos y americanos, con soluciones para las principales categorías.",
  },
  {
    icon: Layers3,
    title: "Original, OEM y alterno",
    description: "Elige la opción que mejor se adapte a tu presupuesto, manteniendo calidad y rendimiento.",
  },
  {
    icon: Truck,
    title: "Envíos a todo el Ecuador",
    description: "Despachamos tus pedidos a nivel nacional con seguimiento y entrega segura.",
  },
]

const STATS = [
  { value: "+1.000", label: "Referencias disponibles" },
  { value: "+8", label: "Años de experiencia" },
  { value: "< 24 h", label: "tiempo de respuesta" },
]

const EASE = [0.16, 1, 0.3, 1] as const

export default function WhyUs() {
  const reduce = useReducedMotion()

  const fadeUp = {
    hidden: reduce ? {} : { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
  }

  return (
    <section id="nosotros" className="bg-[#f6f8fb] py-21" aria-labelledby="about-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={{ visible: { transition: { staggerChildren: reduce ? 0 : 0.1 } } }}
          className="flex flex-col items-center text-center gap-3 mb-14"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-2">
            <span className="w-1.75 h-1.75 rounded-full bg-brand" />
            <span className="text-3.25 font-semibold uppercase tracking-[.16em] text-brand">
              Sobre nosotros
            </span>
          </motion.div>
          <motion.h2 variants={fadeUp} id="about-title" className="font-display font-bold uppercase text-navy leading-none text-[clamp(2.2rem,5vw,3.5rem)] max-w-190">
            ¿Por qué elegir <span className="text-brand">El Chino</span> Americano?
          </motion.h2>
          <motion.p variants={fadeUp} className="max-w-155 text-[#566071] text-balance text-4.25 leading-[1.6]">
            Somos una empresa familiar ecuatoriana con más de 8 años de experiencia en el mercado automotriz, especializada en repuestos y accesorios para vehículos <strong>chinos</strong> y <strong>americanos</strong>.
            <br />
            Nuestro compromiso es ayudarte a encontrar la pieza correcta con la confianza de recibir un producto de calidad. Para lograrlo, trabajamos directamente con distribuidores verificados, ofreciendo un amplio catálogo y precios competitivos.
            <br />
            Creemos que comprar un repuesto debe ser un proceso sencillo, transparente y seguro. Esa es la razón de ser de <strong>El Chino Americano:</strong> acercarte las mejores soluciones para tu vehículo con la atención y el respaldo que mereces.
          </motion.p>
        </motion.div>

        {/* 2-col grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ visible: { transition: { staggerChildren: reduce ? 0 : 0.1 } } }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center"
        >
          <motion.div
            variants={fadeUp}
            className="relative h-110 rounded-[20px] overflow-hidden border border-[#e6e9ef] shadow-[0_24px_50px_rgba(13,31,60,.12)] bg-[#eef1f6]"
          >
            <Image
              src="/about-us.png"
              alt="Bodega ordenada y zona de servicio automotriz"
              title="Bodega y atencion de El Chino Americano"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
            <div
              className="absolute inset-0"
              style={{ backgroundImage: "repeating-linear-gradient(135deg,rgba(13,31,60,.05) 0 14px,transparent 14px 28px)" }}
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-linear-to-tr from-white/10 via-transparent to-navy/8" aria-hidden="true" />
          </motion.div>

          {/* Right — feature rows */}
          <motion.div
            variants={{ visible: { transition: { staggerChildren: reduce ? 0 : 0.1 } } }}
            className="flex flex-col gap-3.5"
          >
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.15 }}
                className="flex gap-4 items-start bg-white border border-[#e6e9ef] rounded-[14px] py-5 px-5.5 hover:shadow-[0_10px_30px_rgba(13,31,60,.08)] transition-shadow duration-200"
              >
                <div className="w-11.5 h-11.5 rounded-[11px] bg-brand/10 flex items-center justify-center shrink-0">
                  <Icon size={22} className="text-brand" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-4.75 uppercase text-navy leading-tight tracking-[.02em]">
                    {title}
                  </h3>
                  <p className="text-[#566071] text-[14.5px] leading-[1.55] mt-1.5">{description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={{ visible: { transition: { staggerChildren: reduce ? 0 : 0.1 } } }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-12"
        >
          {STATS.map(({ value, label }) => (
            <motion.div key={label} variants={fadeUp} className="bg-navy rounded-2xl py-7.5 px-5 text-center">
              <span className="font-display font-bold text-brand text-5xl leading-none">{value}</span>
              <p className="text-[#cdd6e4] text-3.75 font-medium leading-snug mt-1.5">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
