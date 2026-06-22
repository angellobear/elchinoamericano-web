"use client"

import { motion } from "framer-motion"
import { Truck, ShieldCheck, Headphones } from "lucide-react"

const FEATURES = [
  {
    icon: Truck,
    title: "Envíos a todo Ecuador",
    description:
      "Coordinamos entregas a Quito, Guayaquil, Cuenca y ciudades intermedias. Rápido y seguro.",
  },
  {
    icon: ShieldCheck,
    title: "Originales y alternos garantizados",
    description:
      "Trabajamos con marcas reconocidas. Cada repuesto viene con garantía del proveedor.",
  },
  {
    icon: Headphones,
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
    <section id="nosotros" className="bg-slate-50 py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10"
        >
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              className="flex flex-col items-start gap-4"
            >
              <div className="w-12 h-12 bg-navy/8 rounded-lg flex items-center justify-center">
                <Icon size={24} className="text-navy" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-display font-bold text-navy text-xl mb-1">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
