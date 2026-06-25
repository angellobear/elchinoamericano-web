"use client"

import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"
import { Layers, MessageCircle, ShieldCheck, Truck } from "lucide-react"
import { siteConfig } from "@/lib/constants"

const FEATURES = [
  {
    icon: MessageCircle,
    title: "Asesoría experta por WhatsApp",
    description: "Mándanos la placa o el número de pieza y te confirmamos compatibilidad antes de comprar.",
  },
  {
    icon: ShieldCheck,
    title: "Stock real y verificado",
    description: "Lo que ves en el catálogo es lo que hay. Nada de pedidos fantasma que nunca llegan.",
  },
  {
    icon: Truck,
    title: "Envíos a todo el Ecuador",
    description: `Desde ${siteConfig.contact.address.city} a cualquier ciudad, con seguimiento y entrega en 24–72 horas.`,
  },
  {
    icon: Layers,
    title: "Original, OEM o alterno",
    description: "Tres líneas de precio para que elijas según tu presupuesto, sin perder calidad.",
  },
]

const STATS = [
  { value: "+5.000", label: "referencias en catálogo" },
  { value: "9", label: "marcas chinas y americanas" },
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
    <section id="nosotros" className="bg-[#f6f8fb] py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col items-center text-center gap-3 mb-14">
          <div className="flex items-center gap-2">
            <span className="w-1.75 h-1.75 rounded-full bg-brand" />
            <span className="text-2.75 font-semibold uppercase tracking-[.16em] text-brand">
              Por qué El Chino Americano
            </span>
          </div>
          <h2 className="font-display font-bold text-navy uppercase leading-none text-[clamp(2.2rem,5vw,3.5rem)] max-w-190">
            El repuesto correcto, sin vueltas ni sorpresas
          </h2>
          <p className="max-w-155 text-[#566071] text-4.25 leading-[1.6]">
            Somos especialistas en marcas chinas y americanas. Te asesoramos pieza por pieza y
            te lo enviamos a cualquier ciudad del Ecuador.
          </p>
        </div>

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
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
            <div
              className="absolute inset-0"
              style={{ backgroundImage: "repeating-linear-gradient(135deg,rgba(13,31,60,.05) 0 14px,transparent 14px 28px)" }}
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-[#0d1f3c]/8" aria-hidden="true" />
          </motion.div>

          {/* Right — feature rows */}
          <motion.div
            variants={{ visible: { transition: { staggerChildren: reduce ? 0 : 0.1 } } }}
            className="flex flex-col gap-3"
          >
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="flex gap-4 items-start bg-white border border-[#e6e9ef] rounded-[14px] p-5 hover:shadow-[0_10px_30px_rgba(13,31,60,.08)] transition-all duration-200"
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
          className="grid grid-cols-3 gap-6 mt-12"
        >
          {STATS.map(({ value, label }) => (
            <motion.div key={label} variants={fadeUp} className="bg-navy rounded-2xl p-7 text-center">
              <p className="font-display font-bold text-brand text-16 leading-none">{value}</p>
              <p className="text-[#cdd6e4] text-3.75 leading-snug mt-2">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
