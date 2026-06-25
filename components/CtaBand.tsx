import { MessageCircle } from "lucide-react"
import { getWhatsAppUrl } from "@/lib/constants"

export default function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-brand py-16 px-4 sm:px-6 lg:px-8">
      {/* white radial glow */}
      <div
        className="absolute -right-20 -top-32 w-130 h-130 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle,rgba(255,255,255,.14) 0%,rgba(255,255,255,0) 65%)" }}
        aria-hidden="true"
      />
      <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
        <div>
          <p className="text-2.75 font-semibold uppercase tracking-[.16em] text-white/80 mb-3">
            ¿No lo ves en el catálogo?
          </p>
          <h2 className="font-display font-bold text-white uppercase leading-[.96] text-[clamp(2.2rem,5vw,3.5rem)]">
            ¿No encuentras tu repuesto?
          </h2>
          <p className="mt-3.5 max-w-lg text-white/92 text-4.25 leading-[1.55]">
            Escríbenos con la marca, modelo y año de tu vehículo. Lo buscamos por ti y te respondemos
            en menos de 24 horas.
          </p>
        </div>
        <div className="flex flex-col gap-3 shrink-0">
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 bg-wa hover:brightness-105 text-[#062b15] font-bold text-base px-8 py-4 rounded-[13px] shadow-[0_16px_34px_rgba(0,0,0,.18)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#062b15]"
          >
            <MessageCircle size={20} />
            Escríbenos por WhatsApp
          </a>
          <a
            href="/catalogo"
            className="inline-flex items-center justify-center border border-white/60 hover:bg-white/10 text-white font-bold text-base px-8 py-4 rounded-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Ver catálogo completo
          </a>
        </div>
      </div>
    </section>
  )
}
