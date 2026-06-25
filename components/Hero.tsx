"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Layers, MessageCircle, Search, ShieldCheck, Truck } from "lucide-react"
import { useRouter } from "next/navigation"

const BRAND_CHIPS = [
  { label: "CHERY", key: "chery" },
  { label: "SWM", key: "swm" },
  { label: "GREAT WALL", key: "great_wall" },
  { label: "DFSK", key: "dfsk" },
  { label: "SHINERAY", key: "shineray" },
  { label: "JAC", key: "jac" },
  { label: "JETOUR", key: "jetour" },
  { label: "FORD", key: "ford" },
  { label: "CHEVROLET", key: "chevrolet" },
]

const CAR_BRANDS = ["Chery", "SWM", "Great Wall", "DFSK", "Shineray", "JAC", "Jetour", "Ford", "Chevrolet"]

const STAT_STRIP = [
  { icon: Truck, iconColor: "text-brand", iconBg: "bg-brand/[.14]", title: "Envíos a todo Ecuador", sub: "Entrega 24–72 h" },
  { icon: MessageCircle, iconColor: "text-wa", iconBg: "bg-wa/[.14]", title: "Asesoría por WhatsApp", sub: "Respuesta en < 24 h" },
  { icon: ShieldCheck, iconColor: "text-brand", iconBg: "bg-brand/[.14]", title: "Calidad garantizada", sub: "Originales y OEM" },
  { icon: Layers, iconColor: "text-brand", iconBg: "bg-brand/[.14]", title: "Original · OEM · Alterno", sub: "3 líneas de precio" },
]

const EASE = [0.22, 1, 0.36, 1] as const

function HeroSearch() {
  const router = useRouter()
  const [marca, setMarca] = useState("")

  return (
    <div className="mt-12 bg-[#13294a] border border-white/[.12] rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3 shadow-[0_16px_40px_rgba(0,0,0,.28)]">
      <div className="hidden sm:flex items-center gap-2 shrink-0 pr-1">
        <Search size={18} className="text-brand" />
        <span className="font-display font-bold text-lg text-[#f4f7fb] whitespace-nowrap leading-none">
          Encuentra tu repuesto
        </span>
      </div>
      <select
        value={marca}
        onChange={(e) => setMarca(e.target.value)}
        className="flex-1 w-full bg-[#0a1628] border border-white/[.12] rounded-xl px-4 py-3 text-sm text-[#9fb0c8] focus:outline-none focus:border-brand cursor-pointer"
      >
        <option value="">Marca</option>
        {CAR_BRANDS.map((b) => (
          <option key={b} value={b.toLowerCase().replace(/ /g, "_")}>{b}</option>
        ))}
      </select>
      <select className="flex-1 w-full bg-[#0a1628] border border-white/[.12] rounded-xl px-4 py-3 text-sm text-[#9fb0c8] focus:outline-none cursor-pointer">
        <option>Modelo</option>
      </select>
      <select className="w-full sm:w-28 bg-[#0a1628] border border-white/[.12] rounded-xl px-4 py-3 text-sm text-[#9fb0c8] focus:outline-none cursor-pointer">
        <option>Año</option>
      </select>
      <button
        onClick={() => {
          const params = new URLSearchParams()
          if (marca) params.set("marca", marca)
          router.push(`/catalogo${params.size ? `?${params}` : ""}`)
        }}
        className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand/90 text-white font-bold text-sm px-6 py-3 rounded-xl whitespace-nowrap transition-colors"
      >
        <Search size={16} />
        Buscar
      </button>
    </div>
  )
}

export default function Hero() {
  const reduce = useReducedMotion()

  const fadeUp = {
    hidden: reduce ? {} : { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
  }

  return (
    <section className="relative bg-navy overflow-hidden pt-16">
      {/* diagonal grid */}
      <div
        className="absolute inset-0 opacity-[.05] pointer-events-none"
        style={{ backgroundImage: "repeating-linear-gradient(118deg,transparent 0 26px,#fff 26px 27px)" }}
        aria-hidden="true"
      />
      {/* red glow */}
      <div
        className="absolute -right-32 -top-24 w-[720px] h-[720px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle,rgba(224,48,48,.28) 0%,rgba(224,48,48,0) 66%)", filter: "blur(8px)" }}
        aria-hidden="true"
      />

      <div className="relative z-[2] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-11 items-center">
          {/* Left — text */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: reduce ? 0 : 0.11 } } }}
          >
            <motion.div variants={fadeUp} className="flex items-center gap-2 mb-5">
              <span className="w-[7px] h-[7px] rounded-full bg-brand shrink-0" />
              <span className="text-[11px] font-semibold uppercase tracking-[.16em] text-[#9fb0c8]">
                Santo Domingo · Ecuador — Repuestos chinos y americanos
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display font-bold text-[#f4f7fb] uppercase leading-[.93] text-[clamp(2.8rem,6vw,4.75rem)]"
            >
              Repuestos que
              <br />
              <span className="text-brand">sí encajan.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-5 max-w-lg text-[#9fb0c8] text-[1.125rem] leading-[1.55]">
              Originales, OEM y alternos para Chery, SWM, Great Wall, Ford, Chevrolet y más.
              Asesoría experta y envíos a todo el Ecuador.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mt-8">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 bg-brand hover:bg-brand/90 text-white font-bold text-base px-6 py-4 rounded-xl shadow-[0_14px_30px_rgba(224,48,48,.32)] transition-all duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <Search size={18} />
                Buscar mi repuesto
              </Link>
              <a
                href="https://wa.me/593984878153"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-wa text-[#f4f7fb] hover:bg-wa/[.14] font-bold text-base px-6 py-4 rounded-xl transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wa"
              >
                <MessageCircle size={18} className="text-wa" />
                Escríbenos por WhatsApp
              </a>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-10">
              <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#5f7090] mb-3">
                Trabajamos con
              </p>
              <div className="flex flex-wrap gap-2">
                {BRAND_CHIPS.map(({ label, key }) => (
                  <a
                    key={key}
                    href={`/catalogo?marca=${key}`}
                    className="font-display font-bold text-sm text-[#9fb0c8] border border-white/[.14] hover:border-brand hover:text-white px-3.5 py-2 rounded-full transition-colors duration-150"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div
              className="relative h-[470px] rounded-[20px] overflow-hidden border border-white/[.12] shadow-[0_30px_60px_rgba(0,0,0,.4)] bg-[#0a1628]"
            >
              <Image
                src="/editorial/home/hero-vehicle.png"
                alt="Vehículo en estudio con iluminación dramática"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 40vw, 100vw"
                priority
              />
              <div
                className="absolute inset-0"
                style={{ backgroundImage: "repeating-linear-gradient(135deg,rgba(255,255,255,.045) 0 14px,transparent 14px 28px)" }}
                aria-hidden="true"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-right bg-gradient-to-t from-[rgba(10,22,40,.92)] to-transparent">
                <p className="font-bold text-[13px] tracking-[.12em] uppercase text-brand">Stock disponible</p>
                <p className="font-display font-bold text-white text-3xl mt-1.5 leading-tight">
                  +5.000 referencias listas para enviar
                </p>
              </div>
            </div>
            {/* bottom-left float */}
            <div
              className="absolute -bottom-7 -left-7 w-56 h-36 rounded-[16px] overflow-hidden border border-white/[.14] shadow-[0_18px_36px_rgba(0,0,0,.45)] bg-[#13294a] flex items-end p-3"
            >
              <Image
                src="/editorial/home/part-detail.png"
                alt="Detalle técnico de repuesto en primer plano"
                fill
                className="object-cover"
                sizes="224px"
              />
              <div
                className="absolute inset-0"
                style={{ backgroundImage: "repeating-linear-gradient(135deg,rgba(255,255,255,.05) 0 12px,transparent 12px 24px)" }}
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(19,41,74,.88)] via-[rgba(19,41,74,.22)] to-transparent" aria-hidden="true" />
              <p className="font-semibold text-sm text-white">Calidad garantizada</p>
            </div>
            {/* top-right badge */}
            <div className="absolute top-6 -right-4 bg-navy/70 backdrop-blur-[8px] border border-white/[.16] rounded-[14px] p-4 shadow-[0_12px_28px_rgba(0,0,0,.35)]">
              <p className="font-display font-bold text-white text-[1.875rem] leading-none">&lt; 24 h</p>
              <p className="text-[12px] text-[#9fb0c8] mt-1.5">Asesoría por WhatsApp</p>
            </div>
          </motion.div>
        </div>

        {/* Search bar */}
        <HeroSearch />

        {/* Stats strip */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 pb-8 mt-8 border-t border-white/[.08]"
        >
          {STAT_STRIP.map(({ icon: Icon, iconColor, iconBg, title, sub }) => (
            <div key={title} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                <Icon size={20} className={iconColor} strokeWidth={2} />
              </div>
              <div>
                <p className="font-bold text-[15px] text-white leading-tight">{title}</p>
                <p className="text-[13px] text-[#7e8ca3] mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
