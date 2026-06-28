"use client"

import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import { getWhatsAppUrl } from "@/lib/constants"

const EASE = [0.16, 1, 0.3, 1] as const

export default function CtaBand() {
  const reduce = useReducedMotion()

  return (
    <section className="relative overflow-hidden bg-brand py-16 px-4 sm:px-6 lg:px-8" aria-labelledby="cta-band-title">
      {/* white radial glow */}
      <div
        className="absolute -right-20 -top-32 w-130 h-130 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle,rgba(255,255,255,.14) 0%,rgba(255,255,255,0) 65%)" }}
        aria-hidden="true"
      />
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={{ visible: { transition: { staggerChildren: reduce ? 0 : 0.12 } } }}
        className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10"
      >
        <motion.div
          variants={{
            hidden: reduce ? {} : { opacity: 0, x: -24 },
            visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
          }}
        >
          <h2 id="cta-band-title" className="font-display font-bold text-white uppercase leading-[.96] text-[clamp(2.2rem,5vw,3.5rem)]">
            ¿No encuentras tu repuesto?
          </h2>
          <p className="mt-3.5 max-w-lg text-white/92 text-4.25 leading-[1.55]">
            Envíanos la marca, modelo y año de tu vehículo. También puedes mandarnos una foto o número de pieza, y te ayudamos a encontrarlo.
          </p>
        </motion.div>
        <motion.div
          variants={{
            hidden: reduce ? {} : { opacity: 0, x: 24 },
            visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
          }}
          className="flex flex-col gap-3 shrink-0"
        >
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            title="Escribir por WhatsApp a El Chino Americano"
            className="inline-flex items-center justify-center gap-2.5 bg-wa hover:brightness-105 text-[#062b15] font-bold text-base px-7.5 py-4.5 rounded-[13px] shadow-[0_16px_34px_rgba(0,0,0,.18)] transition-all active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#062b15]"
          >
            <MessageCircle size={20} />
            Escríbenos por WhatsApp
          </a>
          <Link
            href="/catalogo"
            title="Ver catálogo completo de repuestos"
            className="inline-flex items-center justify-center border-[1.5px] border-white/60 hover:bg-white/10 text-white font-bold text-base px-7.5 py-4 rounded-[13px] transition-all active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Ver catálogo completo
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
