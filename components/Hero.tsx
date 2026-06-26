"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { CreditCard, Layers, MessageCircle, Search, ShieldCheck, Truck } from "lucide-react"
import { useRouter } from "next/navigation"
import { buildCatalogBrandPath } from "@/lib/catalog"
import { getWhatsAppUrl, siteConfig } from "@/lib/constants"
import type { PublicVehicleBrand } from "@/lib/vehicle-brands-public"

const VEHICLES = [
  { src: "/hero/jetour.png", alt: "Jetour X70", delay: 0 },
  { src: "/hero/chevrolet.png", alt: "Chevrolet Silverado", delay: 3 },
  { src: "/hero/chery.png", alt: "Chery Tiggo 7 Pro", delay: 6 },
  { src: "/hero/ford.png", alt: "Ford Explorer", delay: 9 },
  { src: "/hero/dfsk.png", alt: "DFSK Glory 560", delay: 12 },
  { src: "/hero/swm.png", alt: "SWM G01", delay: 15 },
  { src: "/hero/great_wall.png", alt: "Great Wall Voleex C30", delay: 18 },
  { src: "/hero/jac.png", alt: "JAC T8", delay: 21 },
  { src: "/hero/shineray.png", alt: "Shineray X30L", delay: 24 },
]

const PARTS = [
  { src: "/hero/rep_jetour.png", alt: "Repuestos Jetour", delay: 0 },
  { src: "/hero/rep_chevrolet.png", alt: "Repuestos Chevrolet", delay: 3 },
  { src: "/hero/rep_chery.png", alt: "Repuestos Chery", delay: 6 },
  { src: "/hero/rep_ford.png", alt: "Repuestos Ford", delay: 9 },
  { src: "/hero/rep_dfsk.png", alt: "Repuestos DFSK", delay: 12 },
  { src: "/hero/rep_swm.png", alt: "Repuestos SWM", delay: 15 },
  { src: "/hero/rep_great_wall.png", alt: "Repuestos Great Wall", delay: 18 },
  { src: "/hero/rep_jac.png", alt: "Repuestos JAC", delay: 21 },
  { src: "/hero/rep_shineray.png", alt: "Repuestos Shineray", delay: 24 }
]

const STAT_STRIP = [
  { icon: Truck, iconColor: "text-brand", iconBg: "bg-brand/14", title: "Envíos a todo Ecuador", sub: "Entrega 24–72 h" },
  { icon: MessageCircle, iconColor: "text-wa", iconBg: "bg-wa/14", title: "Asesoría por WhatsApp", sub: "Respuesta en < 24 h" },
  { icon: ShieldCheck, iconColor: "text-brand", iconBg: "bg-brand/14", title: "Calidad garantizada", sub: "Originales, OEM y alterno" },
  { icon: CreditCard, iconColor: "text-wa", iconBg: "bg-wa/14", title: "Múltiples formas de pago", sub: "Tarjeta, transferencia, efectivo" },
]

const EASE = [0.22, 1, 0.36, 1] as const

function HeroSearch({ brands }: { brands: PublicVehicleBrand[] }) {
  const router = useRouter()
  const [marca, setMarca] = useState("")

  return (
    <div className="mt-12.5 bg-[#13294a] border border-white/12 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3 shadow-[0_16px_40px_rgba(0,0,0,.28)]">
      <div className="hidden sm:flex items-center gap-2 shrink-0 pr-1">
        <Search size={18} className="text-brand" />
        <span className="font-display font-bold text-lg text-[#f4f7fb] whitespace-nowrap leading-none">
          Encuentra tu repuesto
        </span>
      </div>
      <select
        value={marca}
        onChange={(e) => setMarca(e.target.value)}
        className="flex-1 w-full bg-navy-dark border border-white/12 rounded-[10px] px-4 py-3 text-sm text-[#9fb0c8] focus:outline-none focus:border-brand cursor-pointer"
      >
        <option value="">Marca</option>
        {brands.map((brand) => (
          <option key={brand.id} value={brand.key}>{brand.name}</option>
        ))}
      </select>
      <select className="flex-1 w-full bg-navy-dark border border-white/12 rounded-xl px-4 py-3 text-sm text-[#9fb0c8] focus:outline-none cursor-pointer">
        <option>Modelo</option>
      </select>
      <select className="w-full sm:w-28 bg-navy-dark border border-white/12 rounded-xl px-4 py-3 text-sm text-[#9fb0c8] focus:outline-none cursor-pointer">
        <option>Año</option>
      </select>
      <button
        onClick={() => {
          router.push(marca ? buildCatalogBrandPath([marca]) : "/catalogo")
        }}
        className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand/90 text-white font-bold text-sm px-6 py-3 rounded-xl whitespace-nowrap transition-colors"
      >
        <Search size={16} />
        Buscar
      </button>
    </div>
  )
}

interface HeroProps {
  brands: PublicVehicleBrand[]
}

export default function Hero({ brands }: HeroProps) {
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
        className="absolute -right-32 -top-24 w-180 h-180 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle,rgba(224,48,48,.28) 0%,rgba(224,48,48,0) 66%)", filter: "blur(8px)" }}
        aria-hidden="true"
      />

      <div className="relative z-2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-11 items-center">
          {/* Left — text */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: reduce ? 0 : 0.11 } } }}
          >
            {/* <motion.div variants={fadeUp} className="flex items-center gap-2 mb-5">
              <span className="h-1.75 w-1.75 rounded-full bg-brand shrink-0" />
                <span className="text-3.25 font-semibold uppercase tracking-[.16em] text-[#9fb0c8]">
                  El Chino Americano
                </span>
            </motion.div> */}
            <motion.h1
              variants={fadeUp}
              className="font-display font-bold text-[#f4f7fb] uppercase leading-[.93] text-[clamp(2.8rem,6vw,4.75rem)]"
            >
              El repuesto que tu vehículo necesita, cuando
              <br />
              <span className="text-brand"> lo necesita.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-5 max-w-lg text-[#9fb0c8] text-4.5 leading-[1.55]">
              Originales, OEM y alternos para marcas chinas y americanas seleccionadas.
              Asesoría experta y envíos a todo el Ecuador.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mt-8">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 bg-brand hover:bg-brand/90 text-white font-bold text-base px-6.5 py-4 rounded-xl shadow-[0_14px_30px_rgba(224,48,48,.32)] transition-all duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <Search size={18} />
                Buscar mi repuesto
              </Link>
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border-[1.5px] border-wa text-[#f4f7fb] hover:bg-wa/14 font-bold text-base px-6 py-4 rounded-xl transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wa"
              >
                <MessageCircle size={18} className="text-wa" />
                Escríbenos por WhatsApp
              </a>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-10">
              <p className="text-3 font-semibold uppercase tracking-[.16em] text-[#5f7090] mb-3">
                Trabajamos con
              </p>
              <div className="flex flex-wrap gap-2">
                {brands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={buildCatalogBrandPath([brand.key])}
                    className="font-display font-bold text-4 text-[#9fb0c8] border border-white/14 hover:border-brand hover:text-white px-3.75 py-2 rounded-full transition-colors duration-150"
                  >
                    {brand.name.toUpperCase()}
                  </Link>
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
            {/* Vehicle showcase */}
            <div
              className="relative h-117.5 rounded-[20px] overflow-hidden border border-white/12 shadow-[0_30px_60px_rgba(0,0,0,.4)]"
              style={{
                background: "#0a1628",
                backgroundImage: "radial-gradient(120% 95% at 50% 22%,rgba(40,68,112,.55),rgba(10,22,40,0) 70%),repeating-linear-gradient(135deg,rgba(255,255,255,.045) 0 14px,transparent 14px 28px)",
              }}
            >
              {VEHICLES.map(({ src, alt, delay }) => (
                <div
                  key={src}
                  className="hero-vlayer absolute inset-0"
                  style={reduce ? { animationDuration: "0.01ms" } : { animationDelay: `${delay}s` }}
                >
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-contain"
                    style={{ objectPosition: "center 56%" }}
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    priority={delay === 0}
                  />
                </div>
              ))}

              {/* stock pill */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-[rgba(13,31,60,.92)] px-3 py-2 rounded-full shadow-[0_6px_16px_rgba(0,0,0,.22)]">
                <span className="h-1.75 w-1.75 rounded-full bg-wa shadow-[0_0_0_4px_rgba(37,211,102,.22)]" />
                <span className="font-bold text-2.75 tracking-[.12em] uppercase text-white">+5.000 referencias en stock</span>
              </div>
            </div>

            {/* Parts float card */}
            <div
              className="absolute -bottom-7 -left-7 w-56.5 h-38 rounded-2xl overflow-hidden border border-white/14 shadow-[0_18px_36px_rgba(0,0,0,.45)]"
              style={{
                background: "#13294a",
                backgroundImage: "radial-gradient(120% 100% at 50% 25%,rgba(40,68,112,.5),rgba(19,41,74,0) 72%),repeating-linear-gradient(135deg,rgba(255,255,255,.05) 0 12px,transparent 12px 24px)",
              }}
            >
              {PARTS.map(({ src, alt, delay }) => (
                <div
                  key={src}
                  className="hero-player absolute inset-3"
                  style={reduce ? { animationDuration: "0.01ms" } : { animationDelay: `${delay}s` }}
                >
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-contain"
                    style={{ objectPosition: "center 56%" }}
                    sizes="200px"
                  />
                </div>
              ))}
            </div>

            {/* top-right badge */}
            <div className="absolute top-6 -right-4 bg-navy/70 backdrop-blur-sm border border-white/16 rounded-[14px] p-4 shadow-[0_12px_28px_rgba(0,0,0,.35)]">
              <p className="font-display font-bold text-white text-7.5 leading-none">&lt; 24 h</p>
              <p className="text-3 text-[#9fb0c8] mt-1.5">Asesoría por WhatsApp</p>
            </div>
          </motion.div>
        </div>

        {/* Search bar */}
        {/* <HeroSearch brands={brands} /> */}

        {/* Stats strip */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 pb-8 mt-8 border-t border-white/8"
        >
          {STAT_STRIP.map(({ icon: Icon, iconColor, iconBg, title, sub }) => (
            <div key={title} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-[10px] ${iconBg} flex items-center justify-center shrink-0`}>
                <Icon size={20} className={iconColor} strokeWidth={2} />
              </div>
              <div>
                <p className="font-bold text-3.75 text-white leading-tight">{title}</p>
                <p className="text-3.25 text-[#7e8ca3] mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
