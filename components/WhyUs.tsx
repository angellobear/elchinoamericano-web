"use client"

import { motion } from "framer-motion"
import { Truck, ShieldCheck, Headphones } from "lucide-react"

const FEATURES = [
  {
    icon: Truck,
    stat: "Desde $0",
    title: "Envíos a todo Ecuador",
    description:
      "Coordinamos entregas a Quito, Guayaquil, Cuenca y ciudades intermedias. Rápido y seguro.",
  },
  {
    icon: ShieldCheck,
    stat: "100% garantizado",
    title: "Calidad garantizada",
    description:
      "Trabajamos con marcas reconocidas. Cada repuesto viene con garantía del proveedor.",
  },
  {
    icon: Headphones,
    stat: "Respuesta < 24h",
    title: "Asesoría por WhatsApp",
    description:
      "¿No sabes qué repuesto necesitas? Escríbenos con el modelo de tu vehículo y te ayudamos.",
  },
]

const EASE = [0.16, 1, 0.3, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

export default function WhyUs() {
  return (
    <section id="nosotros" className="bg-white py-20 lg:py-28 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={{ visible: { transition: { staggerChildren: 0.13 } } }}
          className="flex flex-col gap-14"
        >
          {/* Section header */}
          <motion.div variants={fadeUp} className="flex flex-col gap-3 max-w-xl">
            <span className="inline-flex items-center gap-2 text-brand text-xs font-bold uppercase tracking-widest">
              ¿Por qué elegirnos?
            </span>
            <h2 className="font-display font-bold text-navy text-4xl lg:text-5xl leading-none">
              Servicio en el que
              <br />
              <span className="text-brand">puedes confiar.</span>
            </h2>
          </motion.div>

          {/* Feature cards */}
          <motion.div
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {FEATURES.map(({ icon: Icon, stat, title, description }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="group flex flex-col gap-5 bg-slate-50 border border-slate-100 hover:border-navy/15 hover:shadow-md rounded-2xl p-7 transition-all duration-200"
              >
                {/* Icon + stat row */}
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center shadow-sm">
                    <Icon size={22} className="text-white" strokeWidth={1.75} />
                  </div>
                  <span className="text-xs font-bold text-brand bg-brand/8 border border-brand/15 px-2.5 py-1 rounded-full">
                    {stat}
                  </span>
                </div>
                {/* Text */}
                <div className="flex flex-col gap-2">
                  <h3 className="font-display font-bold text-navy text-xl leading-tight">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
