import Image from "next/image"
import Link from "next/link"
import { CreditCard, MessageCircle, Search, ShieldCheck, Truck } from "lucide-react"
import { buildCatalogBrandPath } from "@/lib/catalog"
import { getWhatsAppUrl } from "@/lib/constants"
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

interface HeroProps {
  brands: PublicVehicleBrand[]
}

export default function Hero({ brands }: HeroProps) {
  return (
    <section
      className="relative bg-navy overflow-hidden pt-16"
      aria-labelledby="home-hero-title"
    >
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
          <div>
            {/* ponytail: el h1 es el elemento LCP, va sin delay para que pinte
                en el primer frame. Los hermanos escalonan con animation-delay. */}
            <h1
              id="home-hero-title"
              className="reveal-up font-display font-bold text-[#f4f7fb] uppercase leading-[.93] text-[clamp(2.8rem,6vw,4.75rem)]"
            >
              El repuesto que tu vehículo necesita, cuando
              <br />
              <span className="text-brand"> lo necesita.</span>
            </h1>

            <p
              className="reveal-up mt-5 max-w-lg text-[#9fb0c8] text-4.5 leading-[1.55]"
              style={{ animationDelay: ".11s" }}
            >
              Originales, OEM y alternos para marcas chinas y americanas seleccionadas.
              Asesoría experta y envíos a todo el Ecuador.
            </p>

            <div
              className="reveal-up flex flex-wrap gap-3 mt-8"
              style={{ animationDelay: ".22s" }}
            >
              <Link
                href="/catalogo"
                title="Explorar catálogo de repuestos"
                className="inline-flex items-center gap-2 bg-brand hover:bg-brand/90 text-white font-bold text-base px-6.5 py-4 rounded-xl shadow-[0_14px_30px_rgba(224,48,48,.32)] transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <Search size={18} />
                Buscar mi repuesto
              </Link>
              <a
                href={getWhatsAppUrl()}
                data-wa="home"
                target="_blank"
                rel="noopener noreferrer"
                title="Escribir por WhatsApp a El Chino Americano"
                className="inline-flex items-center gap-2 border-[1.5px] border-wa text-[#f4f7fb] hover:bg-wa/14 font-bold text-base px-6 py-4 rounded-xl transition-all duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wa"
              >
                <MessageCircle size={18} className="text-wa" />
                Escríbenos por WhatsApp
              </a>
            </div>

            <div className="reveal-up mt-10" style={{ animationDelay: ".33s" }}>
              <p className="text-3 font-semibold uppercase tracking-[.16em] text-[#5f7090] mb-3">
                Trabajamos con
              </p>
              <div className="flex flex-wrap gap-2">
                {brands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={buildCatalogBrandPath([brand.key])}
                    title={`Ver repuestos para ${brand.name}`}
                    className="font-display font-bold text-4 text-[#9fb0c8] border border-white/14 hover:border-brand hover:text-white px-3.75 py-2 rounded-full transition-colors duration-150"
                  >
                    {brand.name.toUpperCase()}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div
            className="reveal-right relative hidden lg:block"
            style={{ animationDelay: ".2s" }}
          >
            {/* Vehicle showcase */}
            <div
              className="relative h-117.5 rounded-[20px] overflow-hidden border border-white/12 shadow-[0_30px_60px_rgba(0,0,0,.4)]"
              style={{
                background: "#0a1628",
                backgroundImage: "radial-gradient(120% 95% at 50% 22%,rgba(40,68,112,.55),rgba(10,22,40,0) 70%),repeating-linear-gradient(135deg,rgba(255,255,255,.045) 0 14px,transparent 14px 28px)",
              }}
            >
              {/* ponytail: sin `priority`. Este bloque es hidden bajo lg, y el
                  preload gastaba ~37 KB de red movil en una imagen invisible. */}
              {VEHICLES.map(({ src, alt, delay }) => (
                <div
                  key={src}
                  className="hero-vlayer absolute inset-0"
                  style={{ animationDelay: `${delay}s` }}
                >
                  <Image
                    src={src}
                    alt={alt}
                    title={alt}
                    fill
                    className="object-contain"
                    style={{ objectPosition: "center 56%" }}
                    sizes="(min-width: 1024px) 40vw, 100vw"
                  />
                </div>
              ))}

              {/* stock pill */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-[rgba(13,31,60,.92)] px-3 py-2 rounded-full shadow-[0_6px_16px_rgba(0,0,0,.22)]">
                <span className="h-1.75 w-1.75 rounded-full bg-wa animate-pulse-ring shrink-0" />
                <span className="font-bold text-2.75 tracking-[.12em] uppercase text-white">+1.000 referencias en stock</span>
              </div>
            </div>

            {/* Parts float card */}
            <div
              className="absolute -bottom-7 -left-7 w-56.5 h-38 rounded-2xl overflow-hidden border border-white/14 shadow-[0_18px_36px_rgba(0,0,0,.45)] animate-float-bob"
              style={{
                background: "#13294a",
                backgroundImage: "radial-gradient(120% 100% at 50% 25%,rgba(40,68,112,.5),rgba(19,41,74,0) 72%),repeating-linear-gradient(135deg,rgba(255,255,255,.05) 0 12px,transparent 12px 24px)",
              }}
            >
              {PARTS.map(({ src, alt, delay }) => (
                <div
                  key={src}
                  className="hero-player absolute inset-3"
                  style={{ animationDelay: `${delay}s` }}
                >
                  <Image
                    src={src}
                    alt={alt}
                    title={alt}
                    fill
                    className="object-contain"
                    style={{ objectPosition: "center 56%" }}
                    sizes="200px"
                  />
                </div>
              ))}
            </div>

            {/* top-right badge */}
            <div
              className="reveal-pop absolute top-6 -right-4 bg-navy/70 backdrop-blur-sm border border-white/16 rounded-[14px] p-4 shadow-[0_12px_28px_rgba(0,0,0,.35)]"
              style={{ animationDelay: ".6s" }}
            >
              <p className="font-display font-bold text-white text-7.5 leading-none">&lt; 24 h</p>
              <p className="text-3 text-[#9fb0c8] mt-1.5">Asesoría por WhatsApp</p>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div
          className="reveal-up grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 pb-8 mt-8 border-t border-white/8"
          style={{ animationDelay: ".9s" }}
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
        </div>
      </div>
    </section>
  )
}
